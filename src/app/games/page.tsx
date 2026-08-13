"use client";

import Link from "next/link";
import { Minus, Plus, Home, Swords, Circle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { useCurrency, COIN } from "@/lib/currency";
import { usePersistent } from "@/lib/store";

type Scores = { me: number; partner: number };

export default function GamesPage() {
  const { balance } = useCurrency();
  const [scores, setScores] = usePersistent<Scores>("us.scores", {
    me: 0,
    partner: 0,
  });

  const bump = (who: keyof Scores, delta: number) =>
    setScores({ ...scores, [who]: Math.max(0, scores[who] + delta) });

  return (
    <div>
      <PageHeader
        title="Games"
        subtitle="Play free · earn coins from quizzes"
        right={
          <div className="glass-pill px-3.5 py-2 text-sm font-bold text-rose-700">
            {COIN} {balance}
          </div>
        }
      />

      {/* House callout — where coins are spent */}
      <section className="px-4">
        <Link href="/house">
          <GlassCard strong className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-rose-300/40 blur-2xl" />
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-2xl text-white">
                <Home size={24} />
              </span>
              <div>
                <p className="font-bold text-rose-900">Our Dream House</p>
                <p className="text-sm text-rose-500/80">
                  Spend {COIN} {balance} together to decorate · coming soon
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>
      </section>

      {/* Long-term score keeper */}
      <section className="px-4 pt-5">
        <p className="section-title mb-2 px-1">Lifetime scoreboard</p>
        <GlassCard>
          <div className="grid grid-cols-2 gap-3">
            {(["me", "partner"] as (keyof Scores)[]).map((who) => (
              <div key={who} className="text-center">
                <p className="text-sm font-semibold text-rose-500">
                  {who === "me" ? "You" : "Partner"}
                </p>
                <p className="my-1 text-5xl font-black tabular-nums text-rose-600">
                  {scores[who]}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => bump(who, -1)}
                    className="btn-glass !px-3 !py-1.5"
                    aria-label="minus"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    onClick={() => bump(who, 1)}
                    className="btn-primary !px-3 !py-1.5"
                    aria-label="plus"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-rose-400">
            Track wins across any game you play together — Pong, chess, whatever.
          </p>
        </GlassCard>
      </section>

      {/* Game library */}
      <section className="px-4 pt-5">
        <p className="section-title mb-2 px-1">Game library</p>
        <div className="grid grid-cols-2 gap-3">
          <GameCard emoji="🏓" title="Pong" hint="Long-term score" soon icon={<Circle size={18} />} />
          <GameCard emoji="♟️" title="Chess" hint="Play on your time" soon icon={<Swords size={18} />} />
          <GameCard emoji="🏠" title="Dream House" hint="Build together" soon href="/house" icon={<Home size={18} />} />
          <GameCard emoji="🎯" title="More soon" hint="Quizzes & minis" soon icon={<Plus size={18} />} />
        </div>
      </section>
    </div>
  );
}

function GameCard({
  emoji,
  title,
  hint,
  soon,
  href,
}: {
  emoji: string;
  title: string;
  hint: string;
  soon?: boolean;
  href?: string;
  icon?: React.ReactNode;
}) {
  const inner = (
    <GlassCard className="relative h-full">
      {soon && (
        <span className="absolute right-3 top-3 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-400">
          Soon
        </span>
      )}
      <p className="text-3xl">{emoji}</p>
      <p className="mt-2 font-bold text-rose-900">{title}</p>
      <p className="text-sm text-rose-500/80">{hint}</p>
    </GlassCard>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
