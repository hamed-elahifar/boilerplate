# Boilerplate Design System (shadcn-vue "reka-nova" + Tailwind v4)

## Overview
Boilerplate is a Persian (RTL, `lang="fa" dir="rtl"`) admin dashboard shell: login, a fixed sidebar, users table, settings. The look is calm and flat: WhatsApp-style teal and green on a pale grey-blue page, white cards separated by 1px rings rather than shadows, generous 16px base radius. Density is medium-compact (32px controls, 14px text). Three switchable themes (teal default, neutral, violet), each with light and dark.

Source of truth: `frontend/src/assets/main.css` (default theme + tokens), `frontend/src/assets/themes.css` (extra themes), `frontend/src/components/ui/*` (shadcn-vue components). All colors are authored as `oklch()`; hex values below are converted from them (approximate to +/-1 per channel).

## Colors
Default "teal" theme. Light value first, dark value (`.dark`) after.
- **Primary** (#075E54 light / #00A884 dark): default Button fill, links, sidebar brand text, sidebar primary. Deep WhatsApp teal.
- **Primary Hover**: no separate token. Buttons use `primary/80` on hover (only for `<a>` buttons via `[a]:hover:bg-primary/80`; plain `<button>` default variant has no hover style).
- **Primary Foreground** (#FFFFFF light / #111B21 dark): text on Primary.
- **Secondary** (#E7F8F0 light / #12332A dark): secondary Button fill, active/hover sidebar item (`sidebar-accent`). Pale mint. Secondary Foreground is #075E54 / #00A884.
- **Accent** (#25D366 both modes): focus ring base color and select-item highlight (`focus:bg-accent`). Bright WhatsApp green. Accent Foreground is #FFFFFF light / #111B21 dark.
- **Neutral / Muted** (#F0F2F5 light / #182229 dark): ghost/outline hover fills, table row selected state, footer strips (`muted/50`). Cool grey.
- **Background** (#F0F2F5 light / #0B141A dark): page background (`body`). Same value as Muted in light mode.
- **Surface / Card / Popover** (#FFFFFF light / #1F2C34 dark): cards, dialogs, select menus. Sidebar surface is #FFFFFF light / #111B21 dark.
- **Text Primary** (#111B21 light / #E9EDEF dark): body text, headings (`foreground`).
- **Text Secondary** (#667781 light / #8696A0 dark): descriptions, placeholders, usernames, empty-state text (`muted-foreground`).
- **Border / Input** (#E9EDEF light / #2A3942 dark): dividers, input borders, sidebar border.
- **Ring** (#25D366 light / #00A884 dark): focus ring (applied at 50% opacity) and selected theme tile.
- **Error / Destructive** (#EA4335 both modes): error text, invalid input border/ring, destructive button (tinted, not solid). Destructive Foreground #FFFFFF light / #E9EDEF dark.
- **Success**: not defined. No success token exists; the green Accent is not used for success messages.
- **Warning**: not defined.
- **Chart 1-5** (#25D366, #075E54, #128C7E, #34B7F1, #00A884 in light; 2/5 swap and 2 becomes #00A884 in dark): defined for charts, not used by any current view.
- **Other themes** (light primary / background / accent): neutral = #171717 / #FFFFFF / #F5F5F5, radius 10px; violet = #6E37D2 / #F7F6FB / #D773D0, radius 12px. Their dark variants are in `themes.css`. Neutral and violet do not override `destructive` or chart colors.

## Typography
- **Display / Body**: Vazirmatn Variable (`@fontsource-variable/vazirmatn`, imported in `main.css`), fallback `Tahoma, sans-serif`. `--font-heading` is the same family.
- **Code**: `SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace` (system stack, nothing loaded; no code UI exists yet). `--font-serif` is `Georgia, serif`, unused.
- Weights in use: 400 (body), 500 (`font-medium`: buttons, labels, card titles, table heads), 600 (`font-semibold`: page h1, sidebar brand). Letter-spacing: default, never set.
- Scale (Tailwind defaults): Display none; Headline/page h1 `text-2xl` 24px/600 (login card title also 24px); Section heading `text-xl` 20px/600 (sidebar brand only); Subhead `text-base` 16px/500 (card title, alert dialog title); Body `text-sm` 14px (buttons, inputs at md+, labels, table, card text, descriptions); Small `text-[0.8rem]` 12.8px (sm button); Caption `text-xs` 12px (xs button); Overline: none.
- Inputs use `text-base` 16px below `md` (768px) and `text-sm` 14px from `md` up.
- `components.json` says `"font": "geist-sans"` but Geist is not loaded; Vazirmatn is what renders.

## Elevation
- Policy: flat. Cards and dialogs use `ring-1 ring-foreground/10` (1px ring at 10% foreground), not shadows.
- Select menu: `shadow-md` plus `ring-1 ring-foreground/10`. Light `shadow-md` = `0px 2px 10px 0px hsl(0 0% 0%/0.1), 0px 2px 4px -1px hsl(0 0% 0%/0.1)`; dark = `0px 4px 12px 0px hsl(0 0% 0%/0.4), 0px 2px 4px -1px hsl(0 0% 0%/0.4)`. Other `--shadow-*` tokens are defined (2xs to 2xl) but unused.
- Focus ring: `focus-visible:ring-3` (3px) in `ring/50`, plus border turns `ring` color. Invalid: `aria-invalid:ring-3` in `destructive/20` (`/40` dark) and border `destructive` (`/50` dark).
- Selected theme tile (Settings): `border-ring ring-2 ring-ring/40`.
- Blur: `cn-menu-translucent` class is referenced on the select menu, provided by `shadcn-vue/tailwind.css` (definition not checked). Alert dialog overlay styling was not inspected.

## Components
- **Buttons** (`ui/button`): base `rounded-lg` (16px), 1px transparent border, `text-sm` 14px/500, `transition-all`, `active:translate-y-px`, disabled `opacity-50` + no pointer events, focus ring as above. Sizes: default h-32px px-10px gap-6px; xs h-24px px-8px 12px text; sm h-28px px-10px 12.8px text; lg h-36px; icon 32px, icon-xs 24px, icon-sm 28px, icon-lg 36px; icon 16px (12/14px in xs/sm). Variants: `default` bg Primary; `outline` border + Background fill, hover Muted (dark: `input/30`, hover `input/50`); `secondary` bg Secondary, hover `secondary/80`; `ghost` hover Muted; `destructive` `destructive/10` fill, destructive text, hover `destructive/20`; `link` primary text, underline on hover. No explicit transition duration (Tailwind default 150ms).
- **Cards** (`ui/card`): `bg-card`, `rounded-xl` (20px), `py-4`, `gap-4`, `text-sm`, `ring-1 ring-foreground/10`, `overflow-hidden`. Header/content `px-4`; footer `bg-muted/50 border-t p-4`. `size="sm"` uses py/px 12px. Title 16px/500, description 14px Text Secondary. Login card `max-w-sm`; settings card `max-w-xl`.
- **Inputs** (`ui/input`): h-32px, `rounded-lg` (16px), 1px `border-input`, transparent bg (dark `input/30`), px-10px py-4px, placeholder Text Secondary, `transition-colors`, focus/invalid as in Elevation, disabled `opacity-50` + `not-allowed`. Credential fields set `dir="ltr"`.
- **Select** (`ui/select`): trigger matches Input (h-32px, sm h-28px, `rounded-lg`, ps-10px pe-8px, 14px). Menu: `bg-popover`, `rounded-lg`, `min-w-36` (144px), `shadow-md`, ring, 100ms zoom/fade animation. Item: `rounded-md` (14px), py-4px, 14px; `focus:bg-accent focus:text-accent-foreground` (green).
- **Chips / Badges**: not present.
- **Lists**: no list component. Sidebar nav is a `grid gap-1` of links.
- **Table** (`ui/table`): `text-sm`; head h-40px px-8px 500 weight; cell p-8px; row `border-b`, hover `muted/50`, selected `muted`, `transition-colors`. Empty state is a centered Text Secondary row.
- **Alert dialog** (`ui/alert-dialog`): `bg-popover`, `rounded-xl` (20px), p-16px, gap-16px, ring-1, centered fixed, `max-w-xs` (sm+: `max-w-sm`), 100ms zoom/fade. Title 16px/500, description 14px Text Secondary. Footer `bg-muted/50 border-t`, buttons stacked reverse on mobile, row end-aligned at sm+. Destructive confirm uses the destructive Button variant.
- **Checkboxes / Switches**: not present (theme picker is a `role="radiogroup"` of bordered tiles: `rounded-md`, p-12px, 14px, hover Muted).
- **Tooltips**: not present.
- **Navigation** (`DashboardLayout.vue`): inline-start sidebar (right edge in RTL) `w-56` (224px), p-16px, `border-e`, `bg-sidebar`. Brand `text-xl` 600 in sidebar-primary. Links: `rounded-md`, px-12px py-8px, 14px, icon 16px, gap-8px; hover and active use `sidebar-accent`; active adds 500 weight. User block pinned bottom with `border-t` and ghost sign-out button. No top bar, no responsive collapse.
- **Search**: not present.
- **Icons**: `@lucide/vue`, 16px (`size-4`); directional icons flip with `rtl:-scale-x-100`.
- **Error text**: `text-sm text-destructive`, `role="alert"`, inline above the form/table.

## Spacing
- Base unit 4px (Tailwind default `--spacing`, not overridden).
- Control padding: 8-10px horizontal; card padding 16px (12px small); table cell 8px; dialog 16px; nav link 12px x 8px.
- Page: `main` is `p-8` (32px) at all breakpoints; page h1 `mb-6` (24px). Login: centered, `p-4`.
- Form fields: `grid gap-4` between fields, `gap-2` between label and control; settings sections `gap-6`, theme tiles `gap-3`.
- Layout: sidebar 224px + fluid `flex-1`; no container max-width. Users page grid is single-column, becomes `minmax(0,1fr) 22rem` (352px) at `xl` (1280px), gap 24px.
- Breakpoints are Tailwind defaults (sm 640, md 768, xl 1280); few responsive rules exist.

## Border Radius
Base `--radius`: 1rem (16px) in teal; 0.625rem in neutral; 0.75rem in violet. Derived: sm = radius-4px (12px), md = radius-2px (14px), lg = radius (16px), xl = radius+4px (20px).
- Buttons, inputs, select trigger, select menu: `rounded-lg` (16px). xs/sm buttons: `min(radius-md, 10px/12px)`.
- Cards, alert dialog: `rounded-xl` (20px).
- Nav links, select items, theme tiles: `rounded-md` (14px).
- Theme swatch dot: `rounded-full`.

## Do's and Don'ts
- Do take colors only from the semantic tokens (`bg-primary`, `text-muted-foreground`, `border-border`); no raw hex or Tailwind palette colors appear in views.
- Do keep Primary teal for the main action; Accent green is for focus/highlight, not buttons.
- Do use Vazirmatn only; use weights 400, 500, 600 only.
- Do use one default (filled) Button per form or section; secondary actions use outline or ghost.
- Do use `rounded-lg` for form controls and buttons, `rounded-xl` for cards and dialogs.
- Do separate surfaces with a 1px `ring-foreground/10` or `border`, not shadows; reserve shadow for floating menus.
- Do show destructive actions as the tinted destructive variant and confirm them in an alert dialog.
- Do build every new component to also work in `.dark` and under all `data-theme` values by using variables.
- Do mirror for RTL: use logical utilities (`ps`, `pe`, `border-e`, `text-start`) and flip directional icons.
- Don't hard-code `left`/`right` spacing; Don't add new colors outside the variable blocks in `main.css`/`themes.css`.
- Don't use a solid red destructive button; the pattern is tinted.
- Don't add custom transition durations; use Tailwind defaults (150ms) or the 100ms dialog/menu animation.

Notes:
- To add a theme: add a `[data-theme='<id>']` and `.dark[data-theme='<id>']` block in `themes.css` and an entry in `composables/useTheme.ts`. Theme and dark mode persist in localStorage (`iea.theme`, `iea.dark`); dark defaults to `prefers-color-scheme`.
- Dark mode: class-based (`.dark` on `<html>`, `@custom-variant dark (&:is(.dark *))`).
- Inconsistency notes: radius differs per theme; `components.json` declares Geist while Vazirmatn is loaded; `components.json` has `"rtl": false` though the app is RTL.
