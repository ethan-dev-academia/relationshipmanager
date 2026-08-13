"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Circle, CheckCircle2, Trash2 } from "lucide-react";
import Screen from "@/components/Screen";
import { Section } from "@/components/List";
import IconTile from "@/components/IconTile";
import { usePersistent, makeId } from "@/lib/store";
import { useCurrency, COIN } from "@/lib/currency";
import {
  type Goal,
  type GoalCategory,
  CATEGORY_META,
  CATEGORY_ORDER,
  GOALS_KEY,
  isNumeric,
  progressPct,
  seedGoals,
} from "@/lib/goals";

const REWARD = 20;

export default function GoalsPage() {
  const [goals, setGoals] = usePersistent<Goal[]>(GOALS_KEY, []);
  const { earn } = useCurrency();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  // Seed sweet starter goals once, only when storage is genuinely empty.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(GOALS_KEY) === null) {
      setGoals(seedGoals(makeId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const award = (title: string) =>
    earn(REWARD, `Completed a goal: ${title}`);

  const patch = (id: string, fn: (g: Goal) => Goal) =>
    setGoals(goals.map((g) => (g.id === id ? fn(g) : g)));

  const adjust = (goal: Goal, delta: number) => {
    const target = goal.target ?? 0;
    const current = Math.max(0, Math.min(target, (goal.current ?? 0) + delta));
    const nowDone = target > 0 && current >= target;
    const justAwarded = nowDone && !goal.awarded;
    if (justAwarded) award(goal.title);
    patch(goal.id, (g) => ({
      ...g,
      current,
      done: nowDone,
      awarded: g.awarded || justAwarded,
    }));
  };

  const toggle = (goal: Goal) => {
    if (!goal.done) {
      const justAwarded = !goal.awarded;
      if (justAwarded) award(goal.title);
      patch(goal.id, (g) => ({
        ...g,
        done: true,
        current: isNumeric(g) ? g.target : g.current,
        awarded: g.awarded || justAwarded,
      }));
    } else {
      patch(goal.id, (g) => ({
        ...g,
        done: false,
        current:
          isNumeric(g) && (g.current ?? 0) >= (g.target as number)
            ? Math.max(0, (g.target as number) - 1)
            : g.current,
      }));
    }
  };

  const save = (goal: Goal) => {
    const exists = goals.some((g) => g.id === goal.id);
    setGoals(exists ? goals.map((g) => (g.id === goal.id ? goal : g)) : [...goals, goal]);
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
    setOpen(false);
    setEditing(null);
  };

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setOpen(true);
  };

  const active = goals
    .filter((g) => !g.done)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const completed = goals
    .filter((g) => g.done)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <Screen
      title="Goals"
      backHref="/"
      backLabel="Home"
      trailing={
        <button onClick={openNew} className="c-tint" aria-label="Add goal">
          <Plus size={26} strokeWidth={2.2} />
        </button>
      }
    >
      {goals.length === 0 ? (
        <div className="px-4 pt-16 text-center">
          <p className="text-5xl">🎯</p>
          <p className="t-title3 c-label mt-3">No goals yet</p>
          <p className="t-subhead c-label-2 mt-1">
            Dream a little — tap + to add something to chase together.
          </p>
          <button onClick={openNew} className="btn-filled mt-6">
            Add a goal
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <Section header={`Active · ${active.length}`} className="pt-1">
              {active.map((g) => (
                <GoalRow
                  key={g.id}
                  goal={g}
                  onEdit={() => openEdit(g)}
                  onToggle={() => toggle(g)}
                  onAdjust={(d) => adjust(g, d)}
                />
              ))}
            </Section>
          )}

          {completed.length > 0 && (
            <Section
              header={`Completed · ${completed.length}`}
              className={active.length > 0 ? "pt-4" : "pt-1"}
              footer={`You earn ${COIN} ${REWARD} the first time you complete a goal.`}
            >
              {completed.map((g) => (
                <GoalRow
                  key={g.id}
                  goal={g}
                  onEdit={() => openEdit(g)}
                  onToggle={() => toggle(g)}
                  onAdjust={(d) => adjust(g, d)}
                />
              ))}
            </Section>
          )}
        </>
      )}

      {open && (
        <GoalSheet
          goal={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
          onDelete={editing ? () => remove(editing.id) : undefined}
        />
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ Row --- */

function GoalRow({
  goal,
  onEdit,
  onToggle,
  onAdjust,
}: {
  goal: Goal;
  onEdit: () => void;
  onToggle: () => void;
  onAdjust: (delta: number) => void;
}) {
  const meta = CATEGORY_META[goal.category];
  const numeric = isNumeric(goal);
  const pct = progressPct(goal);
  const showCheckbox = !numeric || goal.done;

  return (
    <div
      className="row row-tap"
      style={{ "--sep-inset": "58px" } as React.CSSProperties}
    >
      <button
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Edit ${goal.title}`}
      >
        <IconTile color={meta.color}>
          <span className="text-[15px] leading-none">{meta.emoji}</span>
        </IconTile>
        <div className="min-w-0 flex-1">
          <div
            className="t-body truncate"
            style={{
              color: goal.done ? "var(--label-3)" : "var(--label)",
              textDecoration: goal.done ? "line-through" : "none",
            }}
          >
            {goal.title}
          </div>
          <div className="t-footnote c-label-2 truncate">
            {meta.label}
            {goal.note ? ` · ${goal.note}` : ""}
          </div>

          {numeric && !goal.done && (
            <div className="mt-2 flex items-center gap-2.5">
              <Stepper
                label="Decrease progress"
                onClick={() => onAdjust(-1)}
                disabled={(goal.current ?? 0) <= 0}
              >
                <Minus size={15} strokeWidth={2.6} />
              </Stepper>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-fill">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
                  style={{ width: `${pct}%`, background: "var(--tint)" }}
                />
              </div>
              <Stepper label="Increase progress" onClick={() => onAdjust(1)}>
                <Plus size={15} strokeWidth={2.6} />
              </Stepper>
              <span className="t-caption c-label-2 w-12 shrink-0 text-right tabular-nums">
                {goal.current ?? 0}/{goal.target}
              </span>
            </div>
          )}
        </div>
      </button>

      {showCheckbox && (
        <button
          onClick={onToggle}
          className="shrink-0 p-0.5"
          aria-label={goal.done ? "Mark not done" : "Mark done"}
        >
          {goal.done ? (
            <CheckCircle2
              size={26}
              strokeWidth={2}
              style={{ color: "var(--tint)" }}
              fill="var(--tint-bg)"
            />
          ) : (
            <Circle size={26} strokeWidth={2} className="c-label-3" />
          )}
        </button>
      )}
    </div>
  );
}

function Stepper({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill c-label transition active:scale-90 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- Sheet --- */

function GoalSheet({
  goal,
  onClose,
  onSave,
  onDelete,
}: {
  goal: Goal | null;
  onClose: () => void;
  onSave: (g: Goal) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [note, setNote] = useState(goal?.note ?? "");
  const [category, setCategory] = useState<GoalCategory>(
    goal?.category ?? "relationship"
  );
  const [target, setTarget] = useState(
    goal?.target != null ? String(goal.target) : ""
  );

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    const parsed = parseInt(target, 10);
    const hasTarget = target.trim() !== "" && Number.isFinite(parsed) && parsed > 0;

    if (goal) {
      // Edit: keep progress, clamp current to any new target.
      const current = hasTarget
        ? Math.min(goal.current ?? 0, parsed)
        : undefined;
      onSave({
        ...goal,
        title: t,
        note: note.trim() || undefined,
        category,
        target: hasTarget ? parsed : undefined,
        current,
        done: hasTarget ? (current ?? 0) >= parsed : goal.done,
      });
    } else {
      onSave({
        id: makeId(),
        title: t,
        note: note.trim() || undefined,
        category,
        target: hasTarget ? parsed : undefined,
        current: hasTarget ? 0 : undefined,
        done: false,
        awarded: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="animate-fade-in absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative w-full max-w-md rounded-t-[28px] bg-grouped pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-9 rounded-full bg-separator" />
        </div>
        {/* Nav bar */}
        <div className="flex items-center justify-between border-b border-separator px-4 py-3">
          <button onClick={onClose} className="t-body c-tint">
            Cancel
          </button>
          <span className="t-headline c-label">
            {goal ? "Edit Goal" : "New Goal"}
          </span>
          <button
            disabled={!title.trim()}
            onClick={submit}
            className="t-headline c-tint disabled:opacity-40"
          >
            {goal ? "Save" : "Add"}
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="list">
            <div className="row">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to do together?"
                className="w-full bg-transparent t-body c-label outline-none placeholder:c-label-3"
              />
            </div>
            <div className="row">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full bg-transparent t-body c-label outline-none placeholder:c-label-3"
              />
            </div>
            <div className="row">
              <span className="t-body c-label">Track progress</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 10"
                className="ml-auto w-24 bg-transparent t-body c-label text-right outline-none placeholder:c-label-3"
              />
            </div>
          </div>
          <p className="group-footer -mt-3">
            Add a target number to track this as progress (e.g. 10 date nights).
            Leave empty for a simple check-off goal.
          </p>

          <div>
            <p className="group-header uppercase">Category</p>
            <div className="flex flex-wrap gap-2 px-1">
              {CATEGORY_ORDER.map((key) => {
                const m = CATEGORY_META[key];
                const activeCat = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 t-subhead font-semibold transition"
                    style={{
                      background: activeCat ? "var(--tint)" : "var(--fill)",
                      color: activeCat ? "#fff" : "var(--label)",
                    }}
                  >
                    <span className="text-[15px] leading-none">{m.emoji}</span>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fill py-3.5 t-body font-semibold"
              style={{ color: "var(--red, #ff3b30)" }}
            >
              <Trash2 size={18} />
              Delete Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
