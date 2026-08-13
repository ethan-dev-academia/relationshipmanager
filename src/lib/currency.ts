"use client";

// Shared-pool currency ("our coins"). Earned from quizzes/activities, spent on
// the virtual house (coming soon). Backed by a ledger so history is auditable.

import { usePersistent, storeKeys, makeId, type CurrencyLedgerItem } from "@/lib/store";

export const COIN = "🪙";

export function useCurrency() {
  const [ledger, setLedger] = usePersistent<CurrencyLedgerItem[]>(
    storeKeys.ledger,
    []
  );

  const balance = ledger.reduce((sum, i) => sum + i.amount, 0);

  const earn = (amount: number, reason: string) =>
    setLedger([
      ...ledger,
      { id: makeId(), amount: Math.abs(amount), reason, at: new Date().toISOString() },
    ]);

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
