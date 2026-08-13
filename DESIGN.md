# Us — Design System (the standard)

One coherent, modern-Apple look. **Light + dark**, warm **cream & pink**, pink is
the ONLY accent. Content is calm and solid; only floating chrome (nav/tab bars,
nav buttons) uses glass. Follow this everywhere — no ad-hoc colors, radii, or
one-off components.

## Golden rules
1. **Never hardcode theme colors.** Use CSS vars / semantic classes so light+dark
   both work: `c-label`, `c-label-2`, `c-label-3`, `c-tint`, `bg-fill`,
   `bg-tint-bg`, `bg-card`, `border-separator`, and inline `var(--tint)`,
   `var(--label)`, `var(--card)`, etc. White text is allowed ONLY on top of a
   pink/tinted gradient card.
2. **Every screen uses `<Screen title=… [backHref backLabel] [trailing]>`** for the
   large-title nav + safe area. Sub-pages pass `backHref`/`backLabel`.
3. **Group content** with `<Section header footer>` + `<Row>` (from
   `@/components/List`) for lists, or `.card` for feature/hero blocks. Don't invent
   row/list markup.
4. **8pt spacing.** Horizontal page padding = `px-4`. Space between sections =
   `pt-6`. Inside cards = `p-4`/`p-5`.
5. **Corner radii:** cards `22px` (`.card`), lists `20px` (`.list`), small controls
   `12–14px`, pills/avatars full. Icon tiles via `<IconTile>`.
6. **Every empty state** = centered emoji + `t-title3` title + `t-subhead c-label-2`
   subtitle + a `btn-filled` action. No blank screens.
7. **Buttons:** primary = `.btn-filled` (bold rounded-rect). Secondary/small =
   `.btn-tinted`. Never thin iOS text-pills for primary actions.
8. **Motion is subtle:** `active:scale-[0.97]`/`active:scale-95` on tappables. No
   flashy entrance animations.

## Type scale (classes in globals.css)
`t-large`(34/700 title) · `t-title1/2/3` · `t-headline`(17/600) · `t-body`(17) ·
`t-callout`(16) · `t-subhead`(15) · `t-footnote`(13) · `t-caption`(12).
Section labels: `group-header` (uppercase) / `group-footer`.

## Components (reuse — in `@/components`)
- `Screen` — page shell w/ collapsing large title, `trailing` accessory, optional
  `backHref`/`backLabel`.
- `List`: `Section` (header/footer + inset list) and `Row`
  (`tile`, `title`, `subtitle`, `value`, `accessory`, `href`/`onClick`, `chevron`).
- `IconTile` + `TILE` palette (pink, rose, purple, indigo, blue, teal, green,
  orange, red, gray) — leading rounded-square icons, Settings-style.
- `Switch` — iOS toggle. `.segmented`/`.segment[data-active="true"]` — segmented control.
- `.field` — text inputs. Bottom **sheets**: `.animate-sheet-up`, grabber, Con­cel/Save nav (see `timeline`).

## Feature-card pattern (hero tiles / grids)
`.card` with an `IconTile` top-left, `ChevronRight` (or a `Soon` chip) top-right,
`t-headline` title + `t-footnote c-label-2` hint. Gradient hero cards use
`linear-gradient(150deg, #ff5c9a, var(--tint), #d81f74)` + white text + a top
sheen overlay + `boxShadow: var(--elev), inset 0 1px 0 rgba(255,255,255,.45)`.

## Names & identity
Use real names from `useIdentity()` (`myName`/`partnerName`) or `MY_NAME`/
`PARTNER_NAME` from `@/lib/config` — never literal "You"/"Partner" in user-facing
copy where a name fits. The device-identity picker lives in **Settings only**, not
scattered on feature screens.

## Don'ts
- No dark-only or light-only hardcoded hex for text/surfaces.
- No segmented "name switcher" on content screens.
- No giant empty gaps, no inconsistent paddings, no random radii.
- Don't reduce contrast (WCAG AA for text).
