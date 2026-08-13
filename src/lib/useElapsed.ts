"use client";

import { useEffect, useState } from "react";
import { differenceInMonths } from "date-fns";
import { startDate } from "@/lib/date";

export type Elapsed = {
  ready: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  months: number;
  totalDays: number;
  totalHours: number;
  totalSeconds: number;
};

/**
 * Live elapsed time since the relationship start (midnight, local time),
 * ticking every second. `days/hours/minutes/seconds` are the calendar-style
 * breakdown; `total*` are cumulative counts.
 */
export function useElapsed(): Elapsed {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = startDate();
  const ms = now ? now.getTime() - start.getTime() : 0;
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  return {
    ready: Boolean(now),
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    months: now ? Math.max(0, differenceInMonths(now, start)) : 0,
    totalDays: Math.floor(totalSeconds / 86400),
    totalHours: Math.floor(totalSeconds / 3600),
    totalSeconds,
  };
}
