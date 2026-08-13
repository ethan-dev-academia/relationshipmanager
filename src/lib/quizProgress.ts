"use client";

// Quiz completion tracking + a stable "Suggested for today" pick.
//
// Completion is stored in the couple's cross-device shared store so that when
// either partner finishes a quiz, it shows as complete on BOTH phones. The
// daily suggestion is derived deterministically from the calendar date, so both
// devices independently agree on the same "quiz of the day" without syncing it.

import { useCallback, useMemo } from "react";
import { useShared } from "@/lib/couple";
import { QUIZZES } from "@/lib/quizzes";

/** Local calendar day as a stable seed string, e.g. "2026-8-12". */
function todaySeed(d: Date = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Small deterministic string hash (FNV-1a style). Stable across devices. */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // force unsigned
  return h >>> 0;
}

export type QuizProgress = {
  /** All completed quiz ids (synced across both devices). */
  completedIds: string[];
  /** Whether a given quiz id has been completed. */
  isComplete: (id: string) => boolean;
  /** Mark a quiz complete (idempotent — safe to call repeatedly). */
  markComplete: (id: string) => void;
  /**
   * The quiz suggested for today. Deterministic per calendar day: a date-seeded
   * hash chooses a starting index into the incomplete quizzes, so both phones
   * agree. When today's pick gets completed it rolls to the next incomplete one.
   * Null when every quiz is complete.
   */
  suggestedId: string | null;
};

export function useQuizProgress(): QuizProgress {
  const [done, setDone] = useShared<string[]>("quiz.completed", []);

  const isComplete = useCallback(
    (id: string) => done.includes(id),
    [done]
  );

  const markComplete = useCallback(
    (id: string) => {
      setDone(done.includes(id) ? done : [...done, id]);
    },
    [done, setDone]
  );

  const suggestedId = useMemo(() => {
    const incomplete = QUIZZES.filter((q) => !done.includes(q.id));
    if (incomplete.length === 0) return null;
    // Seed a stable index for today; as quizzes complete, the list shrinks and
    // the pick naturally rolls forward to another incomplete quiz.
    const seed = hashString(todaySeed());
    const idx = seed % incomplete.length;
    return incomplete[idx].id;
  }, [done]);

  return { completedIds: done, isComplete, markComplete, suggestedId };
}
