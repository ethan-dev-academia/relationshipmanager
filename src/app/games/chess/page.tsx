"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Square, type PieceSymbol, type Color } from "chess.js";
import Screen from "@/components/Screen";
import { MatchStatusHeader, ResultCard, BoardFrame, BoardMat, PLAYER_NAME } from "@/components/games/GameChrome";
import { useShared, useIdentity, usePresence } from "@/lib/couple";
import {
  useGameSession,
  rewardFor,
  newMatchId,
  type Side,
  type Winner,
} from "@/lib/games";

// White = side 0 (You), Black = side 1 (Partner). The board is rendered from
// White's perspective (rank 8 on top). FEN is already an absolute description of
// the position, so it serialises identically for both devices.

const GLYPH: Record<PieceSymbol, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
};

const sideOf = (c: Color): Side => (c === "w" ? 0 : 1);

type Move = { from: Square; to: Square };

type Match = {
  matchId: string;
  fen: string;
  lastMove: Move | null;
  status: "playing" | "over";
  winner: Winner | null;
};

function freshMatch(): Match {
  return {
    matchId: newMatchId(),
    fen: new Chess().fen(),
    lastMove: null,
    status: "playing",
    winner: null,
  };
}

function terminalWinner(game: Chess): Winner | null {
  if (game.isCheckmate()) {
    // Side to move is checkmated → the other side won.
    return game.turn() === "w" ? "partner" : "me";
  }
  if (game.isStalemate() || game.isDraw()) return "draw";
  return null;
}

type Pending = { from: Square; to: Square } | null;

// Chip colors for the status header (white side = grey, black side = charcoal).
const SIDE_COLOR: [string, string] = ["#6b6b70", "#1c1c1e"];

export default function ChessPage() {
  const { finish } = useGameSession("chess");
  const { meIndex, myName, partnerName } = useIdentity();
  const { partnerOnline } = usePresence("game:chess");
  const [match, setMatch, { synced }] = useShared<Match>(
    "match.chess",
    freshMatch()
  );

  const [selected, setSelected] = useState<Square | null>(null);
  const [promo, setPromo] = useState<Pending>(null);

  const game = useMemo(() => new Chess(match.fen), [match.fen]);
  const board = game.board();
  const turnSide = sideOf(game.turn());
  const turnPlayer = turnSide === 0 ? "me" : "partner";

  const mySide = meIndex;
  const over = match.status === "over";
  const locked = synced && partnerOnline;
  const waiting = synced && !partnerOnline;
  const canAct = !over && !waiting && (!locked || turnSide === mySide);

  // Clear per-device UI when an incoming move / new game changes the position.
  useEffect(() => {
    setSelected(null);
    setPromo(null);
  }, [match.fen, match.matchId]);

  // Legal destination squares for the currently selected piece.
  const legalTargets = useMemo(() => {
    if (!selected) return new Map<string, boolean>(); // square -> isCapture
    const map = new Map<string, boolean>();
    for (const m of game.moves({ square: selected, verbose: true })) {
      map.set(m.to, m.captured != null || m.flags.includes("e"));
    }
    return map;
  }, [game, selected]);

  const kingInCheckSquare = useMemo<string | null>(() => {
    if (!game.inCheck()) return null;
    for (const row of board) {
      for (const sq of row) {
        if (sq && sq.type === "k" && sq.color === game.turn()) return sq.square;
      }
    }
    return null;
  }, [game, board]);

  const applyMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    const next = new Chess(game.fen());
    try {
      next.move({ from, to, promotion: promotion ?? undefined });
    } catch {
      return; // illegal — ignore
    }
    const w = terminalWinner(next);
    if (w) {
      finish(w, match.matchId);
      setMatch({
        ...match,
        fen: next.fen(),
        lastMove: { from, to },
        status: "over",
        winner: w,
      });
    } else {
      setMatch({ ...match, fen: next.fen(), lastMove: { from, to } });
    }
    setSelected(null);
  };

  const onSquare = (square: Square) => {
    if (!canAct || promo) return;
    const piece = game.get(square);

    // Completing a move onto a highlighted target.
    if (selected && legalTargets.has(square)) {
      const moves = game.moves({ square: selected, verbose: true });
      const forSquare = moves.filter((m) => m.to === square);
      const needsPromo = forSquare.some((m) => m.promotion);
      if (needsPromo) {
        setPromo({ from: selected, to: square });
        return;
      }
      applyMove(selected, square);
      return;
    }

    // Selecting / reselecting one of the side-to-move's own pieces.
    if (piece && piece.color === game.turn()) {
      setSelected(square === selected ? null : square);
      return;
    }

    setSelected(null);
  };

  const newGame = () => {
    setMatch(freshMatch());
    setSelected(null);
    setPromo(null);
  };

  const reward = over && match.winner ? rewardFor(match.winner) : 0;

  const checkNote =
    !over && game.inCheck() ? `${PLAYER_NAME[turnPlayer]} is in check` : undefined;

  return (
    <Screen title="Chess" backHref="/games" backLabel="Games">
      <div className="px-4 pt-2">
        <MatchStatusHeader
          mySide={mySide}
          turn={turnSide}
          status={match.status}
          synced={synced}
          partnerOnline={partnerOnline}
          sideLabels={["White ♙", "Black ♟"]}
          sideColors={SIDE_COLOR}
          onNewGame={newGame}
          note={checkNote}
          myName={myName}
          partnerName={partnerName}
        />

        {/* Board */}
        <BoardFrame maxWidth={380}>
          <BoardMat>
            <div className="grid grid-cols-8 overflow-hidden rounded-2xl">
            {board.map((row, r) =>
              row.map((sq, c) => {
                const square = ("abcdefgh"[c] + (8 - r)) as Square;
                const light = (r + c) % 2 === 0;
                const isSelected = selected === square;
                const target = legalTargets.get(square);
                const isCheck = kingInCheckSquare === square;
                const isLast =
                  match.lastMove &&
                  (match.lastMove.from === square || match.lastMove.to === square);

                let bg = light ? "#efd9b5" : "#b58863";
                if (isLast) bg = light ? "#e7cf7a" : "#c8ab5e";
                if (isSelected) bg = "#7db36a";
                if (isCheck) bg = "#e57373";

                return (
                  <button
                    key={square}
                    onClick={() => onSquare(square)}
                    className="relative flex aspect-square items-center justify-center"
                    style={{ background: bg }}
                    aria-label={square}
                  >
                    {sq && (
                      <span
                        className="select-none leading-none"
                        style={{
                          fontSize: "min(9vw, 34px)",
                          color: sq.color === "w" ? "#fbfbf9" : "#1a1a1a",
                          textShadow:
                            sq.color === "w"
                              ? "0 1px 1px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.6)"
                              : "0 1px 1px rgba(255,255,255,0.25)",
                        }}
                      >
                        {GLYPH[sq.type]}
                      </span>
                    )}
                    {/* legal-move markers */}
                    {target === false && (
                      <span
                        className="pointer-events-none absolute h-[26%] w-[26%] rounded-full"
                        style={{ background: "rgba(30,90,20,0.4)" }}
                      />
                    )}
                    {target === true && (
                      <span
                        className="pointer-events-none absolute inset-[8%] rounded-full"
                        style={{ border: "3px solid rgba(30,90,20,0.5)" }}
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
            <ResultCard
              winner={match.winner}
              reward={reward}
              onRematch={newGame}
              detail={
                match.winner === "draw"
                  ? "Drawn position"
                  : `Checkmate by ${PLAYER_NAME[match.winner]}`
              }
            />
          </div>
        )}
      </div>

      {/* Promotion picker */}
      {promo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setPromo(null)}
        >
          <div
            className="card w-full max-w-[320px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="t-headline c-label text-center">Promote pawn to…</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {(["q", "r", "b", "n"] as PieceSymbol[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const { from, to } = promo;
                    setPromo(null);
                    applyMove(from, to, p);
                  }}
                  className="card flex aspect-square items-center justify-center text-[34px] c-label active:opacity-70"
                  aria-label={p}
                >
                  {GLYPH[p]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
