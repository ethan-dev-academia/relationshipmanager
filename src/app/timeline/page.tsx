"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import Screen from "@/components/Screen";
import { Section, Row } from "@/components/List";
import {
  usePersistent,
  storeKeys,
  makeId,
  type TimelineEntry,
} from "@/lib/store";

const EMOJIS = ["💖", "✈️", "🍜", "🎬", "🌅", "🎁", "🏖️", "☕", "🎂", "⭐"];

export default function TimelinePage() {
  const [entries, setEntries] = usePersistent<TimelineEntry[]>(
    storeKeys.timeline,
    []
  );
  const [open, setOpen] = useState(false);

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const add = (e: TimelineEntry) => setEntries([...entries, e]);
  const remove = (id: string) => setEntries(entries.filter((x) => x.id !== id));

  return (
    <Screen
      title="Timeline"
      trailing={
        <button
          onClick={() => setOpen(true)}
          className="c-tint"
          aria-label="Add memory"
        >
          <Plus size={26} strokeWidth={2.2} />
        </button>
      }
    >
      {sorted.length === 0 ? (
        <div className="px-4 pt-16 text-center">
          <p className="text-5xl">🌸</p>
          <p className="t-title3 c-label mt-3">No memories yet</p>
          <p className="t-subhead c-label-2 mt-1">
            Tap the + to add your first moment together.
          </p>
          <button onClick={() => setOpen(true)} className="btn-filled mt-6">
            Add a memory
          </button>
        </div>
      ) : (
        <Section className="pt-1">
          {sorted.map((e) => (
            <Row
              key={e.id}
              tile={
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-fill text-lg">
                  {e.emoji}
                </span>
              }
              title={e.title}
              subtitle={format(parseISO(e.date), "MMMM d, yyyy") + (e.note ? ` · ${e.note}` : "")}
              chevron={false}
              accessory={
                <button
                  onClick={() => remove(e.id)}
                  className="c-label-3 p-1"
                  aria-label="Delete"
                >
                  <Trash2 size={17} />
                </button>
              }
            />
          ))}
        </Section>
      )}

      {open && (
        <AddSheet
          onClose={() => setOpen(false)}
          onSave={(e) => {
            add(e);
            setOpen(false);
          }}
        />
      )}
    </Screen>
  );
}

function AddSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (e: TimelineEntry) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);

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
          <span className="t-headline c-label">New Memory</span>
          <button
            disabled={!title.trim()}
            onClick={() =>
              onSave({
                id: makeId(),
                title: title.trim(),
                date,
                note: note.trim(),
                emoji,
              })
            }
            className="t-headline c-tint disabled:opacity-40"
          >
            Add
          </button>
        </div>

        <div className="space-y-5 p-4">
          <div className="list">
            <div className="row">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What happened?"
                className="w-full bg-transparent t-body c-label outline-none placeholder:c-label-3"
              />
            </div>
            <div className="row">
              <span className="t-body c-label">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ml-auto bg-transparent t-body c-label outline-none"
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
          </div>

          <div>
            <p className="group-header uppercase">Icon</p>
            <div className="flex flex-wrap gap-2.5 px-1">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setEmoji(em)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition"
                  style={{
                    background: emoji === em ? "var(--tint)" : "var(--fill)",
                    transform: emoji === em ? "scale(1.08)" : "none",
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
