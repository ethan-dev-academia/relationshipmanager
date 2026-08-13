"use client";

import { useEffect, useMemo, useState } from "react";
import Screen from "@/components/Screen";
import { MatchStatusHeader, ResultCard, BoardFrame, BoardMat } from "@/components/games/GameChrome";
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

// American checkers. Side 0 = red (You, bottom, moves up), side 1 = black
// (Partner, top, moves down). Mandatory captures and multi-jumps are enforced.
// Kings move all four diagonals. A man reaching the far row is crowned and its
// turn ends.

type Piece = { side: Side; king: boolean };
type Board = (Piece | null)[][];
type Pos = [number, number];
type Move = { to: Pos; capture?: Pos };

type Match = {
  matchId: string;
  board: Board;
  turn: Side;
  status: "playing" | "over";
  winner: Winner | null;
  chainFrom: Pos | null; // piece mid multi-jump (turn stays with this side)
};

const N = 8;
const DISC: [string, string] = ["#e5473b", "#2b2b2e"]; // [red, black]

const inBounds = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;

function initialBoard(): Board {
  const b: Board = Array.from({ length: N }, () => Array(N).fill(null));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = { side: 1, king: false };
        else if (r > 4) b[r][c] = { side: 0, king: false };
      }
    }
  }
  return b;
}

function freshMatch(): Match {
  return {
    matchId: newMatchId(),
    board: initialBoard(),
    turn: 0,
    status: "playing",
    winner: null,
    chainFrom: null,
  };
}

function dirs(piece: Piece): Pos[] {
  const up: Pos[] = [
    [-1, -1],
    [-1, 1],
  ];
  const down: Pos[] = [
    [1, -1],
    [1, 1],
  ];
  if (piece.king) return [...up, ...down];
  return piece.side === 0 ? up : down;
}

function capturesFor(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const out: Move[] = [];
  for (const [dr, dc] of dirs(piece)) {
    const mr = r + dr;
    const mc = c + dc;
    const tr = r + 2 * dr;
    const tc = c + 2 * dc;
    if (!inBounds(tr, tc)) continue;
    const mid = board[mr]?.[mc];
    if (mid && mid.side !== piece.side && board[tr][tc] === null) {
      out.push({ to: [tr, tc], capture: [mr, mc] });
    }
  }
  return out;
}

function simpleMovesFor(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const out: Move[] = [];
  for (const [dr, dc] of dirs(piece)) {
    const tr = r + dr;
    const tc = c + dc;
    if (inBounds(tr, tc) && board[tr][tc] === null) out.push({ to: [tr, tc] });
  }
  return out;
}

function playerHasCapture(board: Board, side: Side): boolean {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (board[r][c]?.side === side && capturesFor(board, r, c).length)
        return true;
  return false;
}

function playerHasAnyMove(board: Board, side: Side): boolean {
  if (playerHasCapture(board, side)) return true;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (board[r][c]?.side === side && simpleMovesFor(board, r, c).length)
        return true;
  return false;
}

const key = (r: number, c: number) => `${r}-${c}`;

export default function CheckersPage() {
  const { finish } = useGameSession("checkers");
  const { meIndex, myName, partnerName } = useIdentity();
  const { partnerOnline } = usePresence("game:checkers");
  const [match, setMatch, { synced }] = useShared<Match>(
    "match.checkers",
    freshMatch()
  );
  const [selected, setSelected] = useState<Pos | null>(null);

  const { board, turn, chainFrom } = match;
  const mySide = meIndex;
  const over = match.status === "over";
  const locked = synced && partnerOnline;
  const waiting = synced && !partnerOnline;
  const canAct = !over && !waiting && (!locked || turn === mySide);

  // Drop any stale selection when the turn passes or a new game starts.
  useEffect(() => {
    setSelected(null);
  }, [match.turn, match.matchId]);

  const mustCapture = useMemo(
    () => playerHasCapture(board, turn),
    [board, turn]
  );

  // Which pieces the current side may move this turn.
  const movablePieces = useMemo(() => {
    const set = new Set<string>();
    if (chainFrom) {
      set.add(key(chainFrom[0], chainFrom[1]));
      return set;
    }
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++) {
        if (board[r][c]?.side !== turn) continue;
        const moves = mustCapture
          ? capturesFor(board, r, c)
          : simpleMovesFor(board, r, c);
        if (moves.length) set.add(key(r, c));
      }
    return set;
  }, [board, turn, mustCapture, chainFrom]);

  // Legal targets for the selected piece.
  const targets = useMemo(() => {
    const map = new Map<string, Move>();
    if (!selected) return map;
    const [r, c] = selected;
    const moves =
      mustCapture || chainFrom
        ? capturesFor(board, r, c)
        : simpleMovesFor(board, r, c);
    for (const m of moves) map.set(key(m.to[0], m.to[1]), m);
    return map;
  }, [board, selected, mustCapture, chainFrom]);

  const endTurn = (next: Board, mover: Side) => {
    const opp = otherSide(mover);
    if (!playerHasAnyMove(next, opp)) {
      const winner = sideToPlayer(mover);
      finish(winner, match.matchId);
      setMatch({ ...match, board: next, status: "over", winner, chainFrom: null });
      setSelected(null);
      return;
    }
    setMatch({ ...match, board: next, turn: opp, chainFrom: null });
    setSelected(null);
  };

  const onSquare = (r: number, c: number) => {
    if (!canAct) return;

    // Complete a move onto a highlighted target.
    if (selected && targets.has(key(r, c))) {
      const move = targets.get(key(r, c))!;
      const [sr, sc] = selected;
      const next = board.map((row) => row.slice());
      const piece = { ...next[sr][sc]! };
      next[sr][sc] = null;
      if (move.capture) next[move.capture[0]][move.capture[1]] = null;

      // Crown a man reaching the far row (ends the turn, even mid-chain).
      const crownRow = piece.side === 0 ? 0 : N - 1;
      const justCrowned = !piece.king && r === crownRow;
      if (justCrowned) piece.king = true;
      next[r][c] = piece;

      // Continue a multi-jump with the same piece if more captures exist.
      if (move.capture && !justCrowned && capturesFor(next, r, c).length) {
        setMatch({ ...match, board: next, chainFrom: [r, c] });
        setSelected([r, c]);
        return;
      }
      endTurn(next, turn);
      return;
    }

    // Select one of the movable pieces.
    if (movablePieces.has(key(r, c))) {
      setSelected(
        selected && selected[0] === r && selected[1] === c ? null : [r, c]
      );
    }
  };

  const newGame = () => {
    setMatch(freshMatch());
    setSelected(null);
  };

  const reward = over && match.winner ? rewardFor(match.winner) : 0;

  return (
    <Screen title="Checkers" backHref="/games" backLabel="Games">
      <div className="px-4 pt-2">
        <MatchStatusHeader
          mySide={mySide}
          turn={turn}
          status={match.status}
          synced={synced}
          partnerOnline={partnerOnline}
          sideLabels={["Red", "Black"]}
          sideColors={DISC}
          onNewGame={newGame}
          note={mustCapture && !over ? "Capture available — you must jump" : undefined}
          myName={myName}
          partnerName={partnerName}
        />

        <BoardFrame maxWidth={380}>
          <BoardMat>
            <div className="grid grid-cols-8 overflow-hidden rounded-2xl">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const dark = (r + c) % 2 === 1;
                const isSel = selected && selected[0] === r && selected[1] === c;
                const isTarget = targets.has(key(r, c));
                const canPick = canAct && movablePieces.has(key(r, c));
                let bg = dark ? "#7a5a3a" : "#e9d3b0";
                if (isSel) bg = "#7db36a";
                return (
                  <button
                    key={key(r, c)}
                    onClick={() => onSquare(r, c)}
                    className="relative flex aspect-square items-center justify-center"
                    style={{ background: bg }}
                    aria-label={key(r, c)}
                  >
                    {piece && (
                      <span
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: "72%",
                          height: "72%",
                          background: DISC[piece.side],
                          boxShadow:
                            "inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -3px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.4)",
                          outline: canPick
                            ? "2px solid rgba(255,255,255,0.7)"
                            : "none",
                        }}
                      >
                        {piece.king && (
                          <span
                            className="leading-none"
                            style={{ fontSize: "min(5vw, 20px)", color: "#ffd54a" }}
                          >
                            ♔
                          </span>
                        )}
                      </span>
                    )}
                    {isTarget && (
                      <span
                        className="pointer-events-none absolute h-[24%] w-[24%] rounded-full"
                        style={{ background: "rgba(30,120,20,0.55)" }}
                      />
                    )}
                  </button>
                );
              })
            )}
            </div>
          </BoardMat>
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
