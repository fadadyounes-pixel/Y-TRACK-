# TalentMap — Design Brief for Claude

> Single source of truth for TalentMap's visual design. Read this before touching any file under the TalentMap UI.

---

## What TalentMap Is

TalentMap (talentmaponline.org) is an AI-powered recruitment platform that matches candidates to job openings via CV analysis. Three roles:

| Role | Access Code | Dashboard |
|---|---|---|
| **Admin** | `ADMIN001` | `/admin` — user management, stats |
| **Coordinator** | `COORD001` | `/coordinator` — job posts, candidate CVs |
| **Candidate** | `CAN001–CAN003` | `/candidate` — profile, CV upload, match score |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | **CSS custom properties** (`globals.css`) + inline React styles |
| Auth | `contexts/AuthContext.tsx` — localStorage, mock users |
| Fonts | `Inter` (primary), `monospace` (ID/code inputs) |

---

## Design Tokens

All tokens are defined in `app/globals.css` as CSS custom properties.

### Color Palette

```css
/* Blue scale — primary brand */
--blue-900: #0a1f5c   /* Navy dark — headers, gradients */
--blue-800: #1a3a8f   /* Navy — gradient end */
--blue-700: #1d4ed8   /* Blue — btn-primary background */
--blue-600: #2563eb   /* Blue bright — accents, links, active */
--blue-500: #3b82f6   /* Blue medium */
--blue-100: #dbeafe   /* Blue pale — "Good" badge bg */
--blue-50:  #eff6ff   /* Blue tint — skill pills, selected state */

/* Light blue */
--light-blue-400: #38bdf8
--light-blue-300: #7dd3fc
--light-blue-200: #bae6fd
--light-blue-100: #e0f2fe

/* Gray scale */
--gray-900: #111827   /* Body text */
--gray-800: #1f2937
--gray-700: #374151
--gray-600: #4b5563
--gray-500: #6b7280   /* Secondary text */
--gray-400: #9ca3af   /* Metadata labels */
--gray-300: #d1d5db
--gray-200: #e5e7eb   /* Dividers */
--gray-100: #f3f4f6   /* Tag backgrounds */
--gray-50:  #f9fafb   /* Page background */
--white:    #ffffff

/* Semantic */
--success: #10b981
--warning: #f59e0b
--danger:  #ef4444
```

### Additional Colors (inline, not in CSS vars)

```
#0a1f5c  Navy primary — page headers, gradients
#f8fafc  Input background, table header rows
#0f172a  Input text (near-black)
#93c5fd  Disabled button background
#7c3aed  Role color: Admin (purple)
#059669  Role color: Coordinator (green)
#2563eb  Role color: Candidate (blue)
#dc2626  Error text, unknown role
```

### Score Badge System (3 tiers)

| Score | Background | Text |
|---|---|---|
| ≥ 70 "Excellent" | `#d1fae5` | `#065f46` |
| ≥ 40 "Good" | `#dbeafe` | `#1e40af` |
| < 40 "Poor" | `#fee2e2` | `#991b1b` |

### Role Badge System

| Role | Background | Text |
|---|---|---|
| Admin | `#fef3c7` | `#92400e` |
| Coordinator | `#eff6ff` | `#1d4ed8` |
| Candidate | `#f3f4f6` | `#374151` |

---

## Typography

**Font family**
- Primary: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Monospace: `monospace` — ID inputs, code cells

**Size scale**

```
2rem    — Stat card numbers (weight 800)
1.75rem — Page h1, Logo lg
1.5rem  — Login h1
1.4rem  — PageHeader title
1.15rem — Card section headings
1.05rem — Input text
0.95rem — Body, button labels
0.875rem — Small body, table cells
0.82rem — Skill pills, score badges
0.78rem — Coordinator stats
0.75rem — Badge text
0.72rem — Uppercase metadata labels (ALL CAPS, tracking 0.08em)
0.6rem  — Logo subtitle
```

**Font weights:** 800 (display), 700 (headings), 600 (buttons/badges), 500 (field values)

**Heading letter-spacing:** `-0.02em` on all h1/display text

**Uppercase metadata labels** (standard pattern throughout):
```css
font-size: 0.72rem;
font-weight: 700;
color: #9ca3af;
text-transform: uppercase;
letter-spacing: 0.08em;
```

---

## Spacing & Layout

| Context | Value |
|---|---|
| Page container max-width | `1200px` |
| Content pages max-width | `900px` |
| Side padding | `1.5rem` |
| Content padding | `2rem 1.5rem` — `2.5rem 1.5rem` (candidate) |
| Between sections | `1.5rem` — `1.75rem` |
| Inside cards | `0.75rem` — `1.25rem` |
| Skill tag gap | `0.35rem` — `0.5rem` |

**Grid templates**
- Stat cards: `repeat(auto-fill, minmax(180px, 1fr))`, gap `1rem`
- Two-column: `1fr 1fr`, gap `1.5rem`
- Profile info grid: `repeat(auto-fill, minmax(200px, 1fr))`, gap `1.25rem`
- Coordinator overview: `1fr 340px`, gap `1.5rem`

---

## Border Radius Scale

```
4px    — Small role/skill chips inside tables
7px    — Language toggle buttons
8px    — Standard: buttons, inputs, error box
10px   — Login input, tab containers, job rows
12px   — .card utility class
14px   — Welcome banner gradient block
16px   — Login card
50%    — Avatar initials circles
9999px — Pills: skill tags, score badges, status chips, progress bars
```

---

## Box Shadows

```
Card:            0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)
Login card:      0 25px 60px rgba(0,0,0,0.35)
btn-primary:hover 0 4px 12px rgba(29,78,216,0.35)
btn-white:hover   0 4px 12px rgba(37,99,235,0.25)
```

---

## Components

### Brand Gradient

Used on all page headers and login background:
```css
background: linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%);
/* OR for more vivid: */
background: linear-gradient(135deg, #0a1f5c 0%, #2563eb 100%);
```

### `.card`

```css
background: white;
border-radius: 12px;
box-shadow: 0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
padding: 1.5rem;
```

### `.btn-primary`

```css
background: #1d4ed8;
color: white;
padding: 0.75rem 1.75rem;
border-radius: 8px;
font-weight: 600;
font-size: 0.95rem;
/* hover: */
background: #1a3a8f;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(29,78,216,0.35);
```

### `.btn-secondary`

```css
background: white;
color: #1d4ed8;
border: 2px solid #1d4ed8;
padding: 0.75rem 1.75rem;
border-radius: 8px;
/* hover: background #1d4ed8, color white */
```

### `.btn-white`

```css
background: white;
color: #1d4ed8;
padding: 0.75rem 1.75rem;
border-radius: 8px;
font-weight: 700;
/* hover: background #eff6ff, translateY(-1px) */
```

### PageHeader

```tsx
<PageHeader title="TalentMap" subtitle="Admin Portal" />
```

- bg: `linear-gradient(135deg, #0a1f5c, #1a3a8f)`
- Logo (light variant, md) on the left
- Title: `1.4rem` / 800 / white / tracking `-0.02em`
- Subtitle: `0.85rem` / `rgba(255,255,255,0.6)`
- Logout button: absolute `top:50% right:1.5rem`, `rgba(255,255,255,0.15)` bg

### Logo

```tsx
<Logo size="sm" | "md" | "lg" showText variant="dark" | "light" />
```

- Icon: SVG map-pin with trending-up chart polyline, fill `#2563eb`
- Wordmark: "Talent**Map**" — "Map" always accented in `#2563eb` (dark) or `#93c5fd` (light)
- Subtitle: "Recruitment Platform" — `0.6rem` / 600 / tracking `0.1em` / uppercase

### Skill Pills

```css
/* Standard (profile cards) */
background: #eff6ff;
color: #1d4ed8;
border-radius: 9999px;
padding: 0.3rem 0.85rem;
font-size: 0.82rem;
font-weight: 600;

/* Compact (tables) */
border-radius: 4px;
padding: 0.1rem 0.45rem;
font-size: 0.68–0.72rem;
```

### Left-Border Accent Card

Used for "featured item" (best match job, open job offers):
```css
border-left: 4px solid #2563eb;
```

### Progress Bar

```css
/* Container */
width: 160px; height: 10px;
background: #f3f4f6; border-radius: 9999px; overflow: hidden;

/* Fill */
background: [scoreColor]; border-radius: 9999px;
transition: width 0.8s ease;
```

### Tables

```css
/* Header row */
background: #f8fafc;
font-size: 0.72rem; font-weight: 700;
color: #6b7280 or #9ca3af;
text-transform: uppercase; letter-spacing: 0.05–0.08em;
border-bottom: 2px solid #e5e7eb;

/* Body rows */
border-bottom: 1px solid #f9fafb or #f3f4f6;
cell padding: 0.65–0.875rem;

/* Summary/total row */
background: #f8fafc;
border-top: 2px solid #e5e7eb;
```

### Tab Buttons

```css
/* Container */
border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden;

/* Active tab */
background: #0a1f5c (admin) or #2563eb (coordinator); color: white;

/* Inactive tab */
background: white; color: #6b7280;
```

### Activity Feed Dot Colors

```
login:  #8b5cf6  (purple)
upload: #3b82f6  (blue)
job:    #f59e0b  (amber)
match:  #10b981  (green)
```

---

## Login Page

- **Background**: `linear-gradient(135deg, #0a1f5c, #1a3a8f)` full viewport
- **Card**: white, `16px` radius, max-width `420px`, shadow `0 25px 60px rgba(0,0,0,0.35)`, padding `2.5rem 2rem`
- **Logo**: `size="lg"` variant `"dark"` at top of card
- **Input**: monospace font, letter-spacing `0.06em`, border changes to role color on detection
- **Live role badge**: below input, `[roleColor]12` bg, `[roleColor]30` border, `8px` radius
- **Submit button**: full width, adopts `roleColor` when role detected, disabled = `#93c5fd`
- **Language toggle**: FR / EN pill buttons, top-right of card
- **Hint text**: `0.78rem`, `#94a3b8`

---

## Design Conventions

1. **All transitions**: `transition: all 0.2s` or `all 0.15s`
2. **Error state**: always `#ef4444` / `#dc2626` family
3. **Page background**: universally `#f9fafb`
4. **Score badges**: always 3-tier green/blue/red system
5. **Skill chips**: always blue-tinted (`#eff6ff` / `#1d4ed8`)
6. **Featured item accent**: `borderLeft: 4px solid #2563eb`
7. **Uppercase labels**: `0.72rem / 700 / #9ca3af / uppercase / tracking 0.08em`
8. **Avatar initials circles**: `border-radius: 50%`, bg `#eff6ff`, text `#1d4ed8`
9. **No new dependencies** — zero third-party UI libraries
10. **Inline styles** for component-specific overrides, CSS custom properties for tokens

---

## File Map

```
app/
  page.tsx              ← TalentMap landing/home page
  login/page.tsx        ← Login with live role detection
  admin/page.tsx        ← Admin dashboard
  coordinator/page.tsx  ← Coordinator dashboard
  candidate/page.tsx    ← Candidate profile + match score
  candidate/upload/     ← CV upload flow
  coordinator/jobs/     ← Job offer management
  globals.css           ← All CSS tokens + utility classes
components/
  Logo.tsx              ← Brand logo component
  PageHeader.tsx        ← Shared dark gradient page header
contexts/
  AuthContext.tsx       ← Auth state, mock users, localStorage
```

---

## Mock Users (for testing)

| ID | Role | Email |
|---|---|---|
| `ADMIN001` | admin | admin@talentmap.ma |
| `COORD001` | coordinator | sara@talentmap.ma |
| `CAN001` | candidate | mohammed@email.com |
| `CAN002` | candidate | sarah@email.com |
| `CAN003` | candidate | karim@email.com |
