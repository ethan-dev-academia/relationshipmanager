"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Screen from "@/components/Screen";
import { Section } from "@/components/List";
import { getQuiz } from "@/lib/quizzes";
import { useCurrency, COIN } from "@/lib/currency";
import { useQuizProgress } from "@/lib/quizProgress";
import { useIdentity, useShared } from "@/lib/couple";

type Answers = Record<string, string>;
type View = "me" | "partner";

const MATCH_GREEN = "#34c759";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quiz = getQuiz(id);
  const { earn } = useCurrency();
  const { markComplete } = useQuizProgress();
  const { meIndex } = useIdentity();

  // Two answer slots, synced across both devices. Which slot is "yours" is
  // tied to who's signed in, so each phone writes to its own slot.
  const [slot0, setSlot0] = useShared<Answers>(`quiz.${id}.0`, {});
  const [slot1, setSlot1] = useShared<Answers>(`quiz.${id}.1`, {});

  const myAns = meIndex === 0 ? slot0 : slot1;
  const setMyAns = meIndex === 0 ? setSlot0 : setSlot1;
  const theirAns = meIndex === 0 ? slot1 : slot0;
  const setTheirAns = meIndex === 0 ? setSlot1 : setSlot0;

  const [view, setView] = useState<View>("me");

  const total = quiz?.questions.length ?? 0;
  const meDone = quiz ? Object.keys(myAns).length >= total : false;
  const partnerDone = quiz ? Object.keys(theirAns).length >= total : false;
  const bothDone = meDone && partnerDone;
  const revealed = quiz ? (quiz.revealAfterBoth ? bothDone : true) : false;

  const matches = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter(
      (q) => myAns[q.id] && myAns[q.id] === theirAns[q.id]
    ).length;
  }, [quiz, myAns, theirAns]);

  // Reward once both are done. Idempotent across devices: earn dedupes by the
  // stable id `quiz:<id>`, and markComplete is idempotent — so even if both
  // phones observe completion, coins + completion are counted exactly once.
  const rewardedRef = useRef(false);
  useEffect(() => {
    if (!quiz || !bothDone || rewardedRef.current) return;
    rewardedRef.current = true;
    earn(quiz.reward, `Completed "${quiz.title}"`, `quiz:${quiz.id}`);
    markComplete(quiz.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothDone, quiz]);

  if (!quiz) {
    return (
      <Screen title="Quiz" backHref="/quizzes" backLabel="Quizzes">
        <div className="px-4 pt-10 text-center">
          <p className="text-4xl">🤔</p>
          <p className="t-title3 c-label mt-2">Quiz not found</p>
          <p className="t-subhead c-label-2 mt-1">
            This quiz may have moved or no longer exists.
          </p>
        </div>
      </Screen>
    );
  }

  const current = view === "me" ? myAns : theirAns;
  const setCurrent = view === "me" ? setMyAns : setTheirAns;
  const answer = (qid: string, value: string) =>
    setCurrent({ ...current, [qid]: value });

  const optionCount = quiz.questions.filter((q) => q.options).length;

  return (
    <Screen title={quiz.title} backHref="/quizzes" backLabel="Quizzes">
      {/* You / Partner — you answer on your own phone; use Partner only for
          pass-and-play on a single device. */}
      <section className="px-4 pt-1">
        <div className="segmented">
          {(["me", "partner"] as View[]).map((v) => {
            const done = v === "me" ? meDone : partnerDone;
            return (
              <button
                key={v}
                data-active={view === v}
                onClick={() => setView(v)}
                className="segment"
              >
                {v === "me" ? "You" : "Partner"}
                {done && " ✓"}
              </button>
            );
          })}
        </div>
        <p className="t-footnote c-label-2 mt-2 text-center">
          Answers sync between your phones.{" "}
          {quiz.revealAfterBoth
            ? "Hidden until you both finish 🤫"
            : "They appear as you go."}
        </p>
      </section>

      {/* Questions */}
      <div className="space-y-5 pt-5">
        {quiz.questions.map((q, i) => {
          const myPick = myAns[q.id];
          const theirPick = theirAns[q.id];
          return (
            <section key={q.id} className="px-4">
              <p className="group-header uppercase">
                Question {i + 1} of {total}
              </p>
              <div className="card p-4">
                <p className="t-headline c-label">{q.prompt}</p>

                <div className="mt-3.5">
                  {q.options ? (
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const selected = current[q.id] === opt.label;
                        return (
                          <button
                            key={opt.label}
                            onClick={() => answer(q.id, opt.label)}
                            className="rounded-[12px] px-3 py-3 t-subhead font-semibold transition active:scale-95"
                            style={{
                              background: selected
                                ? "var(--tint)"
                                : "var(--fill)",
                              color: selected ? "#fff" : "var(--label)",
                              boxShadow: selected
                                ? "inset 0 1px 0 rgba(255,255,255,0.35)"
                                : undefined,
                            }}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      value={current[q.id] ?? ""}
                      onChange={(e) => answer(q.id, e.target.value)}
                      placeholder={view === "me" ? "Your answer…" : "Partner's answer…"}
                      className="w-full rounded-[12px] bg-fill px-3.5 py-3 t-body c-label outline-none placeholder:c-label-3"
                    />
                  )}
                </div>

                {revealed && (myPick || theirPick) && (
                  <div className="mt-3.5 rounded-[14px] bg-fill p-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <p className="t-caption c-label-2 truncate">You</p>
                        <p className="t-subhead c-label mt-0.5 font-semibold">
                          {myPick || "—"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="t-caption c-label-2 truncate">Partner</p>
                        <p className="t-subhead c-label mt-0.5 font-semibold">
                          {theirPick || "—"}
                        </p>
                      </div>
                    </div>
                    {q.options && myPick && theirPick && (
                      <div className="mt-2.5 border-t border-separator pt-2.5 text-center t-footnote font-semibold">
                        {myPick === theirPick ? (
                          <span style={{ color: MATCH_GREEN }}>💚 Match!</span>
                        ) : (
                          <span className="c-label-2">💔 Different</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Result */}
      <Section className="pt-6">
        {bothDone ? (
          <div className="p-6 text-center">
            <p className="text-4xl">🎉</p>
            <p className="t-title3 c-label mt-2">All done!</p>
            {optionCount > 0 && (
              <p className="t-subhead c-label-2 mt-1">
                You matched on {matches}/{optionCount} choices
              </p>
            )}
            <p className="mt-3 inline-block rounded-full bg-tint-bg px-3.5 py-1.5 t-subhead font-semibold c-tint">
              +{quiz.reward} {COIN} earned
            </p>
          </div>
        ) : (
          <div className="row">
            <span className="t-subhead c-label-2">
              {meDone && !partnerDone
                ? "Waiting for your partner to finish 💞"
                : "Answer all the questions to continue"}
            </span>
          </div>
        )}
      </Section>
    </Screen>
  );
}
