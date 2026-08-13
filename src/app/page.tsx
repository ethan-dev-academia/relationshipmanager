"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Clock,
  Sparkles,
  Gamepad2,
  Heart,
  MapPin,
  ChevronRight,
  Images,
  Target,
  Settings,
} from "lucide-react";
import IconTile, { TILE } from "@/components/IconTile";
import MessageBar from "@/components/MessageBar";
import { useElapsed } from "@/lib/useElapsed";
import { nextMonthiversary, daysUntil } from "@/lib/date";
import { MY_NAME, PARTNER_NAME } from "@/lib/config";
import { distanceKm, formatDistance } from "@/lib/geo";
import { usePersistent, storeKeys, type LocationPing } from "@/lib/store";

export default function HomePage() {
  const t = useElapsed();
  const [nextLabel, setNextLabel] = useState("");
  const [nextDays, setNextDays] = useState<number | null>(null);

  useEffect(() => {
    const m = nextMonthiversary();
    if (m) {
      setNextLabel(m.label);
      setNextDays(daysUntil(m.date));
    }
  }, []);

  return (
    <div>
      {/* Settings gear */}
      <div className="safe-top flex justify-end px-4 pt-3">
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full active:scale-95"
          style={{ color: "var(--label-2)" }}
        >
          <Settings size={22} />
        </Link>
      </div>

      {/* Couple masthead — two profile photos + names */}
      <header className="flex items-start justify-center gap-4 px-4 pb-2 pt-4">
        <Avatar name={MY_NAME} tint="#ff5c9a" />
        <span className="pt-7 text-2xl">💗</span>
        <Avatar name={PARTNER_NAME} tint="#b95cf0" />
      </header>

      {/* Featured live "together for" card */}
      <section className="px-4 pt-7">
        <div
          className="card relative overflow-hidden p-6"
          style={{
            background:
              "linear-gradient(150deg, #ff5c9a 0%, var(--tint) 45%, #d81f74 100%)",
            boxShadow: "var(--elev), inset 0 1px 0 rgba(255,255,255,0.45)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.28), transparent)",
            }}
          />
          <div className="pointer-events-none absolute -right-6 -top-8 text-[120px] leading-none opacity-20">
            💗
          </div>

          <div className="flex items-center justify-between">
            <p className="t-subhead font-semibold text-white/80">Together for</p>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">
              {t.months} {t.months === 1 ? "month" : "months"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            <TimeCell value={t.ready ? t.days : 0} label="days" wide />
            <TimeCell value={t.ready ? t.hours : 0} label="hrs" />
            <TimeCell value={t.ready ? t.minutes : 0} label="min" />
            <TimeCell value={t.ready ? t.seconds : 0} label="sec" />
          </div>

          {nextDays !== null && (
            <p className="t-footnote mt-4 font-medium text-white/85">
              {nextDays === 0
                ? `🎉 Happy ${nextLabel} today!`
                : `${nextLabel} in ${nextDays} ${nextDays === 1 ? "day" : "days"} 💞`}
            </p>
          )}
        </div>
      </section>

      {/* Love note between the two of you */}
      <div className="px-4 pt-3">
        <MessageBar />
      </div>

      {/* Distance + next milestone pills */}
      <section className="grid grid-cols-2 gap-3 px-4 pt-3">
        <DistancePill />
        <Link href="/stats" className="active:scale-[0.98]">
          <div className="card flex h-full items-center gap-3 p-4">
            <IconTile color={TILE.orange} size={38}>
              <span className="text-base">✨</span>
            </IconTile>
            <div className="min-w-0">
              <p className="t-headline c-label truncate">
                {nextDays === null ? "—" : nextDays === 0 ? "Today!" : `${nextDays}d`}
              </p>
              <p className="t-caption c-label-2 truncate">
                to {nextLabel || "next milestone"}
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* Explore — custom feature cards */}
      <section className="pt-6">
        <p className="t-title3 c-label mb-2 px-5">Explore</p>
        <div className="grid grid-cols-2 gap-3 px-4">
          <FeatureCard
            href="/timeline"
            color={TILE.orange}
            icon={<Clock size={19} />}
            title="Timeline"
            hint="Our memories, in order"
          />
          <FeatureCard
            href="/quizzes"
            color={TILE.purple}
            icon={<Sparkles size={19} />}
            title="Quizzes"
            hint="Answer together"
          />
          <FeatureCard
            href="/games"
            color={TILE.green}
            icon={<Gamepad2 size={19} />}
            title="Games"
            hint="Play & build our house"
          />
          <FeatureCard
            href="/stats"
            color={TILE.pink}
            icon={<Heart size={19} fill="#fff" />}
            title="Our Stats"
            hint="Milestones & more"
          />
          <FeatureCard
            href="/goals"
            color={TILE.indigo}
            icon={<Target size={19} />}
            title="Goals"
            hint="Dreams we're chasing"
          />
          <FeatureCard
            color={TILE.teal}
            icon={<Images size={19} />}
            title="Album"
            hint="Photos of us"
            soon
          />
        </div>
      </section>
    </div>
  );
}

function Avatar({ name, tint }: { name: string; tint: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "♥";
  return (
    <div className="flex w-24 flex-col items-center gap-2">
      <div
        className="flex h-[76px] w-[76px] items-center justify-center rounded-full text-[30px] font-bold text-white"
        style={{
          background: `linear-gradient(150deg, ${tint}, var(--tint-press))`,
          boxShadow:
            "0 8px 22px -6px rgba(40,12,32,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
          border: "3px solid var(--card-2)",
        }}
      >
        {initial}
      </div>
      <span className="t-subhead c-label max-w-full truncate font-semibold">
        {name}
      </span>
    </div>
  );
}

function FeatureCard({
  href,
  color,
  icon,
  title,
  hint,
  soon,
}: {
  href?: string;
  color: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
  soon?: boolean;
}) {
  const inner = (
    <div className="card relative h-full p-4">
      <div className="flex items-center justify-between">
        <IconTile color={color} size={40}>
          {icon}
        </IconTile>
        {soon ? (
          <span className="rounded-full bg-fill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide c-label-3">
            Soon
          </span>
        ) : (
          <ChevronRight size={18} className="c-label-3" />
        )}
      </div>
      <p className="t-headline c-label mt-3">{title}</p>
      <p className="t-footnote c-label-2">{hint}</p>
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="active:scale-[0.98]">
      {inner}
    </Link>
  );
}

function DistancePill() {
  const [me] = usePersistent<LocationPing | null>(storeKeys.location + ".me", null);
  const [partner] = usePersistent<LocationPing | null>(
    storeKeys.location + ".partner",
    null
  );
  const km = me && partner ? distanceKm(me, partner) : null;

  return (
    <Link href="/stats#distance" className="active:scale-[0.98]">
      <div className="card flex h-full items-center gap-3 p-4">
        <IconTile color={TILE.blue} size={38}>
          <MapPin size={18} />
        </IconTile>
        <div className="min-w-0">
          <p className="t-headline c-label truncate">
            {km !== null ? formatDistance(km) : "Distance"}
          </p>
          <p className="t-caption c-label-2 truncate">
            {km !== null ? "apart right now" : "Tap to share"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TimeCell({
  value,
  label,
  wide,
}: {
  value: number;
  label: string;
  wide?: boolean;
}) {
  const text = wide ? String(value) : String(value).padStart(2, "0");
  return (
    <div className="rounded-2xl bg-white/15 py-2.5 text-center backdrop-blur-sm">
      <p className="text-[26px] font-bold leading-none tabular-nums text-white">
        {text}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/70">
        {label}
      </p>
    </div>
  );
}
