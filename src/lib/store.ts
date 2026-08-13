"use client";

// A tiny localStorage-backed store so every feature is interactive in demo mode
// (before Supabase is wired up). Swap these for Supabase queries later — the
// shapes match the SQL schema in /supabase/migrations.

import { useEffect, useState } from "react";

export type TimelineEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note?: string;
  emoji?: string;
};

export type CurrencyLedgerItem = {
  id: string;
  amount: number; // positive = earned, negative = spent
  reason: string;
  at: string; // ISO
};

export type LocationPing = {
  who: "me" | "partner";
  lat: number;
  lng: number;
  at: string; // ISO
};

const KEYS = {
  timeline: "us.timeline",
  ledger: "us.ledger",
  location: "us.location",
  quiz: "us.quiz",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

/** Generic reactive localStorage hook. */
export function usePersistent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setValue(read(key, fallback));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T) => {
    write(key, next);
    setValue(next);
  };

  return [value, update] as const;
}

export const storeKeys = KEYS;

/** Simple id generator that doesn't rely on crypto in older webviews. */
export function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
