"use client";

// Reusable chrome shared by every game: the board frame/mat, the "whose turn"
// banner, and the end-of-game result card with the coin reward + rematch. Kept
// presentational so each game owns its own rules/state. Everything here is
// theme-safe — surfaces/text use CSS vars so light + dark both read well; only
// the self-contained status chips use fixed accent colors on solid fills.

import { RotateCcw } from "lucide-react";
import { COIN } from "@/lib/currency";
import { MY_NAME, PARTNER_NAME } from "@/lib/config";
import type { Player, Side, Winner } from "@/lib/games";

/**
 * Absolute display names, indexed by player. Side 0 = me (names[0]),
 * side 1 = partner (names[1]) — this is device-independent, so it's correct on
 * both phones (used for the winner headline / check note). For device-relative
 * copy ("your turn") pass myName/partnerName from useIdentity() instead.
 */
export const PLAYER_NAME: Record<Player, string> = {
  me: MY_NAME,
  partner: PARTNER_NAME,
};

// Theme-neutral grey used for the waiting / game-over chips (solid fill + white
// text reads on both themes).
const NEUTRAL = "#8e8e93";

/**
 * Shared match header for two-device play. Presence-aware:
 *  • synced + partner offline → "Waiting for <partner>…"
 *  • synced + partner online  → turn is locked to your side ("Your turn" /
 *    "<partner>'s turn")
 *  • not synced (local demo)  → pass-and-play, shows whose side is to move
 *
 * `mySide` comes from useIdentity().meIndex; `turn` is the match's active side.
 * `myName`/`partnerName` are device-relative (from useIdentity) so the copy is
 * personal and correct on each phone. "New game" resets the shared match on
 * BOTH devices via `onNewGame`.
 */
export function MatchStatusHeader({
  mySide,
  turn,
  status,
  synced,
  partnerOnline,
  sideLabels,
  sideColors,
  onNewGame,
  note,
  myName,
  partnerName,
}: {
  mySide: Side;
  turn: Side;
  status: "playing" | "over";
  synced: boolean;
  partnerOnline: boolean;
  sideLabels: [string, string];
  sideColors: [string, string];
  onNewGame: () => void;
  note?: React.ReactNode;
  myName?: string;
  partnerName?: string;
}) {
  const locked = synced && partnerOnline; // enforce turn ownership only when live
  const waiting = synced && !partnerOnline;
  const them = partnerName ?? "your partner";

  let headline: string;
  let chipColor: string;
  if (waiting) {
    headline = `Waiting for ${them}…`;
    chipColor = NEUTRAL;
  } else if (status === "over") {
    headline = "Game over";
    chipColor = NEUTRAL;
  } else if (locked) {
    headline = turn === mySide ? "Your turn" : `${them}'s turn`;
    chipColor = sideColors[turn];
  } else {
    headline = `${sideLabels[turn]} to move`;
    chipColor = sideColors[turn];
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: chipColor,
            color: "#fff",
            boxShadow: "0 4px 12px -4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.9)" }}
          />
          <span className="t-subhead font-semibold">{headline}</span>
        </div>
        <button
          onClick={onNewGame}
          className="inline-flex items-center gap-1 rounded-full bg-fill px-3 py-1.5 t-footnote font-semibold c-label transition active:scale-95"
        >
          <RotateCcw size={13} strokeWidth={2.5} />
          New game
        </button>
      </div>

      <p className="t-footnote c-label-2">
        You&rsquo;re{" "}
        <span className="font-semibold" style={{ color: sideColors[mySide] }}>
          {sideLabels[mySide]}
        </span>
        {synced && (
          <>
            {" "}
            &middot;{" "}
            <span className={partnerOnline ? "c-tint" : "c-label-3"}>
              {partnerOnline
                ? `🟢 ${partnerName ?? "partner"} online`
                : `⚪️ ${partnerName ?? "partner"} offline`}
            </span>
          </>
        )}
      </p>
      {note && <p className="t-footnote c-label-2 text-center">{note}</p>}
    </div>
  );
}

/**
 * Consistent outer wrapper for every game board: centered, capped width, and a
 * uniform top margin so all four games share one layout rhythm.
 */
export function BoardFrame({
  children,
  maxWidth = 380,
  className = "",
}: {
  children: React.ReactNode;
  maxWidth?: number;
  className?: string;
}) {
  return (
    <div className={`mx-auto mt-5 w-full ${className}`} style={{ maxWidth }}>
      {children}
    </div>
  );
}

/**
 * Themed "board mat" — a calm, elevated panel that frames a board so the two
 * classic 8×8 games (chess, checkers) share identical premium framing that
 * works in light AND dark (surface = var(--card-2)).
 */
export function BoardMat({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[24px] p-2.5"
      style={{
        background: "var(--card-2)",
        border: "0.5px solid var(--separator)",
        boxShadow: "var(--elev)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Turn indicator. `tint` colors the active chip (defaults to the app pink) so a
 * game can echo its own piece colors. Shows a subtle "in check" style note slot.
 */
export function TurnBanner({
  turn,
  meColor,
  partnerColor,
  note,
}: {
  turn: Player;
  meColor?: string;
  partnerColor?: string;
  note?: React.ReactNode;
}) {
  const color = turn === "me" ? meColor : partnerColor;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{ background: color ?? "var(--tint)", color: "#fff" }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.9)" }}
        />
        <span className="t-subhead font-semibold">
          {PLAYER_NAME[turn]}&rsquo;s turn
        </span>
      </div>
      {note && <p className="t-footnote c-label-2">{note}</p>}
    </div>
  );
}

/**
 * End screen. Renders once the game is over. `winner` drives the headline (using
 * absolute names so it's identical on both devices); the reward + rematch come
 * from the parent so awarding stays in game logic.
 */
export function ResultCard({
  winner,
  reward,
  onRematch,
  detail,
}: {
  winner: Winner;
  reward: number;
  onRematch: () => void;
  detail?: React.ReactNode;
}) {
  const headline =
    winner === "draw" ? "It's a draw" : `${PLAYER_NAME[winner]} won!`;
  const emoji = winner === "draw" ? "🤝" : "🎉";

  return (
    <div className="card p-5 text-center">
      <p className="text-4xl">{emoji}</p>
      <p className="t-title3 c-label mt-2">{headline}</p>
      {detail && <p className="t-subhead c-label-2 mt-1">{detail}</p>}
      <p className="mt-3 inline-block rounded-full bg-tint-bg px-3 py-1 t-subhead font-semibold c-tint">
        +{reward} {COIN} to the pool
      </p>
      <button
        onClick={onRematch}
        className="btn-filled mt-4 flex w-full items-center justify-center gap-2 active:scale-[0.97]"
      >
        <RotateCcw size={18} strokeWidth={2.5} />
        Rematch
      </button>
    </div>
  );
}
