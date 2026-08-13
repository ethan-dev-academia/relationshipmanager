"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import { getQuiz } from "@/lib/quizzes";
import { usePersistent } from "@/lib/store";
import { useCurrency, COIN } from "@/lib/currency";

type Answers = Record<string, string>; // questionId -> answer
type Player = "me" | "partner";

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const quiz = getQuiz(id);
  const router = useRouter();
  const { earn } = useCurrency();

  const [meAns, setMeAns] = usePersistent<Answers>(`us.quiz.${id}.me`, {});
  const [partnerAns, setPartnerAns] = usePersistent<Answers>(
    `us.quiz.${id}.partner`,
    {}
  );
  const [rewarded, setRewarded] = usePersistent<boolean>(
    `us.quiz.${id}.rewarded`,
    false
  );
  const [turn, setTurn] = useState<Player>("me");

  const total = quiz?.questions.length ?? 0;
  const meDone = quiz ? Object.keys(meAns).length >= total : false;
  const partnerDone = quiz ? Object.keys(partnerAns).length >= total : false;
  const bothDone = meDone && partnerDone;

  const revealed = quiz ? (quiz.revealAfterBoth ? bothDone : true) : false;

  const matches = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter(
      (q) => meAns[q.id] && meAns[q.id] === partnerAns[q.id]
    ).length;
  }, [quiz, meAns, partnerAns]);

  if (!quiz) {
    return (
      <div className="px-4 pt-16 text-center text-rose-500">
        Quiz not found.
      </div>
    );
  }

  // Reward coins once, the first time both finish.
  if (bothDone && !rewarded) {
    earn(quiz.reward, `Completed "${quiz.title}"`);
    setRewarded(true);
  }

  const current = turn === "me" ? meAns : partnerAns;
  const setCurrent = turn === "me" ? setMeAns : setPartnerAns;

  const answer = (qid: string, value: string) =>
    setCurrent({ ...current, [qid]: value });

  return (
    <div>
      <PageHeader
        title={`${quiz.emoji} ${quiz.title}`}
        subtitle={quiz.description}
        right={
          <button onClick={() => router.push("/quizzes")} className="btn-glass !px-3 !py-2">
            <ArrowLeft size={18} />
          </button>
        }
      />

      {/* Player switch */}
      <section className="px-4">
        <div className="glass flex gap-1 rounded-2xl p-1">
          {(["me", "partner"] as Player[]).map((p) => {
            const done = p === "me" ? meDone : partnerDone;
            return (
              <button
                key={p}
                onClick={() => setTurn(p)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  turn === p ? "bg-rose-500 text-white" : "text-rose-600"
                }`}
              >
                {p === "me" ? "You" : "Partner"} {done && "✓"}
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-center text-xs text-rose-400">
          {quiz.revealAfterBoth
            ? "Answers stay hidden until you both finish 🤫"
            : "Answers reveal instantly"}
        </p>
      </section>

      {/* Questions */}
      <section className="mt-3 space-y-3 px-4">
        {quiz.questions.map((q, i) => {
          const myPick = meAns[q.id];
          const theirPick = partnerAns[q.id];
          const showCompare = revealed;

          return (
            <GlassCard key={q.id}>
              <p className="text-xs font-semibold text-rose-400">
                Q{i + 1} of {total}
              </p>
              <p className="mt-1 font-semibold text-rose-900">{q.prompt}</p>

              {/* Answer input for the active player */}
              <div className="mt-3">
                {q.options ? (
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const selected = current[q.id] === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => answer(q.id, opt.label)}
                          className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
                            selected
                              ? "border-rose-400 bg-rose-500 text-white"
                              : "border-white/60 bg-white/50 text-rose-700"
                          }`}
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
                    placeholder={`${turn === "me" ? "Your" : "Partner's"} answer...`}
                    className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5 text-rose-900 placeholder:text-rose-300 outline-none"
                  />
                )}
              </div>

              {/* Reveal / compare */}
              {showCompare && (myPick || theirPick) && (
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-white/40 p-3 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold text-rose-400">You</p>
                    <p className="font-medium text-rose-900">{myPick || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-rose-400">Partner</p>
                    <p className="font-medium text-rose-900">{theirPick || "—"}</p>
                  </div>
                  {q.options && myPick && theirPick && (
                    <div className="col-span-2 text-center text-xs font-semibold">
                      {myPick === theirPick ? (
                        <span className="text-green-500">💚 Match!</span>
                      ) : (
                        <span className="text-rose-400">💔 Different</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </section>

      {/* Result banner */}
      <section className="px-4 pt-4">
        {bothDone ? (
          <GlassCard strong className="text-center">
            <p className="text-3xl">🎉</p>
            <p className="mt-1 font-bold text-rose-900">All done!</p>
            {quiz.questions.some((q) => q.options) && (
              <p className="text-sm text-rose-500">
                You matched on {matches}/
                {quiz.questions.filter((q) => q.options).length} choices
              </p>
            )}
            <p className="mt-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600">
              +{quiz.reward} {COIN} earned
            </p>
          </GlassCard>
        ) : (
          <GlassCard className="flex items-center justify-center gap-2 text-sm text-rose-500">
            <Check size={16} />
            {meDone && !partnerDone && "Now pass to your partner 💞"}
            {!meDone && "Answer all questions to continue"}
            {meDone && partnerDone === false && ""}
          </GlassCard>
        )}
      </section>
    </div>
  );
}
