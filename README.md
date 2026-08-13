# Us 💕 — our little world

A cozy, iOS-flavored ("liquid glass") relationship web app for two people. Built
as an installable PWA (add-to-home-screen), optimized for mobile, deployed on
Vercel with Supabase for auth + data.

## Features

- **Home / Stats** — live "days together" counter (from **March 7, 2026**),
  monthiversary + major-milestone countdowns (6mo, 1yr, 1.5yr…), and a
  **distance-between-us** card (on-demand *Share location* + optional auto-update
  while the app is open).
- **Timeline** — add/delete memories with dates, notes and emoji, shown on a
  cute vertical timeline.
- **Quizzes** — deep talk, 20-questions, truth-or-dare, party, and
  "how well do you know me?" (guess-your-partner). Answers hide until **both**
  finish, then reveal + compare. Completing a quiz earns shared **coins 🪙**.
- **Games** — a free-to-play hub with a lifetime scoreboard (track wins for any
  game) and placeholders for Pong, Chess, and the **Dream House** builder.
- **Dream House** *(coming soon)* — spend your shared coins to decorate a 2D home
  together, Sims-style.

## Tech

Next.js 15 (App Router) · TypeScript · Tailwind CSS (custom glass design system)
· Framer Motion-ready · Supabase (`@supabase/ssr`) · PWA (manifest + service
worker).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then edit values (or leave blank for demo mode)
npm run dev
```

Open http://localhost:3000. **Demo mode**: without Supabase keys the app fully
works using local storage (any tap on the login screen lets you in) so you can
see everything immediately.

## Connecting Supabase (real accounts + sync)

1. Create a project at https://supabase.com.
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`.
3. Create the two user accounts under **Authentication → Users** (email +
   password). Email confirmations can be disabled for a private 2-person app.
4. Copy your **Project URL** and **anon public key** into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Restart `npm run dev`. The middleware now enforces sign-in and keeps you
   logged in (long-lived session — sign in once, stay in).

> The UI currently reads/writes local storage in demo mode. Swap the
> `usePersistent(...)` calls (see `src/lib/store.ts`) for Supabase queries — the
> table shapes already match the SQL schema.

## Deploying to Vercel

1. Push this repo to GitHub (`origin` is already set).
2. Import it in Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
3. Deploy. On your phone, open the URL in Safari/Chrome → **Add to Home Screen**.

## App icon

`public/icons/icon.svg` is used everywhere. For the crispest iOS home-screen
icon, generate `icon-192.png`, `icon-512.png`, and a 180×180 `apple-touch-icon`
from the SVG (any PWA icon generator) and drop them in `public/icons/`.

## Customizing

- Relationship start date → `NEXT_PUBLIC_RELATIONSHIP_START` in `.env.local`.
- App name / accent → `NEXT_PUBLIC_APP_NAME` and the `rose` palette in
  `tailwind.config.ts`.
- Quiz content → `src/lib/quizzes.ts`.
