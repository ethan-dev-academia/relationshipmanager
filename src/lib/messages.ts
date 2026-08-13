"use client";

// Home "leave a note for each other" state. One short one-line note per person,
// synced across both devices via the couple sync foundation (useShared).

import { useCallback } from "react";
import { useShared } from "@/lib/couple";

/** Max characters allowed in a love note. */
export const MAX_LEN = 100;

/**
 * The two love notes, indexed to match `useIdentity().meIndex`.
 * `notes[i]` is person i's current one-liner; `updatedAt[i]` is when they last
 * changed it (ISO string, or "" if never set).
 */
export type Messages = {
  notes: [string, string];
  updatedAt: [string, string];
};

const INITIAL: Messages = { notes: ["", ""], updatedAt: ["", ""] };

/**
 * Live shared love-note state. Returns the current messages, a live-sync flag,
 * and a `setMyNote(index, text)` helper that trims to MAX_LEN, updates only the
 * given person's slot, and stamps its updatedAt.
 */
export function useMessages() {
  const [messages, setMessages, { synced }] = useShared<Messages>(
    "home.messages",
    INITIAL
  );

  const setMyNote = useCallback(
    (index: 0 | 1, text: string) => {
      const trimmed = text.slice(0, MAX_LEN);
      const notes: [string, string] = [...messages.notes];
      const updatedAt: [string, string] = [...messages.updatedAt];
      notes[index] = trimmed;
      updatedAt[index] = new Date().toISOString();
      setMessages({ notes, updatedAt });
    },
    [messages, setMessages]
  );

  return { messages, setMyNote, synced };
}
