# CLAUDE_DOSSIER.md — Dossier Factory data model & domain rules

Companion to `CLAUDE.md` (IdeaMap's design brief) and
`IDEAMAP_DOSSIER_FACTORY_PROMPT.md` (the build plan, executed phase by phase
per its §12). This file is the single source of truth for the **data model**
— what a dossier contains, where each piece comes from, and the domain rules
that must hold regardless of whether a dossier originated from a holder's
own guided dialogue or a coordinator's bulk committee-Excel import.

Code: `lib/ideamap/dossier/` (`schema.ts`, `questions.ts`, `finance.ts`,
`version.ts`, `generators.ts`). Nothing in this document describes behavior
that isn't either already shipped in `app/ideamap/page.tsx` or scaffolded
(inert, not yet wired in) under `lib/`.

---

## 1. Two paths, one shape

| | Holder flow (shipped) | Bulk import (Dossier Factory) |
|---|---|---|
| Who | the holder themselves | a coordinator/admin, on behalf of many holders at once |
| Input | the 30-question dialogue, or a coordinator's custom questionnaire | a committee Excel (one row per project) |
| Entry point | `HolderApp` in `app/ideamap/page.tsx` | `CoordDash`'s "Nouvel import comité" (planned — not yet built) |
| Output | `ProjectProfile` / `BusinessPlan` / `Budget` / `Compliance` (`proj`/`plan`/`budget`/`comp`) | the same four shapes, one set per imported row |

Both paths build the exact same `ProjectProfile` / `BusinessPlan` / `Budget`
/ `Compliance` shapes (see `lib/ideamap/dossier/schema.ts`) so every
downstream consumer — the Plan/Budget/Compliance screens, `generatePptxDeck`,
`generateComitePresentation`, the three DOCX generators in
`lib/ideamap/dossier/generators.ts` — works identically no matter which path
produced the data. A dossier imported in bulk is not a second-class citizen
of a dossier a holder typed themselves; once the bulk importer exists, the
exact same four generators apply to it unchanged.

The coordinator-upload "Import application answers" feature (shipped,
`app/api/parse-application/route.ts`) is the single-holder precedent for
this: one document in, one populated `ProjectProfile` out, landing the
holder on the Profile step. The bulk importer is the same idea at the scale
of a whole committee spreadsheet.

## 2. The 8-step holder flow

```
idea → dialogue → profile → plan → budget → compliance → documents → export
```

(The brand-identity `logo` step was removed — it wasn't part of the dossier
schema and sat between a porteur stating their funding request and seeing
it scored, adding a step with no committee-file output.)

(`STEPS` in `HolderApp`, `app/ideamap/page.tsx`.) The Dossier Factory build
plan refers to the third step as "dossier" — that is the same step as
`profile` here; this document always uses the code's own name, `profile`, to
avoid two names for one thing.

- **idea** — free-text project idea, used to seed tap-option suggestions.
- **dialogue** — the 30-question fiche (`HOLDER_QUESTIONS`, or a
  coordinator's own uploaded questionnaire, `customQuestions`) walked one
  question at a time; each answer appends to `msgs`.
- **profile** — `ProjectProfile` compiled from the full `msgs` transcript by
  AI (`ensureJson` in `sendMsg()`), with an instant local draft
  (`buildLocalProfile`) shown immediately and silently upgraded.
- **plan** / **budget** — `BusinessPlan` and `Budget` (`genPlan()`), same
  instant-draft-then-AI-upgrade pattern (`buildLocalPlan`, `buildLocalBudget`).
  The budget's total is always the porteur's own stated cost
  (`ProjectProfile.estimatedBudget`, read from their answer to "coût total
  estimé") — 100 000 MAD is the INDH contribution's ceiling
  (`computeSplit`/the inline `Math.min(total*0.9, 100000)` equivalent), never
  a floor or a default the total gets pushed toward. The first budget line
  item is the porteur's own stated equipment (`ProjectProfile.equipmentRequested`,
  read verbatim from their answer to "quel équipement principal...", carried
  through unparaphrased), topped up with sector-known items only to round out
  the rest.
- **compliance** — `Compliance` / jury score (`checkComp()`,
  `buildLocalCompliance`).
- **documents** — per-document checklist + attachments.
- **export** — download the dossier's 4 official committee files (§3a below),
  in fr/ar/en. A coordinator gets the same 4 files for any of their holders
  from `CoordDash`'s holder-detail view (`downloadHolderDocument`). The
  holder-facing Pitch Deck / Dossier Jury PPTX and the other bonus exports
  (PDF summary, jury prep sheet, submission guide, etc.) that used to sit
  alongside these 4 were removed — the 4 committee files are the only
  options now, per explicit request to stop cluttering this step.

### 3a. The dossier's 4 files (§1 of the build plan)

| File | Generator | Format |
|---|---|---|
| Présentation comité | `generateComitePresentation` (`app/ideamap/page.tsx`) | PPTX, 10 slides, Arabic by default (fr/en selectable, matching the rest of the app) |
| Fiche Projet | `buildFicheProjetDoc` (`lib/ideamap/dossier/generators.ts`) | DOCX |
| Fiche Technique | `buildFicheTechniqueDoc` (`lib/ideamap/dossier/generators.ts`) | DOCX |
| Business Plan | `buildBusinessPlanDoc` (`lib/ideamap/dossier/generators.ts`) | DOCX |

All four build entirely from `ProjectProfile`/`BusinessPlan`/`Budget`/
`Compliance` already on the dossier — no AI call, per §2's "generators must
never depend on the AI being up." Each DOCX generator takes an `isAssumed`
flag (always `false` today, since both the holder flow and the coordinator
upload are always holder-sourced data); once the bulk importer exists and a
dossier is built from a sector benchmark rather than a holder's own answer,
that flag drives the §4.3 "hypothèses" note printed into the document.

## 3. `ProjectProfile` / `BusinessPlan` / `Budget` / `Compliance`

Full field-level types: `lib/ideamap/dossier/schema.ts`. These are not new —
they document the exact shapes already built and consumed throughout
`app/ideamap/page.tsx` (`sendMsg()`, `genPlan()`, `checkComp()`,
`generatePptxDeck()`). `JuryScore` carries the INDH 6-criteria weights:
impact 25 · viability 20 · relevance 20 · management 15 · sustainability 10 ·
innovation 10 = 100 pts, eligible at ≥ 60.

## 4. Committee Excel import (new)

### 4.1 Column mapping

A committee file (reference shape:
`Presentation_Projets_INDH_ANFA_Promo2_Comite.xlsx`, not yet present in this
repo — see "What's missing" below) maps to `CommitteeRow`
(`lib/ideamap/dossier/schema.ts`) by header text, synonyms, case/accent
insensitive:

| Field | Accepted headers (examples) |
|---|---|
| `numero` | N°, No, Numéro |
| `porteur` | Porteur de projet, Porteur, Nom et prénom |
| `age` | Âge, Age (text "N.C." → `null`) |
| `intitule` | Intitulé du projet, Projet |
| `secteur` | Secteur |
| `presentation` | Présentation du projet, Description |
| `equipements` | Équipements à financer, Équipements |
| `cout` | Coût du projet, Devis TTC |
| `subvention` | Subvention INDH |
| `apport` | Apport du porteur, Apport |
| optional | CIN, Téléphone, E-mail, Sexe, Quartier, Nom commercial |

`secteur` (plus `intitule`, for the Coiffure gender split) maps to a stable
`sectorKey` via `mapSectorToKey()` in `lib/ideamap/dossier/finance.ts` —
unknown sectors resolve to `"autre"` and raise a validation warning.

### 4.2 Validation (§4.3 of the build plan)

| Check | Level |
|---|---|
| Missing porteur, intitulé, secteur or coût | ❌ error |
| `cout` > `PLAFOND_PROJET` (100 000 MAD) | ❌ error |
| `subvention` ≠ 90% of `cout` (± 0.01) or `apport` ≠ `cout` − `subvention` | ⚠️ warning |
| Duplicate N° or duplicate porteur + intitulé | ⚠️ warning |
| Age missing / "N.C." | ⚠️ warning |
| Unknown sector | ⚠️ warning (mapped to `autre`) |
| Sum of rows ≠ file's TOTAL row | ⚠️ warning, import-level |
| File's *Récapitulatif* sheet inconsistent with *Projets* | ⚠️ warning, import-level |
| Missing business-plan inputs (panier moyen, clients/jour, charges…) | ⚠️ warning → §4.3 below |

Result shape: `ValidationReport` / `ValidationIssue` in `schema.ts`.

### 4.3 Assumptions

A committee Excel has no operating figures (panier moyen, clients/jour,
charges, growth). `getSectorBenchmark()` in `finance.ts` proposes seed
values per sector — **placeholders the Admin must review before launch**,
not production numbers. Every dossier built from a benchmark rather than a
holder's own answers is tagged `assumptions.source === "benchmark"`, and any
generated document built on one must print a visible note (never silent):

> *"Projections établies sur hypothèses sectorielles – à valider avec le
> porteur."*

A coordinator can edit the figures directly, or send the holder an
invitation link that opens the (already-shipped) holder flow pre-filled,
landing on `profile` exactly like the existing "Import application answers"
feature — on submit, the dossier is regenerated with
`assumptions.source === "holder"`.

## 5. Finance rules

- `PLAFOND_PROJET = 100 000` MAD — the project-cost cap, already enforced
  throughout the holder flow (`genPlan`, `buildLocalBudget`, the PPTX
  generator, compliance scoring).
- `computeSplit(totalCost)` — INDH covers 90% (capped at `PLAFOND_PROJET`),
  the holder brings 10%. This is the same math already inlined at every one
  of those call sites; `lib/ideamap/dossier/finance.ts` centralizes it so
  the bulk-import validator and the holder flow can share one
  implementation in a later pass, without changing either today.

## 6. What's built (Phase 1) vs. what's pending

**Built, inert (zero effect on the live site until a later phase wires it
in):**
- `lib/ideamap/dossier/{schema,questions,finance,version}.ts`
- `db/migrations/0001_init.sql` (full §7.1 schema)
- `lib/db.ts` (Postgres client, gated on `DATABASE_URL`)
- `lib/storage.ts` (Vercel Blob client, gated on `BLOB_READ_WRITE_TOKEN`)
- `lib/ideamap/session.ts` (signed-cookie sessions with role/scope checks,
  gated on `SESSION_SECRET`)

**Wired into the live app today:**
- `HOLDER_QUESTIONS` — `HolderApp`'s `BUILTIN_FIXED_Q` now imports this
  instead of declaring its own copy (pure refactor, no behavior change).
- The dossier's full 4 files (§3a): `generateComitePresentation` (PPTX,
  10 slides) plus `buildFicheProjetDoc` / `buildFicheTechniqueDoc` /
  `buildBusinessPlanDoc` (DOCX), reachable both from a holder's own export
  step and from `CoordDash`'s holder-detail "Dossier complet" section.
  Verified end-to-end (Playwright + python-docx/zip inspection): real,
  valid files with correct per-role data, correct 10-slide structure, and
  working fr/ar language switching.
- `generateHoldersExcel` + the HelpAgent `actions` allow-list (PR #100) —
  a real `.xlsx` holders-list export, triggerable from chat or a quick-action
  chip. Note: this is a reporting export (one row per holder), distinct from
  the per-project dossier files above and from the future `buildCommitteeExcel`
  (§4.5's consolidated *Projets*+*Récapitulatif* import-level export).
- The export step (holder and coordinator) now offers **only** the 4 files
  above — the Pitch Deck, Dossier Jury, PDF dossier, jury prep sheet, and
  other bonus exports that used to sit alongside them were removed, along
  with the now-fully-unreachable `generatePptxDeck`/`dlPDF`/
  `dlFicheSynthetique`/`genAndDlPitchArabe`/`genAndDlQA` functions that built
  them.
- The **Logo step is gone** from the holder flow (8 steps, not 9) — it
  generated a brand identity that was never part of the dossier schema.
- The budget/equipment fix: `ProjectProfile` gained an `equipmentRequested`
  field carrying the porteur's own stated equipment answer verbatim (both
  the AI profile-compilation prompt and the local heuristic now populate
  it), and `buildLocalBudget`'s total no longer clamps to an artificial
  55 000–111 000 MAD range — it uses the porteur's real stated cost
  directly, with 100 000 MAD applied only as the INDH contribution's
  ceiling (never a floor). The AI budget-generation prompt was corrected to
  match (it previously instructed "total doit être entre 55 000 et 111 000
  MAD", which fabricated numbers for any porteur whose real project costs
  less).

**Explicitly NOT touched in this phase**, per the "no change to login and
information page" instruction: the `Login` component, `onLogin()`, and the
current client-side-only auth flow in `app/ideamap/page.tsx` are untouched.
`lib/ideamap/session.ts` exists as code but nothing calls it yet.

**Missing inputs needed before later phases can proceed for real:**
- A real `DATABASE_URL` (Neon recommended), with `0001_init.sql` applied.
- A real `BLOB_READ_WRITE_TOKEN` (Vercel Blob, attach via the Vercel
  dashboard).
- A job-queue provider + credentials (Inngest recommended — §7.3).
- The reference committee Excel
  (`Presentation_Projets_INDH_ANFA_Promo2_Comite.xlsx`) and its expected
  golden-fixture numbers (§11 of the build plan) — needed to build and test
  the parser (`exceljs`, already added to `package.json`) against a real
  file rather than a guessed column layout.
- A `SESSION_SECRET` — once scopes exist in Postgres, cutting the live
  `Login` flow over to signed sessions is a deliberate follow-up change,
  not part of this phase.
