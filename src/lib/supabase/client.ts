"use client";

import { createBrowserClient } from "@supabase/ssr";
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Browser Supabase client. Returns null in demo mode (no env vars) so callers
 * can fall back to local placeholder behaviour instead of crashing.
 */
export function createClient() {
  if (!IS_SUPABASE_CONFIGURED) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
