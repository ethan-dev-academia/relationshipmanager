"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw, Trophy, CalendarHeart } from "lucide-react";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { daysTogether, allMilestones, daysUntil, startDate } from "@/lib/date";
import { distanceKm, formatDistance, getCurrentPosition } from "@/lib/geo";
import { usePersistent, storeKeys, type LocationPing } from "@/lib/store";

export default function StatsPage() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => setDays(daysTogether()), []);

  const upcoming = useMemo(
    () => allMilestones().filter((m) => daysUntil(m.date) >= 0).slice(0, 8),
    []
  );

  return (
    <div>
      <PageHeader title="Our Stats" subtitle="Every milestone counts" />

      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            icon={<CalendarHeart size={20} />}
            value={days ?? "—"}
            label="days together"
          />
          <StatBox
            icon={<Trophy size={20} />}
            value={days !== null ? Math.floor(days / 30) : "—"}
            label="months (approx)"
          />
        </div>
        <p className="mt-2 px-1 text-xs text-rose-400/80">
          Since {format(startDate(), "MMMM d, yyyy")}
        </p>
      </section>

      {/* Distance */}
      <section id="distance" className="px-4 pt-5">
        <p className="section-title mb-2 px-1">Distance</p>
        <DistanceCard />
      </section>

      {/* Milestones */}
      <section className="px-4 pt-5">
        <p className="section-title mb-2 px-1">Upcoming milestones</p>
        <div className="space-y-2.5">
          {upcoming.map((m) => {
            const d = daysUntil(m.date);
            return (
              <GlassCard
                key={m.label + m.date.toISOString()}
                className="flex items-center justify-between !py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg ${
                      m.major ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-500"
                    }`}
                  >
                    {m.major ? "✨" : "🌙"}
                  </span>
                  <div>
                    <p className="font-semibold text-rose-900">{m.label}</p>
                    <p className="text-xs text-rose-500/80">
                      {format(m.date, "EEE, MMM d yyyy")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums text-rose-600">
                    {d === 0 ? "Today" : d}
                  </p>
                  {d !== 0 && <p className="text-[10px] text-rose-400">days</p>}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <GlassCard className="text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
        {icon}
      </span>
      <p className="mt-2 text-3xl font-black tabular-nums text-rose-600">{value}</p>
      <p className="text-xs font-medium text-rose-500/80">{label}</p>
    </GlassCard>
  );
}

function DistanceCard() {
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

  // Periodic background updates while the app is open (opt-in toggle).
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(share, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  const km =
    me && partner ? distanceKm(me, partner) : null;

  return (
    <GlassCard strong>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
            <MapPin size={22} />
          </span>
          <div>
            <p className="font-semibold text-rose-900">
              {km !== null ? formatDistance(km) : "— apart"}
            </p>
            <p className="text-xs text-rose-500/80">
              {partner
                ? "Both locations shared"
                : "Waiting for your partner to share"}
            </p>
          </div>
        </div>
        <button
          onClick={share}
          disabled={loading}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
            style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }}
          />
          Share
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between rounded-2xl bg-white/40 px-4 py-2.5">
        <span className="text-sm font-medium text-rose-700">
          Auto-update while app is open
        </span>
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
          className="h-5 w-5 accent-rose-500"
        />
      </label>

      {me && (
        <p className="mt-2 text-[11px] text-rose-400">
          Your location updated {format(new Date(me.at), "MMM d, h:mm a")}
        </p>
      )}
      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </GlassCard>
  );
}
