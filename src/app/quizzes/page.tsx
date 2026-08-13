"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { QUIZZES } from "@/lib/quizzes";
import { useCurrency, COIN } from "@/lib/currency";

export default function QuizzesPage() {
  const { balance } = useCurrency();

  return (
    <div>
      <PageHeader
        title="Quizzes"
        subtitle="Answer together, earn coins"
        right={
          <div className="glass-pill px-3.5 py-2 text-sm font-bold text-rose-700">
            {COIN} {balance}
          </div>
        }
      />

      <section className="space-y-3 px-4">
        {QUIZZES.map((q) => (
          <Link key={q.id} href={`/quizzes/${q.id}`}>
            <GlassCard className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                  {q.emoji}
                </span>
                <div>
                  <p className="font-bold text-rose-900">{q.title}</p>
                  <p className="text-sm text-rose-500/80">{q.description}</p>
                  <p className="mt-1 text-xs font-semibold text-rose-400">
                    {q.questions.length} questions · +{q.reward} {COIN}
                    {q.revealAfterBoth ? " · reveal after both" : " · instant"}
                  </p>
                </div>
              </div>
              <ChevronRight className="shrink-0 text-rose-300" />
            </GlassCard>
          </Link>
        ))}
      </section>
    </div>
  );
}
