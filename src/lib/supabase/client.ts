"use client";

import { createBrowserClient } from "@supabase/ssr";
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

// Cache a single browser client for the tab. Creating a new one per call spawns
// multiple GoTrueClient instances (auth/session flakiness + realtime churn).
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client (singleton). Returns null in demo mode (no env vars)
 * so callers can fall back to local placeholder behaviour instead of crashing.
 */
export function createClient() {
  if (!IS_SUPABASE_CONFIGURED) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
