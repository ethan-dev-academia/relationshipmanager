"use client";

// Shared-pool currency ("our coins"). Earned from quizzes/activities/games, spent
// on the virtual house. Backed by a ledger so history is auditable.
//
// Storage is `useShared("currency.ledger")` so the pool syncs live between both
// devices when Supabase is configured, and falls back to local-only otherwise.
// The public API is unchanged: { balance, ledger, earn, spend }.
//
// `earn` accepts an optional stable `id`. Game credits pass a matchId-derived id
// so that if both devices ever observe the same finished match the ledger stays
// idempotent (an entry with that id is never appended twice). Quiz/goal earns are
// triggered on a single device, so they don't need one.

import { makeId, type CurrencyLedgerItem } from "@/lib/store";
import { useShared } from "@/lib/couple";

export const COIN = "🪙";

export function useCurrency() {
  const [ledger, setLedger] = useShared<CurrencyLedgerItem[]>(
    "currency.ledger",
    []
  );

  const balance = ledger.reduce((sum, i) => sum + i.amount, 0);

  const earn = (amount: number, reason: string, id?: string) => {
    if (id && ledger.some((i) => i.id === id)) return; // idempotent by stable id
    setLedger([
      ...ledger,
      {
        id: id ?? makeId(),
        amount: Math.abs(amount),
        reason,
        at: new Date().toISOString(),
      },
    ]);
  };

  const spend = (amount: number, reason: string): boolean => {
    if (balance < amount) return false;
    setLedger([
      ...ledger,
      { id: makeId(), amount: -Math.abs(amount), reason, at: new Date().toISOString() },
    ]);
    return true;
  };

  return { balance, ledger, earn, spend };
}
