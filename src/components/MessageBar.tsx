"use client";

// Home love-note bar. Shows the partner's current one-liner prominently, and
// lets you tap-to-edit your own note inline. Synced across both devices.

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useIdentity } from "@/lib/couple";
import { useMessages, MAX_LEN } from "@/lib/messages";

export default function MessageBar({ className = "" }: { className?: string }) {
  const { meIndex, myName, partnerName } = useIdentity();
  const { messages, setMyNote } = useMessages();
  const partnerIndex: 0 | 1 = meIndex === 0 ? 1 : 0;

  const myNote = messages.notes[meIndex];
  const partnerNote = messages.notes[partnerIndex];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(myNote);
    setEditing(true);
  };

  const commit = () => {
    setMyNote(meIndex, draft.trim());
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <div className={`card px-4 py-3 ${className}`}>
      {/* Partner's note — the prominent line */}
      <p className="t-subhead c-label leading-snug">
        <span aria-hidden className="mr-1">💌</span>
        <span className="c-label-2">{partnerName}:</span>{" "}
        {partnerNote ? (
          <span className="font-semibold">“{partnerNote}”</span>
        ) : (
          <span className="c-label-3 italic">
            no note yet — send some love 💕
          </span>
        )}
      </p>

      {/* Your note — tap to edit inline */}
      <div className="mt-2 border-t border-separator pt-2">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={draft}
              maxLength={MAX_LEN}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={cancel}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancel();
                }
              }}
              placeholder={`Leave a note for ${partnerName} 💕`}
              className="min-w-0 flex-1 bg-transparent t-subhead c-label outline-none placeholder:c-label-3"
              aria-label="Your note"
            />
            <span className="t-caption c-label-3 tabular-nums">
              {draft.length}/{MAX_LEN}
            </span>
            {/* onMouseDown fires before the input's blur, so the save lands. */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
              className="t-footnote font-semibold c-tint"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex w-full items-center gap-1.5 text-left"
            aria-label="Edit your note"
          >
            <span className="t-footnote c-label-3 shrink-0">{myName}:</span>
            <span
              className={`t-subhead truncate ${myNote ? "c-label" : "c-label-3 italic"}`}
            >
              {myNote || `Leave a note for ${partnerName} 💕`}
            </span>
            <Pencil size={13} className="ml-auto shrink-0 c-tint" />
          </button>
        )}
      </div>
    </div>
  );
}
