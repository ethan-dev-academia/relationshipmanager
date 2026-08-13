"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import Screen from "@/components/Screen";
import { Section, Row } from "@/components/List";
import IconTile, { TILE } from "@/components/IconTile";
import Switch from "@/components/Switch";
import { allMilestones, daysUntil, startDate } from "@/lib/date";
import { useElapsed } from "@/lib/useElapsed";
import { distanceKm, formatDistance, getCurrentPosition } from "@/lib/geo";
import { usePersistent, storeKeys, type LocationPing } from "@/lib/store";

export default function StatsPage() {
  const t = useElapsed();

  const upcoming = useMemo(
    () => allMilestones().filter((m) => daysUntil(m.date) >= 0).slice(0, 8),
    []
  );

  return (
    <Screen title="Our Stats">
      {/* Live "time together" — gradient hero (identical in light + dark) */}
      <section className="px-4 pt-1">
        <div
          className="card relative overflow-hidden p-5 text-white"
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
                "linear-gradient(180deg, rgba(255,255,255,.25), transparent)",
            }}
          />
          <div className="relative">
            <p className="t-subhead font-medium text-white/85">Time together</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <LiveCell value={t.ready ? t.days : 0} label="days" wide />
              <LiveCell value={t.ready ? t.hours : 0} label="hrs" />
              <LiveCell value={t.ready ? t.minutes : 0} label="min" />
              <LiveCell value={t.ready ? t.seconds : 0} label="sec" />
            </div>
          </div>
        </div>
      </section>

      {/* Totals */}
      <section className="grid grid-cols-3 gap-3 px-4 pt-3">
        <StatCard value={t.ready ? t.months : "—"} label="Months" />
        <StatCard value={t.ready ? t.totalDays.toLocaleString() : "—"} label="Total days" />
        <StatCard value={t.ready ? t.totalHours.toLocaleString() : "—"} label="Total hours" />
      </section>
      <p className="t-footnote c-label-2 px-4 pt-2">
        Since {format(startDate(), "MMMM d, yyyy")}
      </p>

      <div id="distance" />
      <Section header="Distance" className="pt-6">
        <DistanceRows />
      </Section>

      <Section header="Upcoming milestones" className="pt-6">
        {upcoming.map((m) => {
          const d = daysUntil(m.date);
          return (
            <Row
              key={m.label + m.date.toISOString()}
              tile={
                <IconTile color={m.major ? TILE.pink : TILE.purple}>
                  <span className="text-[15px]">{m.major ? "✨" : "🌙"}</span>
                </IconTile>
              }
              title={m.label}
              subtitle={format(m.date, "EEE, MMM d yyyy")}
              chevron={false}
              value={
                <span className="c-tint font-semibold">
                  {d === 0 ? "Today" : `${d}d`}
                </span>
              }
            />
          );
        })}
      </Section>
    </Screen>
  );
}

function StatCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="card p-3.5">
      <p className="text-[26px] font-bold leading-none tabular-nums c-tint">
        {value}
      </p>
      <p className="t-footnote c-label-2 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

function LiveCell({
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
    <div className="rounded-2xl bg-white/15 py-2.5 text-center">
      <p className="text-[24px] font-bold leading-none tabular-nums text-white">
        {text}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/75">
        {label}
      </p>
    </div>
  );
}

function DistanceRows() {
  const [me, setMe] = usePersistent<LocationPing | null>(
    storeKeys.location + ".me",
    null
  );
  const [partner] = usePersistent<LocationPing | null>(
    storeKeys.location + ".partner",
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);

  const share = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await getCurrentPosition();
      setMe({
        who: "me",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        at: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't get location");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(share, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const km = me && partner ? distanceKm(me, partner) : null;

  return (
    <>
      <Row
        tile={<IconTile color={TILE.blue}><MapPin size={17} /></IconTile>}
        title={km !== null ? formatDistance(km) + " apart" : "Not shared yet"}
        subtitle={
          error
            ? error
            : partner
              ? "Both locations shared"
              : "Waiting for your partner to share"
        }
        chevron={false}
        accessory={
          <button onClick={share} disabled={loading} className="btn-tinted">
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
              style={{ display: "inline", marginRight: 5, verticalAlign: "-2px" }}
            />
            Share
          </button>
        }
      />
      <Row
        title="Auto-update while open"
        chevron={false}
        accessory={<Switch checked={auto} onChange={setAuto} />}
      />
      {me && (
        <Row
          title={
            <span className="t-footnote c-label-2">
              Your location updated {format(new Date(me.at), "MMM d, h:mm a")}
            </span>
          }
          chevron={false}
        />
      )}
    </>
  );
}
