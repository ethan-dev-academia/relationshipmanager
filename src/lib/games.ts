"use client";

// ============================================================================
//  Games domain: registry, results log, live scoreboard, and the reward rules.
//
//  Everything here is localStorage-backed (demo mode) via usePersistent, but the
//  shapes are intentionally flat/serializable so this can later be swapped for a
//  Supabase table (`game_results`) + realtime subscription with no UI changes —
//  recordResult() would become an insert, useGameResults() a live query.
// ============================================================================

import { makeId } from "@/lib/store";
import { useShared } from "@/lib/couple";
import { useCurrency } from "@/lib/currency";

/** Who a turn/point belongs to. "me" = You (side 0), "partner" = partner (side 1). */
export type Player = "me" | "partner";

/**
 * Absolute side index for two-device play. Side is device-independent (it does
 * NOT mean "this device") so a shared board serialises the same for both phones.
 * Player 0 (side 0) = You/White/Red/X; player 1 (side 1) = Partner/Black/Yellow/O.
 */
export type Side = 0 | 1;

export const sideToPlayer = (s: Side): Player => (s === 0 ? "me" : "partner");
export const otherSide = (s: Side): Side => (s === 0 ? 1 : 0);

/** A fresh, stable identifier for one match. Also used to dedupe result/credit. */
export const newMatchId = (): string => makeId();

/** Outcome of a finished game. */
export type Winner = Player | "draw";

/** Slugs double as the route segment: /games/<slug>. */
export type GameSlug = "chess" | "connect-four" | "tic-tac-toe" | "checkers";

/** A single recorded game outcome — the atom the scoreboard is built from. */
export type GameResult = {
  id: string;
  game: GameSlug;
  winner: Winner;
  playedAt: string; // ISO timestamp
};

// ---------------------------------------------------------------------------
//  Currency economy
// ---------------------------------------------------------------------------
//  Coins flow into ONE shared pool ("our coins") from quizzes AND games, and are
//  spent on the Dream House. To keep the pool balanced we anchor game rewards to
//  the existing quiz rewards (15–30 per quiz) and the house prices (15–60 per
//  item — so a couple of activities buys one).
//
//  Game rewards are deliberately modest and per-FINISH only (never per-move), so
//  there's no way to farm coins by grinding turns:
//
//    • PARTICIPATION  = 6  → paid every time a game is played to the end,
//                            win or lose. Rewards playing together, not winning.
//    • WINNER_BONUS   = +4 → added on a decisive result  → 10 total.
//    • DRAW_BONUS     = +2 → added on a draw/stalemate    →  8 total.
//
//  Net per game: decisive = 10 🪙, draw = 8 🪙. Both sit in the target 5–15
//  band and stay below a single quiz, so quizzes remain the primary source and
//  games are a fun top-up. Abandoned games award nothing (result never recorded).
// ---------------------------------------------------------------------------
export const GAME_ECONOMY = {
  participation: 6,
  winnerBonus: 4,
  drawBonus: 2,
} as const;

/** Coins earned by the shared pool for a finished game with the given outcome. */
export function rewardFor(winner: Winner): number {
  return (
    GAME_ECONOMY.participation +
    (winner === "draw" ? GAME_ECONOMY.drawBonus : GAME_ECONOMY.winnerBonus)
  );
}

// ---------------------------------------------------------------------------
//  Game registry — drives the hub grid. `playable` games link to a real route;
//  the rest render as "Soon".
// ---------------------------------------------------------------------------
export type GameDef = {
  slug: GameSlug;
  title: string;
  emoji: string;
  color: string; // tile background
  description: string;
  playable: boolean;
};

export const GAMES: GameDef[] = [
  {
    slug: "chess",
    title: "Chess",
    emoji: "♟️",
    color: "#8e8e93",
    description: "Full rules, legal-move highlights.",
    playable: true,
  },
  {
    slug: "connect-four",
    title: "Connect Four",
    emoji: "🔴",
    color: "#ff3b30",
    description: "Drop, line up four, win.",
    playable: true,
  },
  {
    slug: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    emoji: "⭕",
    color: "#0a84ff",
    description: "Classic three-in-a-row.",
    playable: true,
  },
  {
    slug: "checkers",
    title: "Checkers",
    emoji: "⚫",
    color: "#af52de",
    description: "Jump, capture, king me.",
    playable: true,
  },
];

export function getGame(slug: string): GameDef | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/**
 * Reactive log of every recorded game result plus the action to append one.
 * Backed by `useShared("gameResults")` so standings are identical on both
 * devices (and still local-only in demo mode). storageKey stays "us.gameResults".
 *
 * recordResult() is the single write path. It is keyed by the match's stable
 * matchId (used as GameResult.id) and is idempotent: if both devices ever
 * observe the same finish, the result is only appended once.
 */
export function useGameResults() {
  const [results, setResults] = useShared<GameResult[]>("gameResults", []);

  const recordResult = (
    game: GameSlug,
    winner: Winner,
    matchId: string
  ): GameResult => {
    const existing = results.find((r) => r.id === matchId);
    if (existing) return existing; // dedupe: this match is already recorded
    const result: GameResult = {
      id: matchId,
      game,
      winner,
      playedAt: new Date().toISOString(),
    };
    setResults([...results, result]);
    return result;
  };

  return { results, recordResult };
}

export type Standings = {
  me: number; // decisive wins for You
  partner: number; // decisive wins for Partner
  draws: number;
  total: number; // total finished games
};

/** Fold a list of results into head-to-head standings. Pure — easy to test. */
export function computeStandings(results: GameResult[]): Standings {
  const s: Standings = { me: 0, partner: 0, draws: 0, total: results.length };
  for (const r of results) {
    if (r.winner === "me") s.me += 1;
    else if (r.winner === "partner") s.partner += 1;
    else s.draws += 1;
  }
  return s;
}

/** Live global standings across all games, recomputed from the results log. */
export function useScoreboard(): Standings & { results: GameResult[] } {
  const { results } = useGameResults();
  return { ...computeStandings(results), results };
}

/**
 * A game's single "the game just ended" entry point. Games call finish(winner)
 * exactly once (from an event handler, not render) when a terminal position is
 * reached; it records the result AND credits the shared coin pool, returning the
 * reward so the UI can celebrate it.
 *
 * `finish(winner, matchId)` is idempotent per match: the result (keyed by
 * matchId) and the coin credit (keyed by `game:<matchId>`) are each appended at
 * most once, so the finishing device records exactly one result even if the
 * partner's device also observes the finished match over sync.
 */
export function useGameSession(game: GameSlug) {
  const { recordResult } = useGameResults();
  const { earn } = useCurrency();

  const finish = (winner: Winner, matchId: string): number => {
    recordResult(game, winner, matchId);
    const reward = rewardFor(winner);
    const def = getGame(game);
    earn(reward, `Played ${def?.title ?? game}`, `game:${matchId}`);
    return reward;
  };

  return { finish };
}
