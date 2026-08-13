import {
  differenceInCalendarDays,
  addMonths,
  addYears,
  isAfter,
  isSameDay,
} from "date-fns";
import { RELATIONSHIP_START } from "@/lib/config";

export function startDate(): Date {
  const [y, m, d] = RELATIONSHIP_START.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole days since the relationship started (can be negative before the start). */
export function daysTogether(now: Date = new Date()): number {
  return differenceInCalendarDays(now, startDate());
}

export type Milestone = {
  label: string;
  date: Date;
  /** Whether this is a "major" milestone (6mo, 1yr, 1.5yr...) vs a monthiversary. */
  major: boolean;
};

/** Generate all monthiversaries + major milestones for the next few years. */
export function allMilestones(): Milestone[] {
  const start = startDate();
  const out: Milestone[] = [];

  // Monthiversaries for 5 years. Always expressed in months — never
  // fractional years (no "0.5 years"). Whole years get a year label too.
  for (let i = 1; i <= 60; i++) {
    const major = i % 6 === 0; // 6mo, 12mo, 18mo, 24mo...
    let label = `${i} month${i === 1 ? "" : "s"}`;
    if (i % 12 === 0) {
      const y = i / 12;
      label = `${y} year${y === 1 ? "" : "s"}`;
    }
    out.push({ label, date: addMonths(start, i), major });
  }
  return out;
}

/** The next upcoming monthiversary (monthly countdown). */
export function nextMonthiversary(now: Date = new Date()): Milestone | null {
  return (
    allMilestones().find((m) => isAfter(m.date, now) || isSameDay(m.date, now)) ??
    null
  );
}

/** The next upcoming MAJOR milestone (6mo, 1yr, ...). */
export function nextMajorMilestone(now: Date = new Date()): Milestone | null {
  return (
    allMilestones().find(
      (m) => m.major && (isAfter(m.date, now) || isSameDay(m.date, now))
    ) ?? null
  );
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return differenceInCalendarDays(date, now);
}

export { addYears };
