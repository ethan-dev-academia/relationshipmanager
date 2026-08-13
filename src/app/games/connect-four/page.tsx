"use client";

import Screen from "@/components/Screen";
import { MatchStatusHeader, ResultCard, BoardFrame } from "@/components/games/GameChrome";
import { useShared, useIdentity, usePresence } from "@/lib/couple";
import {
  useGameSession,
  rewardFor,
  sideToPlayer,
  otherSide,
  newMatchId,
  type Side,
  type Winner,
} from "@/lib/games";

const ROWS = 6;
const COLS = 7;
type Cell = Side | null;
type Board = Cell[][]; // [row][col], row 0 = top

type Match = {
  matchId: string;
  board: Board;
  turn: Side;
  status: "playing" | "over";
  winner: Winner | null;
  winCells: string[]; // "r-c" keys (arrays serialise; Sets don't)
};

// Side 0 = red (You), side 1 = yellow (Partner).
const DISC_COLOR: [string, string] = ["#ff3b30", "#ffcc00"];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

function freshMatch(): Match {
  return {
    matchId: newMatchId(),
    board: emptyBoard(),
    turn: 0,
    status: "playing",
    winner: null,
    winCells: [],
  };
}

/** Lowest empty row in a column, or -1 if the column is full. */
function dropRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

const DIRS: [number, number][] = [
  [0, 1], // →
  [1, 0], // ↓
  [1, 1], // ↘
  [1, -1], // ↙
];

/** Four-in-a-row through (r,c). Returns the winning cells or null. */
function findWinFrom(
  board: Board,
  r: number,
  c: number
): [number, number][] | null {
  const side = board[r][c];
  if (side === null) return null;
  for (const [dr, dc] of DIRS) {
    const cells: [number, number][] = [[r, c]];
    for (let k = 1; k < 4; k++) {
      const nr = r + dr * k;
      const nc = c + dc * k;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
      if (board[nr][nc] !== side) break;
      cells.push([nr, nc]);
    }
    for (let k = 1; k < 4; k++) {
      const nr = r - dr * k;
      const nc = c - dc * k;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
      if (board[nr][nc] !== side) break;
      cells.push([nr, nc]);
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}

export default function ConnectFourPage() {
  const { finish } = useGameSession("connect-four");
  const { meIndex, myName, partnerName } = useIdentity();
  const { partnerOnline } = usePresence("game:connect-four");
  const [match, setMatch, { synced }] = useShared<Match>(
    "match.connect-four",
    freshMatch()
  );

  const mySide = meIndex;
  const over = match.status === "over";
  const locked = synced && partnerOnline;
  const waiting = synced && !partnerOnline;
  const canMove = !over && !waiting && (!locked || match.turn === mySide);

  const winCells = new Set(match.winCells);

  const drop = (col: number) => {
    if (!canMove) return;
    const row = dropRow(match.board, col);
    if (row === -1) return;

    const next = match.board.map((r) => r.slice());
    next[row][col] = match.turn;

    const win = findWinFrom(next, row, col);
    if (win) {
      const winner = sideToPlayer(match.turn);
      finish(winner, match.matchId);
      setMatch({
        ...match,
        board: next,
        status: "over",
        winner,
        winCells: win.map(([r, c]) => `${r}-${c}`),
      });
      return;
    }
    if (next.every((r) => r.every((cell) => cell !== null))) {
      finish("draw", match.matchId);
      setMatch({ ...match, board: next, status: "over", winner: "draw" });
      return;
    }
    setMatch({ ...match, board: next, turn: otherSide(match.turn) });
  };

  const newGame = () => setMatch(freshMatch());
  const reward = over && match.winner ? rewardFor(match.winner) : 0;

  return (
    <Screen title="Connect Four" backHref="/games" backLabel="Games">
      <div className="px-4 pt-2">
        <MatchStatusHeader
          mySide={mySide}
          turn={match.turn}
          status={match.status}
          synced={synced}
          partnerOnline={partnerOnline}
          sideLabels={["Red", "Yellow"]}
          sideColors={DISC_COLOR}
          onNewGame={newGame}
          note="Tap a column to drop your disc"
          myName={myName}
          partnerName={partnerName}
        />

        <BoardFrame maxWidth={360}>
          <div
            className="rounded-2xl p-2.5"
            style={{
              background: "linear-gradient(180deg, #2a7fe0, #1f6fd6)",
              boxShadow: "var(--elev), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: COLS }, (_, col) => (
                <button
                  key={col}
                  onClick={() => drop(col)}
                  disabled={!canMove || dropRow(match.board, col) === -1}
                  className="flex flex-col gap-1 rounded-lg py-0.5 active:bg-white/10 disabled:opacity-100"
                  aria-label={`drop in column ${col + 1}`}
                >
                  {Array.from({ length: ROWS }, (_, row) => {
                    const cell = match.board[row][col];
                    const isWin = winCells.has(`${row}-${col}`);
                    return (
                      <span
                        key={row}
                        className="aspect-square w-full rounded-full transition"
                        style={{
                          background:
                            cell !== null
                              ? DISC_COLOR[cell]
                              : "rgba(255,255,255,0.92)",
                          boxShadow: isWin
                            ? "0 0 0 3px #fff, inset 0 2px 3px rgba(0,0,0,0.25)"
                            : "inset 0 2px 3px rgba(0,0,0,0.25)",
                        }}
                      />
                    );
                  })}
                </button>
              ))}
            </div>
          </div>
        </BoardFrame>

        {over && match.winner && (
          <div className="mt-6">
            <ResultCard winner={match.winner} reward={reward} onRematch={newGame} />
          </div>
        )}
      </div>
    </Screen>
  );
}
