"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
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
  const remove = (id: string) =>
    setEntries(entries.filter((x) => x.id !== id));

  return (
    <div>
      <PageHeader
        title="Our Timeline"
        subtitle="The story of us"
        right={
          <button
            onClick={() => setOpen(true)}
            className="btn-primary !px-3.5 !py-2.5"
            aria-label="Add memory"
          >
            <Plus size={20} />
          </button>
        }
      />

      <section className="px-4">
        {sorted.length === 0 && (
          <GlassCard className="text-center text-rose-500/80">
            <p className="text-4xl">🌸</p>
            <p className="mt-2 font-semibold text-rose-900">No memories yet</p>
            <p className="text-sm">Tap + to add your first moment together.</p>
          </GlassCard>
        )}

        <div className="relative space-y-3 pl-6">
          {sorted.length > 0 && (
            <div className="absolute left-[9px] top-2 bottom-2 w-0.5 rounded-full bg-rose-200/70" />
          )}
          {sorted.map((e) => (
            <div key={e.id} className="relative">
              <span className="absolute -left-[1.15rem] top-5 h-3 w-3 rounded-full border-2 border-white bg-rose-400 shadow" />
              <GlassCard className="!py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">
                      {format(parseISO(e.date), "MMM d, yyyy")}
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-rose-900">
                      {e.emoji} {e.title}
                    </p>
                    {e.note && (
                      <p className="mt-1 text-sm text-rose-600/90">{e.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(e.id)}
                    className="text-rose-300 hover:text-rose-500"
                    aria-label="Delete"
                  >
                    <X size={18} />
                  </button>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {open && (
        <AddSheet
          onClose={() => setOpen(false)}
          onSave={(e) => {
            add(e);
            setOpen(false);
          }}
        />
      )}
    </div>
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/20 backdrop-blur-sm">
      <div className="glass-strong animate-pop-in w-full max-w-md rounded-t-[2rem] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rose-200" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-rose-900">Add a memory</h2>
          <button onClick={onClose} className="text-rose-400">
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened? ✨"
            className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-rose-900 placeholder:text-rose-300 outline-none"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-rose-900 outline-none"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A little note about it..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-rose-900 placeholder:text-rose-300 outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => setEmoji(em)}
                className={`h-10 w-10 rounded-2xl text-xl transition ${
                  emoji === em ? "bg-rose-500 scale-110" : "bg-white/60"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!title.trim()}
          onClick={() =>
            onSave({ id: makeId(), title: title.trim(), date, note: note.trim(), emoji })
          }
          className="btn-primary mt-5 w-full disabled:opacity-50"
        >
          Save memory 💕
        </button>
      </div>
    </div>
  );
}
