# CareerMap — Psychometric Assessment Platform

## Overview

CareerMap is a mobile-first Progressive Web App (PWA) for career guidance and psychometric assessment, designed for the Moroccan market. It combines three validated assessment frameworks to generate personalized career reports in French, English, and Arabic.

**Live URL:** `https://careermaponline.org/careerMap/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 (CDN, Babel Standalone — no build step) |
| Database | Firebase Firestore v9.23 (falls back to localStorage) |
| PDF | Browser native `window.print()` + `@media print` CSS |
| PWA | Service Worker (Network First strategy), Web App Manifest |
| Fonts | Epilogue · Syne · Noto Naskh Arabic |
| Languages | French (default) · English · Arabic (RTL) |
| Hosting | GitHub Pages (`careermaponline/careerMap` repo) |
| CI/CD | GitHub Actions — auto-deploys on push to `claude/publish-careermap-pages-nf29c` |

---

## Roles

| Role | Access Code | Capabilities |
|---|---|---|
| **Admin** | `@adminyfadad` | Manage advisors, view all candidates, delete records, full analytics |
| **Advisor** | Registered code (set by admin) | Enroll candidates by result code, view candidate & advisor reports |
| **Candidate** | Auto-generated ID (e.g. `RR1345`) | Complete assessment, view personal report, share result code |

---

## User Flow

```
Landing Page
    └── Login (role detection by code format)
            ├── Candidate → Profile Form → Welcome → Assessment → Result Code
            ├── Advisor  → Advisor Dashboard (enroll candidates, view reports)
            └── Admin    → Admin Dashboard (all candidates, all advisors, analytics)
```

### Candidate Flow
1. Enter access code on login screen
2. Fill in profile (name, age, gender, education, region, status, optional photo)
3. Complete 3 assessment phases (75 questions total)
4. Receive result code (`RPT-XXXX`) — share with advisor
5. Advisor enters code → views full report

---

## Assessment Framework

### Phase 1 — Holland RIASEC (30 questions)
Six career personality types:

| Code | Type | Description |
|---|---|---|
| R | Realistic | Practical, hands-on, technical |
| I | Investigative | Analytical, scientific, problem-solving |
| A | Artistic | Creative, expressive, independent |
| S | Social | Helping, teaching, collaborative |
| E | Enterprising | Leadership, persuasion, entrepreneurial |
| C | Conventional | Organized, detail-oriented, procedural |

Generates a **2-letter Holland Code** (e.g. AS, IE) used for career matching.

### Phase 2 — Big Five OCEAN (25 questions)

| Code | Factor | High score means |
|---|---|---|
| O | Openness | Creative, curious, innovative |
| C | Conscientiousness | Organized, reliable, goal-driven |
| E | Extraversion | Sociable, energetic, networked |
| A | Agreeableness | Empathetic, collaborative, trusting |
| N | Emotional Stability | Resilient, calm under pressure |

### Phase 3 — Skill Up (20 questions)
Four employability dimensions:
- **R** — Readiness (job market preparedness)
- **A** — Autonomy (independent work capacity)
- **C** — Collaboration (teamwork aptitude)
- **Leadership score** = E×0.25 + A×0.25 + C×0.2 + A2×0.15 + C2×0.15

---

## PDF Report — 9 Sections

| # | Section | Content |
|---|---|---|
| I | Career Profile (RIASEC) | Scores per dimension, 2-letter Holland Code, recommended careers |
| II | Personality Profile (OCEAN) | Big Five scores with development notes |
| III | Employability Profile (Skill Up) | 4-dimension employability radar |
| IV | Leadership Profile | One of 5 leadership styles: Transformational · Servant · Strategic · Collaborative · Emerging |
| V | Academic Orientation | Recommended institutions and programs (by education level) |
| VI | E-Learning Roadmap | Platforms, certifications, and online courses |
| VII | Career Roadmap | 0–3 months → 3–6 months → 1–3 years → 3–5 years milestones |
| VIII | INDH Programs | Morocco national initiative program matching (Job Seeker / Project Holder / Cooperative) |
| IX | Clinical Intervention Plan | Advisor-facing structured notes per dimension (Holland + OCEAN + Skill Up) |

### Report Features
- **Cover page** — compass logo, candidate name, optional photo, role badge
- **Logo header** on every page (via HTML `<thead>` repeating in print)
- **Paragraphs never split** across pages (`break-inside: avoid`)
- Available in **FR / EN / AR**
- Two versions: **Candidate Report** (general) and **Advisor Report** (includes Section IX clinical notes)

---

## Data Model

### Candidate Record (Firestore: `candidates` collection)
```json
{
  "id": "RR1345",
  "name": "Ahmed Benali",
  "code": "RPT-RR1345",
  "advisorId": "ADV001",
  "savedAt": "2026-05-25T10:00:00Z",
  "profile": {
    "firstName": "Ahmed",
    "lastName": "Benali",
    "email": "ahmed@example.com",
    "phone": "+212 6XX XXX XXX",
    "age": "21-24",
    "gender": "Male",
    "edu": "Bac+3",
    "region": "Casablanca-Settat",
    "prefecture": "Casablanca",
    "status": "Student",
    "photo": "<base64 data URL — optional>"
  },
  "scores": {
    "h": { "R": 30, "I": 55, "A": 88, "S": 75, "E": 60, "C": 42 },
    "b": { "O": 90, "C": 65, "E": 70, "A": 80, "N": 35 },
    "s": { "emp": 72, "lead": 68, "collab": 85, "adapt": 60 }
  }
}
```

### Advisor Record (Firestore: `advisors` collection)
```json
{
  "name": "Dr. Fatima Zahra",
  "code": "ADV001",
  "createdAt": "25/05/2026"
}
```

---

## File Structure

```
careermap-download/
├── index.html       — entire app (React + all logic, ~3900 lines)
├── sw.js            — service worker (network-first, cache version: v30)
├── manifest.json    — PWA manifest
└── icons/           — app icons
```

---

## Deployment

Pushes to branch `claude/publish-careermap-pages-nf29c` that touch `careermap-download/**` automatically trigger a GitHub Actions workflow that deploys to the `careermaponline/careerMap` GitHub Pages repo.

To force-refresh after a deploy (service worker cache):
1. Open DevTools → Application → Service Workers → **Unregister**
2. Hard reload: `Ctrl+Shift+R`
3. Or open an **Incognito window**

---

## Pending Feature

**Per-advisor candidate filtering** — each advisor should see only candidates they enrolled. Currently all advisors share the same candidate pool. Requires saving `advisorId` on the candidate record at enrollment time and filtering the dashboard list accordingly.
