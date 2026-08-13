"use client";

// Long-distance foundation: shared state + presence + device identity.
//
// `useShared` is a drop-in synced replacement for usePersistent: it keeps a
// value in localStorage AND, when Supabase is configured, mirrors it live to
// the partner's device over a Realtime channel (broadcast + best-effort DB
// persistence for late joiners). When Supabase is NOT configured it behaves
// exactly like local state, so the app still works in demo / pass-and-play.

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MY_NAME, PARTNER_NAME } from "@/lib/config";

/** Stable per-couple room id. It's just the two of them, so one room. */
export const COUPLE_ID =
  process.env.NEXT_PUBLIC_COUPLE_ID ?? "our-room";

/** Random per-tab sender id, so a device ignores its own broadcasts. */
function tabId(): string {
  return Math.random().toString(36).slice(2);
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Which of the two people this device belongs to (0 = first name, 1 = second).
 * Stored locally so each phone remembers who it is. Drives message ownership
 * and game side assignment for long-distance play.
 */
export function useIdentity() {
  const [meIndex, setMeIndexState] = useState<0 | 1>(0);

  useEffect(() => {
    setMeIndexState(readLocal<0 | 1>("us.meIndex", 0));
  }, []);

  const setMeIndex = useCallback((i: 0 | 1) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("us.meIndex", JSON.stringify(i));
    setMeIndexState(i);
  }, []);

  const names: [string, string] = [MY_NAME, PARTNER_NAME];
  return {
    meIndex,
    setMeIndex,
    names,
    myName: names[meIndex],
    partnerName: names[meIndex === 0 ? 1 : 0],
  };
}

/**
 * Live shared value across both devices. Same signature as usePersistent.
 * `[value, setValue, meta]` where meta.synced tells you if realtime is active.
 */
export function useShared<T>(key: string, initial: T) {
  const storageKey = `us.${key}`;
  const [value, setValue] = useState<T>(initial);
  const [synced, setSynced] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);
  const sender = useRef<string>("");

  useEffect(() => {
    setValue(readLocal<T>(storageKey, initial));

    const supabase = createClient();
    if (!supabase) return; // demo mode — local only

    sender.current = tabId();
    const channel = supabase.channel(`shared:${COUPLE_ID}:${key}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "set" }, (msg: { payload: { from: string; value: T } }) => {
        if (msg.payload.from === sender.current) return;
        setValue(msg.payload.value);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(msg.payload.value));
        } catch {
          /* ignore quota */
        }
      })
      .subscribe(async (status: string) => {
        if (status !== "SUBSCRIBED") return;
        setSynced(true);
        // Best-effort: load the latest persisted value for late joiners.
        try {
          const { data } = await supabase
            .from("shared_state")
            .select("value")
            .eq("key", `${COUPLE_ID}:${key}`)
            .maybeSingle();
          if (data?.value !== undefined && data.value !== null) {
            setValue(data.value as T);
          }
        } catch {
          /* table may not exist yet — broadcast still works live */
        }
      });

    channelRef.current = channel;
    return () => {
      setSynced(false);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
      const channel = channelRef.current;
      if (channel) {
        channel.send({
          type: "broadcast",
          event: "set",
          payload: { from: sender.current, value: next },
        });
        const supabase = createClient();
        // Best-effort durable copy so a partner opening later sees current state.
        supabase
          ?.from("shared_state")
          .upsert({ key: `${COUPLE_ID}:${key}`, value: next, updated_at: new Date().toISOString() })
          .then(undefined, () => {
            /* table optional */
          });
      }
    },
    [storageKey]
  );

  return [value, update, { synced }] as const;
}

/**
 * Presence for the couple room — is your partner currently online?
 * Returns { online, partnerOnline }. Always {1,false} in demo mode.
 */
export function usePresence(room = "lobby") {
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const id = tabId();
    const channel = supabase.channel(`presence:${COUPLE_ID}:${room}`, {
      config: { presence: { key: id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnline(Object.keys(state).length);
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") await channel.track({ at: Date.now() });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room]);

  return { online, partnerOnline: online > 1 };
}
