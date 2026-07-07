# IdeaMap — Design Brief for Claude

> This file is the single source of truth for how Claude should reason about, extend, and redesign the IdeaMap application. Read it before touching any file in `app/ideamap/`.

## Design Source Files

The full UI code — all components, tokens, layouts, and styles:

@app/ideamap/page.tsx

The AI proxy route:

@app/api/ai/route.ts

---

## What IdeaMap Is

IdeaMap is an AI-powered web application that guides Moroccan citizens through the full lifecycle of an INDH (Initiative Nationale pour le Développement Humain) funding application — from raw idea to a complete dossier ready for submission. It lives at `/ideamap` inside the Y-TRACK Next.js app.

Three user roles exist:

| Role | Access code format | Experience |
|---|---|---|
| **Holder** (project applicant) | `AB123456` (CIN format) | 9-step guided workflow |
| **Coordinator** | `@KHALIDCOD` | Dashboard: track all holders |
| **Admin** | `@adminINDH` | Stats, project list, coordinator management |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Inline React styles only — **no CSS modules, no Tailwind, no external UI libs** |
| AI backend | `app/api/ai/route.ts` → multi-provider cascade (Anthropic first, then Groq/Gemini/OpenRouter) |
| Fonts | `Poppins` (Latin) · `Tajawal` (Arabic) — loaded via Google Fonts in `injectCSS()` |
| Analytics | `@vercel/analytics` — already wired in `app/layout.tsx` |

---

## Design System

All design tokens live as constants at the top of `app/ideamap/page.tsx`. **Never hardcode raw hex values** in components — always reference these constants:

```ts
const Y  = "#2563EB"   // Primary blue    — buttons, accents, progress
const YD = "#1E40AF"   // Blue dark       — button gradient end
const YL = "#EFF6FF"   // Blue light      — backgrounds, selected states
const N  = "#1C3A5C"   // Navy            — body text
const ND = "#0F2233"   // Navy dark       — header, chat bubbles, dark cards
const NB = "rgba(255,255,255,.07)"  // Navy blur surface — header user pill
const CR = "#F8FAFF"   // Cool white      — page background
const CD = "#DDE4F0"   // Cool border     — dividers, table stripes
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
- **Primary**: `linear-gradient(135deg, #2563EB, #1E40AF)` · color `#0F2233` · `border-radius: 12px` · `padding: 14px 24px`
- **Outline**: `transparent` bg · `2px solid #1C3A5C` border
- `width: 100%` always — full-width is the design convention
- `button:active` scales to `0.96`

The `indhBtn` helper (inside `HolderApp`) renders the CTA with `fontWeight: 800` for emphasis.

### Cards

```tsx
<Card>          // white, 18px radius, soft shadow, border: 1px solid rgba(28,58,92,.07)
<Card style={{background: ND}}>   // dark variant for dashboards
```

Use `AccBar` as a section divider — a 4×20px blue (`Y`) bar before section headings inside cards.

### Progress Bars

`<PBar pct={N} h={6} color={Y}/>` — height and color are optional.
- Default color: `Y` (blue)
- Use `linear-gradient(90deg, #2563EB, #1E40AF)` for the main step progress
- Use `RE` for over-budget or jury sub-scores below 50%

### Animations

Defined in `injectCSS()`:
- `.fadeUp` — page entry animation (`opacity 0→1, translateY 14→0, 0.35s`)
- `.im-rise` — card/element rise (`opacity 0→1, translateY 8→0, 0.45s`)
- `.shake` — error feedback on login input
- `.busy-pulse` — textarea pulse when AI is thinking (`opacity 1→0.45, 1.4s infinite`)
- `bounce` keyframes — loading dots
- `toastIn` keyframes — toast notification slide-up

---

## The 9-Step Holder Workflow

```
idea → dialogue → profile → plan → budget → logo → compliance → documents → export
```

Each step renders inside `<HolderApp>` based on the `step` state string.
`<ProgRow>` displays the step labels from `t.steps[]` and a gradient progress bar.

| Step | Key state | AI call? |
|---|---|---|
| `idea` | `idea` (string) | No — user types; quick-start templates shown when empty |
| `dialogue` | `msgs[]`, `qN`, `brief`, `currentQ` | Yes — 4 Q&A turns with BRIEF+QUESTION+SUGGESTIONS format |
| `profile` | `proj` | No — displays parsed JSON from dialogue |
| `plan` | `plan`, `budget` | Yes — two parallel AI calls |
| `budget` | `budget` | No — displays, computes totals; mobile card layout below 520px |
| `logo` | `logo`, `logoStyle` | Yes — AI generates brand identity (initials, colors, icon, tagline); 3 SVG style variants |
| `compliance` | `comp` | Yes — scores against INDH 6-criteria jury grid |
| `documents` | `docs` (checkbox map), `docFiles` | No — file attachment per document |
| `export` | readiness score | No — derived from `comp.score + docs`; download in fr/ar/en |

---

## Dialogue Step Detail (Step 2)

The dialogue uses a focused Q&A card layout — **not** a chat bubble log:

1. **Brief card** — italic, light blue (`YL`) background, shows 1–2 lines of what the advisor understood so far
2. **Question card** — dark navy (`ND`) background, bold white text, prominent
3. **Answer bars** — 3 full-width A/B/C buttons (tap to answer instantly)
4. **Text input** — custom free-text answer below the bars; disabled + pulsing while AI thinks

State: `brief` (string), `currentQ` (string), `suggestions` (string[]), `qN` (1–4), `MAX_Q = 4`

AI prompt format per turn:
```
BRIEF: [1-2 sentences about the project so far]
QUESTION: [direct question, max 12 words]
SUGGESTIONS: [option A] | [option B] | [option C]
```

Question arc across 4 turns:
- Q1: Who are the beneficiaries? (Impact social — 25 pts jury)
- Q2: What local problem does it solve? (Pertinence territoriale — 20 pts)
- Q3: How will the holder earn money? (Viabilité — 20 pts)
- Q4: What is the holder's experience? (Capacité de gestion — 15 pts)

---

## Logo Step Detail (Step 6)

AI generates a brand identity JSON:
```json
{
  "initials": "2-3 letters",
  "color1": "#hex — main brand color",
  "color2": "#hex — secondary color",
  "colorText": "#FFFFFF or #0F2233 — contrast text",
  "icon": "emoji matching sector",
  "tagline": "3-5 word slogan",
  "styleDesc": "4-6 word positioning",
  "accentColor": "#hex — accent for details"
}
```

Three SVG style variants (rendered live, user picks one):
- **Style 0 — Gradient Burst**: diagonal linearGradient background, sunburst rays, large emoji icon, bold initials, tagline pill at bottom
- **Style 1 — Moroccan Star**: 8-pointed zellige star shape, inner circle with initials, decorative corner dots
- **Style 2 — Dynamic Diagonal Split**: clipPath diagonal split (color1 top-left / color2 bottom-right), large initial + emoji, white accent dot

SVG IDs use `uid = lv${idx}${size}` to avoid conflicts when multiple sizes render simultaneously.
Download exports the selected style as a 300×300 SVG file.

---

## AI Integration

All AI calls go through the server-side proxy:

```
POST /api/ai
Body: { messages: [{role, content}][], system: string, task: "json" | "dialogue" }
Response: { content: [{text: string}] }
```

The proxy (`app/api/ai/route.ts`) uses a multi-provider cascade:
1. **Anthropic** (claude-haiku-4-5-20251001) — always first; uses session bearer token in dev
2. **Gemini** — fallback if `GEMINI_API_KEY` set
3. **Groq** — cycles through 4 free models; fallback
4. **Together AI** — fallback
5. **OpenRouter** — last resort

The `ai()` helper in `HolderApp` retries 3× with exponential back-off before surfacing a toast error.
The `parseJ()` helper extracts the first `{...}` JSON object from the response.

---

## Internationalization

Three languages: `fr` (default) · `ar` · `en`

All UI strings live in the `TX` object. Reference via `t.<key>`.
Arabic activates RTL layout: `direction: "rtl"` on the root div and all inputs/selects.
Font family switches via `ff(lang)` — `Tajawal` for `ar`, `Poppins` otherwise.

When adding new strings, add all three language keys to `TX.fr`, `TX.ar`, and `TX.en`.

---

## Key UI Components

| Component | Description |
|---|---|
| `Header` | 58px sticky dark navy bar; IdeaMap "I" logo mark (blue square); user pill (name + badge + logout) |
| `ProgRow` | Step labels + blue gradient progress bar; max-width 720px; below the header |
| `Login` | Full-page dark (`#0A0F2C`) with two blue glow orbs; glass card (`rgba(15,34,51,.95)`); logo image `/logo-transparent.png`; live role detection with colored border |
| `Card` | White, 18px radius, `boxShadow: 0 4px 24px rgba(15,34,51,.08)`, `border: 1px solid rgba(28,58,92,.07)` |
| `Btn` | Full-width, blue gradient primary or outline variant |
| `PBar` | Thin colored progress bar with smooth `width` transition |
| `AccBar` | 4×20px blue vertical bar used as section heading accent |
| `AdvisorAvatar` | Circular gradient (blue) with 🎓 emoji; sizes 24–40px |
| `Dots` | Three bouncing blue dots loading indicator |
| `Toast` | Fixed bottom-center, slide-up animation, red (error) or green (success) |
| `AnimatedScore` | Counts up from 0 to compliance score on mount |
| `Badge` | Role chip: blue (holder), green (coord), purple (admin) |
| `LangToggle` | fr/ar/en pill buttons; active = blue background |
| `HelpAgent` | Floating 💬 button (bottom-right); opens 320px chat panel with IdeaMap Supervisor |

---

## Login Screen Design

- Full-page background: `#0A0F2C` (deep dark blue)
- Two blurred glow orbs: left-bottom `rgba(37,99,235,.18)`, right-top `rgba(30,64,175,.4)`
- Glass card: `background: rgba(15,34,51,.95)`, `border: 1px solid rgba(28,58,92,.8)`, `borderRadius: 22px`, `boxShadow: 0 0 60px rgba(0,0,0,.5)`
- Logo image: `/logo-transparent.png`, 200px wide, centered
- Input: monospace font, `letterSpacing: 1`, border color changes live based on detected role
- Live role badge appears below input when role is detected (colored border matching role)
- CTA button color adapts to detected role color

Account creation screen: same dark background, sticky mini-header, fill-progress bar, dark field inputs with `rgba(255,255,255,.04)` background.

---

## File Map

```
app/
  ideamap/
    page.tsx          ← Entire IdeaMap UI (client component, "use client")
  api/
    ai/
      route.ts        ← Multi-provider AI proxy (server component)
      providers.ts    ← Provider cascade logic (Anthropic → Groq → Gemini → Together → OpenRouter)
  layout.tsx          ← Root layout — title: "IdeaMap", Vercel Analytics
  page.tsx            ← Y-TRACK landing page (untouched)
public/
  logo-transparent.png  ← IdeaMap logo shown on login screen
```

---

## Design Conventions Claude Must Follow

1. **Inline styles only.** No className-based styling except for `fadeUp`, `im-rise`, `shake`, `busy-pulse` (defined in `injectCSS()`).

2. **No new dependencies.** The UI is intentionally zero-dependency beyond React and Next.js. Resist adding UI libraries.

3. **All new components go inside `app/ideamap/page.tsx`** unless they require server-side logic (then `app/api/`).

4. **Mobile-first within a max-width container.** Target 375px minimum. The `maxWidth: "700px"` wrapper handles desktop centering. Budget table hides below 520px and shows card layout instead.

5. **Blue is the primary action color.** Every primary CTA, progress indicator, and active state uses `Y` (#2563EB) or `YL`. Red (`RE`) is strictly for errors.

6. **Dark navy (`ND`) = trust and authority.** Use it for headers, dark card variants, compliance scores, and the question card in dialogue.

7. **Keep the glass-panel aesthetic on the login screen.** `background: rgba(15,34,51,.95)` + `border: 1px solid rgba(28,58,92,.8)`.

8. **Emoji icons are load-bearing UI.** Step icons (`💡📋📊💰🎨✅📁🎉`) replace image assets. Keep them.

9. **Arabic RTL must be tested on every layout change.** Flex row directions, text alignment, and border accents (e.g. `borderLeft`) need mirroring.

10. **The `injectCSS()` function is called once in the root component.** Add global styles there — not in `<style>` tags or separate files.

---

## What Needs Design Work

### High priority
- [ ] **Export screen** — the deliverables list is static; add a real "Download Business Plan" action (generate PDF-ready HTML and trigger print dialog)
- [ ] **Empty states** — coordinator/admin dashboards show a plain text message when no projects exist; add illustrated empty states

### Medium priority
- [ ] **Dark mode** — the login screen is already dark; extend dark-mode tokens to the holder flow cards
- [ ] **Print stylesheet** — add `@media print` rules inside `injectCSS()` for the export/dossier screen

### Already done ✓
- [x] Mobile budget table → card layout below 520px
- [x] Toast notifications on AI call failure
- [x] Dialogue textarea visible + pulsing when busy
- [x] Compliance score animated count-up from 0
- [x] Logo generation step with 3 SVG style variants

---

## INDH Domain Context

When generating or reviewing AI prompts, keep these facts accurate:

- Maximum INDH grant per project: **100,000 MAD**
- Typical INDH contribution: **85%** — holder contribution: **15%**
- Four INDH Phase 3 pillars: Rural development · Territorial reduction of poverty · Human dignity · Horizontal programs
- Eligible sectors: Agriculture/Élevage, Artisanat, Commerce/Services, Agro-alimentaire, Tourisme rural, Numérique/TIC, Textile/Couture, BTP, Éducation/Formation, Pêche
- Jury scoring weights: Impact social 25 · Viabilité 20 · Pertinence territoriale 20 · Capacité de gestion 15 · Durabilité 10 · Innovation 10 = **100 pts**
- Eligible if score ≥ 60/100

---

## Quick Reference — Auth Codes for Testing

| Role | Code |
|---|---|
| Admin | `@adminINDH` |
| Coordinator (example) | `@KHALIDCOD` (must be added by admin first) |
| Holder (new) | Any `AB123456`-format CIN — triggers account creation flow |
| Holder (returning) | Same CIN used during first login |
