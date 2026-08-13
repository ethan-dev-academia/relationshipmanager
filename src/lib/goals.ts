"use client";

// Shared goals the couple tracks together. localStorage-backed (demo mode) via
// the generic usePersistent hook, keyed under "us.goals". Shapes are kept flat
// so they map cleanly onto a future Supabase table.

import { TILE } from "@/components/IconTile";

export type GoalCategory =
  | "relationship"
  | "travel"
  | "lol"
  | "f1"
  | "fitness"
  | "finance"
  | "fun"
  | "other";

export type Goal = {
  id: string;
  title: string;
  note?: string;
  category: GoalCategory;
  target?: number; // present => numeric/progress goal
  current?: number; // progress toward target
  done: boolean;
  createdAt: string; // ISO
  awarded?: boolean; // guard so a coin reward is granted only once
};

export type CategoryMeta = {
  label: string;
  emoji: string;
  color: string; // a TILE color
};

/** Rendering metadata for every category (label, emoji, tile color). */
export const CATEGORY_META: Record<GoalCategory, CategoryMeta> = {
  relationship: { label: "Us", emoji: "💖", color: TILE.pink },
  travel: { label: "Travel", emoji: "✈️", color: TILE.blue },
  lol: { label: "League", emoji: "🎮", color: TILE.teal },
  f1: { label: "Formula 1", emoji: "🏎️", color: TILE.red },
  fitness: { label: "Fitness", emoji: "💪", color: TILE.green },
  finance: { label: "Finance", emoji: "💰", color: TILE.orange },
  fun: { label: "Fun", emoji: "🎉", color: TILE.purple },
  other: { label: "Other", emoji: "⭐", color: TILE.gray },
};

/** Category keys in display order (for pickers / grouping). */
export const CATEGORY_ORDER: GoalCategory[] = [
  "relationship",
  "travel",
  "lol",
  "f1",
  "fitness",
  "finance",
  "fun",
  "other",
];

/** A numeric goal is one with a positive target to progress toward. */
export function isNumeric(goal: Goal): boolean {
  return typeof goal.target === "number" && goal.target > 0;
}

/** Progress percentage (0–100), clamped. Non-numeric goals report 0/100. */
export function progressPct(goal: Goal): number {
  if (!isNumeric(goal)) return goal.done ? 100 : 0;
  const target = goal.target as number;
  const current = goal.current ?? 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

/** Whether a numeric goal has reached (or passed) its target. */
export function isComplete(goal: Goal): boolean {
  if (isNumeric(goal)) return (goal.current ?? 0) >= (goal.target as number);
  return goal.done;
}

/** localStorage key for the shared goals list. */
export const GOALS_KEY = "us.goals";

/** Sweet, specific starter goals so the space isn't empty on first load. */
export function seedGoals(makeId: () => string): Goal[] {
  const now = Date.now();
  const at = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
  return [
    {
      id: makeId(),
      title: "Climb to Gold together in League",
      note: "5 divisions to go — duo every ranked night 🎮",
      category: "lol",
      target: 5,
      current: 1,
      done: false,
      createdAt: at(6),
    },
    {
      id: makeId(),
      title: "10 date nights this season",
      note: "Cozy in or a night out — just us",
      category: "relationship",
      target: 10,
      current: 3,
      done: false,
      createdAt: at(5),
    },
    {
      id: makeId(),
      title: "Watch an F1 race weekend together",
      note: "Lights out and away we go 🏎️",
      category: "f1",
      done: false,
      createdAt: at(4),
    },
    {
      id: makeId(),
      title: "Plan a weekend trip",
      note: "Somewhere new, just the two of us",
      category: "travel",
      done: false,
      createdAt: at(3),
    },
    {
      id: makeId(),
      title: "Cook a new recipe each month",
      note: "12 dishes we've never made before",
      category: "fun",
      target: 12,
      current: 2,
      done: false,
      createdAt: at(2),
    },
    {
      id: makeId(),
      title: "Save for our next adventure",
      note: "Little by little into the trip fund",
      category: "finance",
      target: 1000,
      current: 250,
      done: false,
      createdAt: at(1),
    },
  ];
}
