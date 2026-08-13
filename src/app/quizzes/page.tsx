"use client";

import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import Screen from "@/components/Screen";
import { Section, Row } from "@/components/List";
import IconTile, { TILE } from "@/components/IconTile";
import { QUIZZES, getQuiz, type QuizType, type Quiz } from "@/lib/quizzes";
import { useCurrency, COIN } from "@/lib/currency";
import { useQuizProgress } from "@/lib/quizProgress";

const TYPE_COLOR: Record<QuizType, string> = {
  deep: TILE.indigo,
  fun: TILE.orange,
  "truth-or-dare": TILE.red,
  party: TILE.purple,
  "guess-partner": TILE.pink,
  hobbies: TILE.teal,
  flirty: TILE.rose,
};

// Ordered groups so hundreds of questions stay browsable.
const GROUPS: { header: string; types: QuizType[] }[] = [
  { header: "Fun & Rapid Fire", types: ["fun"] },
  { header: "Guess Your Partner", types: ["guess-partner"] },
  { header: "Hobbies · League & F1", types: ["hobbies"] },
  { header: "Flirty & Sweet", types: ["flirty"] },
  { header: "Deep Talk", types: ["deep"] },
  { header: "Truth or Dare", types: ["truth-or-dare"] },
  { header: "Party Mode", types: ["party"] },
];

function metaLine(q: Quiz): string {
  return `${q.questions.length} questions · +${q.reward} ${COIN}${
    q.revealAfterBoth ? " · reveal after both" : " · instant"
  }`;
}

export default function QuizzesPage() {
  const { balance } = useCurrency();
  const { isComplete, suggestedId } = useQuizProgress();

  const suggested = suggestedId ? getQuiz(suggestedId) : undefined;
  const completed = QUIZZES.filter((q) => isComplete(q.id));

  return (
    <Screen
      title="Quizzes"
      trailing={
        <span className="t-footnote font-semibold c-label">
          {COIN} {balance}
        </span>
      }
    >
      {/* ── Suggested for today — hero ── */}
      <section className="px-4 pt-1">
        {suggested ? (
          <Link
            href={`/quizzes/${suggested.id}`}
            className="card relative block overflow-hidden p-5 transition active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(150deg, #ff5c9a 0%, var(--tint) 45%, #d81f74 100%)",
              boxShadow: "var(--elev), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            {/* top sheen */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.28), transparent)",
              }}
            />
            {/* oversized emoji watermark */}
            <div className="pointer-events-none absolute -right-5 -top-6 text-[110px] leading-none opacity-20">
              {suggested.emoji}
            </div>

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className="t-caption font-bold uppercase tracking-wide text-white/80">
                  ✨ Suggested for today
                </p>
                <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-1 t-caption font-semibold text-white">
                  +{suggested.reward} {COIN}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/20 text-[26px] leading-none">
                  {suggested.emoji}
                </span>
                <div className="min-w-0">
                  <p className="t-title3 truncate font-bold text-white">
                    {suggested.title}
                  </p>
                  <p className="t-footnote truncate text-white/80">
                    {suggested.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="t-footnote font-medium text-white/85">
                  {suggested.questions.length} questions ·{" "}
                  {suggested.revealAfterBoth ? "reveal after both" : "instant"}
                </span>
                <span
                  className="flex shrink-0 items-center gap-0.5 rounded-full bg-white py-1.5 pl-3.5 pr-2.5 t-subhead font-bold"
                  style={{ color: "var(--tint)" }}
                >
                  Play <ChevronRight size={16} strokeWidth={2.75} />
                </span>
              </div>
            </div>
          </Link>
        ) : (
          // All quizzes done — celebratory empty state for suggestions.
          <div className="card p-6 text-center">
            <p className="text-4xl">🎉</p>
            <p className="t-title3 c-label mt-2">You&apos;ve done them all!</p>
            <p className="t-subhead c-label-2 mt-1">
              Every quiz is complete. Replay any favorite below anytime.
            </p>
          </div>
        )}
      </section>

      {/* ── Categories (active quizzes only) ── */}
      {GROUPS.map((group) => {
        const items = QUIZZES.filter(
          (q) => group.types.includes(q.type) && !isComplete(q.id)
        );
        if (items.length === 0) return null;
        return (
          <Section key={group.header} className="pt-6" header={group.header}>
            {items.map((q) => (
              <Row
                key={q.id}
                href={`/quizzes/${q.id}`}
                tile={
                  <IconTile color={TYPE_COLOR[q.type]}>
                    <span className="text-[15px]">{q.emoji}</span>
                  </IconTile>
                }
                title={q.title}
                subtitle={metaLine(q)}
              />
            ))}
          </Section>
        );
      })}

      {/* ── Completed (de-emphasized, still replayable) ── */}
      {completed.length > 0 && (
        <Section
          className="pt-6"
          header={`Completed · ${completed.length}`}
          footer="Replay any of these anytime — completing a quiz on either phone marks it done for both of you."
        >
          {completed.map((q) => (
            <Row
              key={q.id}
              href={`/quizzes/${q.id}`}
              tile={
                <IconTile color={TILE.gray}>
                  <span className="text-[15px] opacity-90">{q.emoji}</span>
                </IconTile>
              }
              title={<span className="c-label-2">{q.title}</span>}
              subtitle={`${q.questions.length} questions · replayable`}
              accessory={
                <Check
                  size={18}
                  strokeWidth={3}
                  className="shrink-0"
                  style={{ color: "#34c759" }}
                />
              }
            />
          ))}
        </Section>
      )}
    </Screen>
  );
}
