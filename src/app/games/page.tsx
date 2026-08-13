"use client";

import { House as HouseIcon } from "lucide-react";
import Screen from "@/components/Screen";
import { Section, Row } from "@/components/List";
import IconTile, { TILE } from "@/components/IconTile";
import { useCurrency, COIN } from "@/lib/currency";
import { GAMES, useScoreboard } from "@/lib/games";
import { useIdentity, usePresence } from "@/lib/couple";

export default function GamesPage() {
  const { balance } = useCurrency();
  const { me, partner, draws, total } = useScoreboard();
  const { names } = useIdentity();
  const { partnerOnline } = usePresence("games");

  // Standings are absolute: side 0 = names[0], side 1 = names[1]. Both devices
  // show identical labels + numbers.
  const leader =
    me === partner ? null : me > partner ? names[0] : names[1];

  return (
    <Screen
      title="Games"
      trailing={
        <div className="flex items-center gap-2">
          <span
            className="t-caption c-label-2"
            title={partnerOnline ? "Partner online" : "Partner offline"}
          >
            {partnerOnline ? "🟢" : "⚪️"}
          </span>
          <span className="t-footnote font-semibold c-label">
            {COIN} {balance}
          </span>
        </div>
      }
    >
      {/* Live scoreboard — derived entirely from recorded game results */}
      <section className="px-4 pt-1">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="group-header !p-0 uppercase">Scoreboard</p>
            {leader ? (
              <span className="t-footnote font-semibold c-tint">
                {leader} leads
              </span>
            ) : (
              <span className="t-footnote c-label-2">
                {total === 0 ? "No games yet" : "All square"}
              </span>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { label: names[0], wins: me },
              { label: names[1], wins: partner },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="t-subhead c-label-2 font-medium">{s.label}</p>
                <p className="my-1 text-[46px] font-bold leading-none c-label">
                  {s.wins}
                </p>
                <p className="t-caption c-label-3">
                  {s.wins === 1 ? "win" : "wins"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-5 border-t border-separator pt-3">
            <span className="t-footnote c-label-2">
              {total} {total === 1 ? "game" : "games"}
            </span>
            <span className="t-footnote c-label-2">{draws} drawn</span>
          </div>
        </div>
        <p className="group-footer">
          Standings update live from every finished game. Win a game to earn{" "}
          {COIN} for your Dream House.
        </p>
      </section>

      {/* Playable games */}
      <Section
        header="Play together"
        className="pt-4"
        footer="Pass-and-play on one device — take turns, then hand it over."
      >
        {GAMES.map((g) => (
          <Row
            key={g.slug}
            tile={
              <IconTile color={g.color}>
                <span className="text-[15px]">{g.emoji}</span>
              </IconTile>
            }
            title={g.title}
            subtitle={g.description}
            href={g.playable ? `/games/${g.slug}` : undefined}
            value={
              g.playable ? undefined : (
                <span className="t-footnote c-label-3">Soon</span>
              )
            }
            chevron={g.playable}
          />
        ))}
      </Section>

      {/* Dream House builder — the coin sink */}
      <Section header="Build together" className="pt-6">
        <Row
          tile={
            <IconTile color={TILE.purple}>
              <HouseIcon size={17} />
            </IconTile>
          }
          title="Dream House builder"
          subtitle="Spend your coins, decorate room by room"
          href="/house"
        />
      </Section>
    </Screen>
  );
}
