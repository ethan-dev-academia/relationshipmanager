// Central runtime config. Everything degrades gracefully when Supabase isn't configured yet,
// so you can see the full UI before wiring up a Supabase project.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when a real Supabase project is wired up (auth + data persistence enabled). */
export const IS_SUPABASE_CONFIGURED =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Us";

/** The two people. Shown together in the app header. */
export const MY_NAME = process.env.NEXT_PUBLIC_MY_NAME ?? "Ethan";
export const PARTNER_NAME = process.env.NEXT_PUBLIC_PARTNER_NAME ?? "My Love";
export const COUPLE = `${MY_NAME} & ${PARTNER_NAME}`;

/** Sign-in emails, used to auto-detect who is on this device once signed in. */
export const MY_EMAIL = (process.env.NEXT_PUBLIC_MY_EMAIL ?? "").toLowerCase();
export const PARTNER_EMAIL = (
  process.env.NEXT_PUBLIC_PARTNER_EMAIL ?? ""
).toLowerCase();

/** Relationship start date. Defaults to March 7th, 2026. */
export const RELATIONSHIP_START =
  process.env.NEXT_PUBLIC_RELATIONSHIP_START ?? "2026-03-07";
