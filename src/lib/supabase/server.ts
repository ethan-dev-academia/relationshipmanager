import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/config";

/**
 * Server Supabase client (for Server Components / Route Handlers).
 * Returns null in demo mode so pages can render without a configured backend.
 */
export async function createClient() {
  if (!IS_SUPABASE_CONFIGURED) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
}
