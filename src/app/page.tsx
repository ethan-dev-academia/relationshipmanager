"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Sparkles, Gamepad2, Heart, MapPin, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { APP_NAME } from "@/lib/config";
import { daysTogether, nextMonthiversary, daysUntil } from "@/lib/date";

export default function HomePage() {
  const [days, setDays] = useState<number | null>(null);
  const [nextLabel, setNextLabel] = useState<string>("");
  const [nextDays, setNextDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysTogether());
    const m = nextMonthiversary();
    if (m) {
      setNextLabel(m.label);
      setNextDays(daysUntil(m.date));
    }
  }, []);

  return (
    <div>
      <header className="safe-top px-5 pt-8">
        <p className="section-title">Welcome to</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-rose-900">
          {APP_NAME} <span className="animate-float inline-block">💕</span>
        </h1>
      </header>

      {/* Hero: days together */}
      <section className="px-4 pt-5">
        <GlassCard strong className="relative overflow-hidden text-center">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-rose-300/40 blur-2xl" />
          <p className="section-title">Together for</p>
          <p className="mt-1 text-6xl font-black tabular-nums text-rose-600">
            {days ?? "—"}
          </p>
          <p className="text-lg font-semibold text-rose-500">
            {days === 1 ? "day" : "days"}
          </p>
          {nextDays !== null && (
            <p className="mt-3 text-sm text-rose-500/80">
              {nextDays === 0
                ? `🎉 Happy ${nextLabel}iversary today!`
                : `${nextDays} days until ${nextLabel} 💫`}
            </p>
          )}
        </GlassCard>
      </section>

      {/* Quick tiles */}
      <section className="grid grid-cols-2 gap-3 px-4 pt-4">
        <Tile href="/timeline" icon={Clock} label="Timeline" hint="Our memories" />
        <Tile href="/quizzes" icon={Sparkles} label="Quizzes" hint="Answer together" />
        <Tile href="/games" icon={Gamepad2} label="Games" hint="Earn & play" />
        <Tile href="/stats" icon={Heart} label="Our stats" hint="Milestones" />
      </section>

      {/* Distance shortcut */}
      <section className="px-4 pt-4">
        <Link href="/stats#distance">
          <GlassCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                <MapPin size={22} />
              </span>
              <div>
                <p className="font-semibold text-rose-900">Distance between us</p>
                <p className="text-sm text-rose-500/80">Share your location</p>
              </div>
            </div>
            <ChevronRight className="text-rose-300" />
          </GlassCard>
        </Link>
      </section>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof Clock;
  label: string;
  hint: string;
}) {
  return (
    <Link href={href}>
      <GlassCard className="h-full">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <Icon size={22} />
        </span>
        <p className="mt-3 font-bold text-rose-900">{label}</p>
        <p className="text-sm text-rose-500/80">{hint}</p>
      </GlassCard>
    </Link>
  );
}
