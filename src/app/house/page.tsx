"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { useCurrency, COIN } from "@/lib/currency";

// Placeholder for the future "build our house together" feature.
// Coins earned from quizzes will be spent here on furniture/decorations.
const PREVIEW_ITEMS = [
  { emoji: "🛋️", name: "Cozy Sofa", cost: 40 },
  { emoji: "🪴", name: "Plant Corner", cost: 20 },
  { emoji: "🖼️", name: "Wall Art", cost: 30 },
  { emoji: "🛏️", name: "Comfy Bed", cost: 60 },
  { emoji: "🪟", name: "Big Window", cost: 50 },
  { emoji: "🕯️", name: "Candles", cost: 15 },
];

export default function HousePage() {
  const router = useRouter();
  const { balance } = useCurrency();

  return (
    <div>
      <PageHeader
        title="Our Dream House"
        subtitle="Build & decorate together"
        right={
          <button onClick={() => router.push("/games")} className="btn-glass !px-3 !py-2">
            <ArrowLeft size={18} />
          </button>
        }
      />

      <section className="px-4">
        <GlassCard strong className="text-center">
          <p className="text-5xl">🏡</p>
          <p className="mt-2 text-lg font-bold text-rose-900">Coming soon</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-rose-500/80">
            A 2D house you build together, Sims-style. Earn {COIN} from quizzes and
            games, then spend them here to decorate room by room.
          </p>
          <p className="mt-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600">
            Your shared balance: {COIN} {balance}
          </p>
        </GlassCard>
      </section>

      <section className="px-4 pt-5">
        <p className="section-title mb-2 px-1">Preview of the shop</p>
        <div className="grid grid-cols-3 gap-3">
          {PREVIEW_ITEMS.map((item) => (
            <GlassCard key={item.name} className="relative text-center !p-3">
              <span className="absolute right-2 top-2 text-rose-300">
                <Lock size={12} />
              </span>
              <p className="text-3xl">{item.emoji}</p>
              <p className="mt-1 text-xs font-semibold text-rose-900">
                {item.name}
              </p>
              <p className="text-[11px] font-bold text-rose-400">
                {COIN} {item.cost}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
