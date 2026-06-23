# IdeaMap — Design Brief for Claude

> This file is the single source of truth for how Claude should reason about, extend, and redesign the IdeaMap application. Read it before touching any file in `app/ideamap/`.

---

## What IdeaMap Is

IdeaMap is an AI-powered web application that guides Moroccan citizens through the full lifecycle of an INDH (Initiative Nationale pour le Développement Humain) funding application — from raw idea to a complete dossier ready for submission. It lives at `/ideamap` inside the Y-TRACK Next.js app.

Three user roles exist:

| Role | Access code format | Experience |
|---|---|---|
| **Holder** (project applicant) | `AB123456` (CIN format) | 8-step guided workflow |
| **Coordinator** | `@KHALIDCOD` | Dashboard: track all holders |
| **Admin** | `@adminINDH` | Stats, project list, coordinator management |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Inline React styles only — **no CSS modules, no Tailwind, no external UI libs** |
| AI backend | `app/api/ai/route.ts` → Anthropic SDK (`claude-sonnet-4-20250514`) |
| Fonts | `Poppins` (Latin) · `Tajawal` (Arabic) — loaded via Google Fonts in `injectCSS()` |
| Analytics | `@vercel/analytics` — already wired in `app/layout.tsx` |

---

## Design System

All design tokens live as constants at the top of `app/ideamap/page.tsx`. **Never hardcode raw hex values** in components — always reference these constants:

```ts
const Y  = "#FFB703"   // Primary yellow  — buttons, accents, progress
const YD = "#E5A200"   // Yellow dark     — button gradient end
const YL = "#FFF3CD"   // Yellow light    — backgrounds, selected states
const N  = "#1C3A5C"   // Navy            — body text
const ND = "#0F2233"   // Navy dark       — header, chat bubbles, dark cards
const NB = "rgba(255,255,255,.07)"  // Navy blur surface — header user pill
const CR = "#FAF7F0"   // Cream           — page background
const CD = "#EDE8DF"   // Cream dark      — borders, table stripes
const WH = "#FFFFFF"   // White           — card background
const GR = "#6B7280"   // Gray            — helper text, placeholders
const GN = "#22C55E"   // Green           — eligible / success states
const RE = "#EF4444"   // Red             — errors, over-budget, ineligible
```

### Spacing & Shape

- **Border radius scale**: `7px` (tiny chip) → `10px` (field) → `11–12px` (input/select) → `13px` (inner card) → `14–16px` (jury/score) → `18px` (main Card) → `22px` (login glass panel)
- **Padding inside cards**: `24px`
- **Gap between cards**: `14px` (`marginBottom`)
- **Max content width**: `700px` (holder flow) · `720px` (dashboards)
- **Header height**: `58px` fixed, sticky, `z-index: 200`

### Typography

```
Font family:   ff(lang)  →  Poppins | Tajawal
Heading h2:    19px / 700
Heading h3:    17px / 700
Body:          13–14px / 400–500
Label/caption: 10–11px / 700 / uppercase / letter-spacing .4–.6px
Badge text:    10px / 700
Stat number:   22–48px / 800
```

### Buttons

The `Btn` component covers primary and outline variants:
- **Primary**: `linear-gradient(135deg, #FFB703, #E5A200)` · color `#0F2233` · `border-radius: 12px` · `padding: 14px 24px`
- **Outline**: `transparent` bg · `2px solid #1C3A5C` border
- `width: 100%` always — full-width is the design convention
- `button:active` scales to `0.96`

The `indhBtn` helper (inside `HolderApp`) renders the CTA with `fontWeight: 800` for emphasis.

### Cards

```tsx
<Card>          // white, 18px radius, soft shadow
<Card style={{background: ND}}>   // dark variant for dashboards
```

Use `CardAccBar` (`AccBar`) as a section divider — a 4×20px yellow bar before section headings inside cards.

### Progress Bars

`<PBar pct={N} h={6} color={Y}/>` — height and color are optional.  
- Default color: `Y` (yellow)  
- Use `linear-gradient(90deg, #FFB703, #E5A200)` for the main step progress  
- Use `RE` for over-budget or jury sub-scores below 50%

### Animations

Defined in `injectCSS()`:
- `.fadeUp` — page entry animation (`opacity 0→1, translateY 14→0, 0.35s`)
- `.shake` — error feedback on login input
- `bounce` keyframes — loading dots

---

## The 8-Step Holder Workflow

```
idea → dialogue → profile → plan → budget → compliance → documents → export
```

Each step renders inside `<HolderApp>` based on the `step` state string.  
`<ProgRow>` displays the step labels from `t.steps[]` and a gradient progress bar.

| Step | Key state | AI call? |
|---|---|---|
| `idea` | `idea` (string) | No — user types |
| `dialogue` | `msgs[]`, `qN` | Yes — 5 Q&A turns, final turn returns JSON `proj` |
| `profile` | `proj` | No — displays parsed JSON |
| `plan` | `plan`, `budget` | Yes — two parallel AI calls |
| `budget` | `budget` | No — displays, computes totals |
| `compliance` | `comp` | Yes — scores against INDH criteria |
| `documents` | `docs` (checkbox map) | No |
| `export` | readiness score | No — derived from `comp.score + docs` |

---

## AI Integration

All AI calls go through the server-side proxy:

```
POST /api/ai
Body: { messages: [{role, content}][], system: string }
Response: { content: [{text: string}] }
```

The proxy (`app/api/ai/route.ts`) reads `process.env.ANTHROPIC_API_KEY`.  
**Never** call `https://api.anthropic.com` directly from client components.

The `ai()` helper in `HolderApp` returns the first text block. The `parseJ()` helper extracts the first `{...}` JSON object from the response.

---

## Internationalization

Three languages: `fr` (default) · `ar` · `en`

All UI strings live in the `TX` object. Reference via `t.<key>`.  
Arabic activates RTL layout: `direction: "rtl"` on the root div and all inputs/selects.  
Font family switches via `ff(lang)` — `Tajawal` for `ar`, `Poppins` otherwise.

When adding new strings, add all three language keys to `TX.fr`, `TX.ar`, and `TX.en`.

---

## File Map

```
app/
  ideamap/
    page.tsx          ← Entire IdeaMap UI (client component, "use client")
  api/
    ai/
      route.ts        ← Anthropic API proxy (server component)
  layout.tsx          ← Root layout with Vercel Analytics
  page.tsx            ← Y-TRACK landing page (untouched)
```

---

## Design Conventions Claude Must Follow

1. **Inline styles only.** No className-based styling except for `fadeUp` and `shake` (defined in `injectCSS()`).

2. **No new dependencies.** The UI is intentionally zero-dependency beyond React and Next.js. Resist adding UI libraries.

3. **All new components go inside `app/ideamap/page.tsx`** unless they require server-side logic (then `app/api/`).

4. **Mobile-first within a max-width container.** Target 375px minimum. The `maxWidth: "700px"` wrapper handles desktop centering.

5. **Yellow is the primary action color.** Every primary CTA, progress indicator, and active state uses `Y` or `YL`. Red (`RE`) is strictly for errors.

6. **Dark navy (`ND`) = trust and authority.** Use it for headers, dark card variants, compliance scores, and the chat assistant bubble.

7. **Keep the glass-panel aesthetic on the login screen.** `background: rgba(255,255,255,.04)` + `backdropFilter: blur(10px)` + `border: 1px solid rgba(255,255,255,.1)`.

8. **Emoji icons are load-bearing UI.** Step icons (`💡📋📊💰✅📁🎉`) replace image assets. Keep them.

9. **Arabic RTL must be tested on every layout change.** Flex row directions, text alignment, and border accents (e.g. `borderLeft`) need mirroring.

10. **The `injectCSS()` function is called once in the root component.** Add global styles there — not in `<style>` tags or separate files.

---

## What Needs Design Work

Priority areas where Claude should focus design effort:

### High priority
- [ ] **Mobile responsiveness** — the budget table (`<table>`) overflows on small screens; replace with card-per-row layout below 480px
- [ ] **Export screen** — the deliverables list is static; add a real "Download Business Plan" action (generate PDF-ready HTML and trigger print dialog)
- [ ] **Empty states** — coordinator/admin dashboards show a plain text message when no projects exist; add illustrated empty states

### Medium priority
- [ ] **Toast notifications** — currently there is no feedback when AI calls fail; add a lightweight toast system using a portal
- [ ] **Dialogue step UX** — the textarea input disappears when busy; keep it visible but disabled with a subtle pulse
- [ ] **Score animation** — the compliance score (`comp.score`) should count up from 0 on mount

### Low priority
- [ ] **Dark mode** — the login screen is already dark; extend dark-mode tokens to the holder flow
- [ ] **Print stylesheet** — add `@media print` rules inside `injectCSS()` for the export/dossier screen

---

## INDH Domain Context

When generating or reviewing AI prompts, keep these facts accurate:

- Maximum INDH grant per project: **100,000 MAD**
- Typical INDH contribution: **85%** — holder contribution: **15%**
- Four INDH Phase 3 pillars: Rural development · Territorial reduction of poverty · Human dignity · Horizontal programs
- Eligible sectors: Agriculture/Élevage, Artisanat, Commerce/Services, Agro-alimentaire, Tourisme rural, Numérique/TIC, Textile/Couture, BTP, Éducation/Formation, Pêche
- Jury scoring weights: Impact social 25 · Viabilité 20 · Pertinence territoriale 20 · Capacité de gestion 15 · Durabilité 10 · Innovation 10 = **100 pts**

---

## Quick Reference — Auth Codes for Testing

| Role | Code |
|---|---|
| Admin | `@adminINDH` |
| Coordinator (example) | `@KHALIDCOD` (must be added by admin first) |
| Holder (new) | Any `AB123456`-format CIN — triggers account creation |
| Holder (returning) | Same CIN used during first login |
