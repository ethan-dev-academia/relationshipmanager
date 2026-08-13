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

type Cell = Side | null;

type Match = {
  matchId: string;
  board: Cell[];
  turn: Side;
  status: "playing" | "over";
  winner: Winner | null;
  winLine: number[];
};

function freshMatch(): Match {
  return {
    matchId: newMatchId(),
    board: Array(9).fill(null),
    turn: 0,
    status: "playing",
    winner: null,
    winLine: [],
  };
}

const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** Returns the winning side + line, or null if none. */
function findWin(board: Cell[]): { side: Side; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return { side: board[a] as Side, line };
    }
  }
  return null;
}

// Side 0 = X (You), side 1 = O (Partner).
const MARK: [string, string] = ["✕", "◯"];
const MARK_COLOR: [string, string] = ["#0a84ff", "#ff2f7a"];

export default function TicTacToePage() {
  const { finish } = useGameSession("tic-tac-toe");
  const { meIndex, myName, partnerName } = useIdentity();
  const { partnerOnline } = usePresence("game:tic-tac-toe");
  const [match, setMatch, { synced }] = useShared<Match>(
    "match.tic-tac-toe",
    freshMatch()
  );

  const mySide = meIndex;
  const over = match.status === "over";
  const locked = synced && partnerOnline;
  const waiting = synced && !partnerOnline;
  const canMove = !over && !waiting && (!locked || match.turn === mySide);

  const play = (i: number) => {
    if (!canMove || match.board[i] !== null) return;
    const next = match.board.slice();
    next[i] = match.turn;

    const win = findWin(next);
    if (win) {
      const winner = sideToPlayer(win.side);
      finish(winner, match.matchId);
      setMatch({ ...match, board: next, status: "over", winner, winLine: win.line });
      return;
    }
    if (next.every((c) => c !== null)) {
      finish("draw", match.matchId);
      setMatch({ ...match, board: next, status: "over", winner: "draw" });
      return;
    }
    setMatch({ ...match, board: next, turn: otherSide(match.turn) });
  };

  const newGame = () => setMatch(freshMatch());

  const reward = over && match.winner ? rewardFor(match.winner) : 0;

  return (
    <Screen title="Tic-Tac-Toe" backHref="/games" backLabel="Games">
      <div className="px-4 pt-2">
        <MatchStatusHeader
          mySide={mySide}
          turn={match.turn}
          status={match.status}
          synced={synced}
          partnerOnline={partnerOnline}
          sideLabels={[`X ${MARK[0]}`, `O ${MARK[1]}`]}
          sideColors={MARK_COLOR}
          onNewGame={newGame}
          myName={myName}
          partnerName={partnerName}
        />

        <BoardFrame maxWidth={340} className="grid grid-cols-3 gap-2">
          {match.board.map((cell, i) => {
            const isWin = match.winLine.includes(i);
            return (
              <button
                key={i}
                onClick={() => play(i)}
                disabled={!canMove || cell !== null}
                className="card flex aspect-square items-center justify-center text-[52px] font-bold leading-none transition active:opacity-80"
                style={{
                  color: cell !== null ? MARK_COLOR[cell] : "var(--label)",
                  background: isWin ? "var(--tint-bg)" : undefined,
                }}
                aria-label={`cell ${i + 1}`}
              >
                {cell !== null ? MARK[cell] : ""}
              </button>
            );
          })}
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
