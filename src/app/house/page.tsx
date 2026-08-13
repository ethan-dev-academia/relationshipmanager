"use client";

import { Lock } from "lucide-react";
import Screen from "@/components/Screen";
import { useCurrency, COIN } from "@/lib/currency";

const PREVIEW_ITEMS = [
  { emoji: "🛋️", name: "Cozy Sofa", cost: 40 },
  { emoji: "🪴", name: "Plant Corner", cost: 20 },
  { emoji: "🖼️", name: "Wall Art", cost: 30 },
  { emoji: "🛏️", name: "Comfy Bed", cost: 60 },
  { emoji: "🪟", name: "Big Window", cost: 50 },
  { emoji: "🕯️", name: "Candles", cost: 15 },
];

export default function HousePage() {
  const { balance } = useCurrency();

  return (
    <Screen title="Dream House" backHref="/games" backLabel="Games">
      <section className="px-4 pt-1">
        <div
          className="card relative overflow-hidden p-6 text-center text-white"
          style={{
            background: "linear-gradient(150deg, #ff5c9a, var(--tint), #d81f74)",
            boxShadow: "var(--elev), inset 0 1px 0 rgba(255,255,255,.45)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.28), transparent)",
            }}
          />
          <div className="relative">
            <p className="text-6xl">🏡</p>
            <p className="t-title3 mt-3">Coming soon</p>
            <p className="t-subhead mx-auto mt-1.5 max-w-xs text-white/85">
              A 2D house you build together, Sims-style. Earn {COIN} from quizzes
              and games, then spend them here to decorate room by room.
            </p>
            <p className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 t-subhead font-semibold">
              Shared balance: {COIN} {balance}
            </p>
          </div>
        </div>
      </section>

      <p className="group-header uppercase px-5 pt-6">Preview of the shop</p>
      <section className="grid grid-cols-3 gap-3 px-4">
        {PREVIEW_ITEMS.map((item) => (
          <div key={item.name} className="card relative p-3 text-center">
            <span className="c-label-3 absolute right-2 top-2">
              <Lock size={12} />
            </span>
            <p className="text-3xl">{item.emoji}</p>
            <p className="t-caption c-label mt-1 font-semibold">{item.name}</p>
            <p className="t-caption c-tint font-semibold">
              {COIN} {item.cost}
            </p>
          </div>
        ))}
      </section>
    </Screen>
  );
}
