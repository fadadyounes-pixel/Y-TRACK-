# CareerMap — Page Specifications
## Login · Information · Admin Dashboard

---

## 1. LOGIN PAGE

### Purpose
Single entry point for all user roles. One access-code field determines who the user is and routes them accordingly.

### URL
`https://careermaponline.org/` → screen `"login"`

### Layout
- Full-screen dark background (`#06111f`) with two animated glow blobs (gold top-left, teal bottom-right)
- Centered card (`max-width: 400px`, `border-radius: 22px`, `background: #0f2540`)
- Language switcher (FR / EN / AR) fixed top-right corner

### Card Content (top → bottom)
| Element | Detail |
|---|---|
| Logo | `CareerMapLogo` SVG, 90px |
| Title | **Career**`Map` — "Map" in teal |
| Subtitle | "Cartographiez votre parcours de carrière" / "Map Your Career & Personality Path" / "خريطة مسارك المهني والشخصي" |
| Label | "Code d'Accès" / "Access Code" / "كود الوصول" |
| Input | Monospace font, auto-uppercase (except `@` prefix). Border color reacts to detected role |
| Role badge | Appears as border color + icon while typing — see below |
| Error | Red text below input on invalid submission |
| CTA button | "Continuer →" / "Continue →" / "← متابعة" — color matches detected role |

### Role Detection (live, by code format)
| Code Format | Role | Color | Icon |
|---|---|---|---|
| `admin` (literal) | Administrator | Green `#1db87a` | ⚙️ |
| `@xyzADV` (@ + letters + ADV) | Advisor | Purple `#9050d0` | 👔 |
| `BJ367307` (2 letters + 6 digits) | Candidate | Teal `#1aabaa` | 🎓 |
| Anything else | Unknown | Red | ❌ |

### Post-Login Routing
| Role | Next Screen |
|---|---|
| `admin` | Admin Dashboard |
| `advisor` | Returning screen (their candidates) |
| `candidate` (new) | Profile Form → Welcome → Tests |
| `candidate` (returning) | Returning screen (resume / retake) |

---

## 2. INFORMATION PAGE (Profile Form)

### Purpose
Collect candidate personal data before assessment. Only shown once — on retake, this page is skipped.

### URL
`https://careermaponline.org/` → screen `"profile"`

### Layout
- Full-screen, scrollable
- TopBar at top (logo + lang + logout)
- Sticky header with progress and "Next →" button
- Scrollable form body below

### Header Strip
- Shows candidate ID in teal monospace
- Title: "Vos informations" / "Your Information" / "معلوماتك الشخصية"
- "Next →" button — gold gradient when all required fields filled, disabled-grey when incomplete
- Error banner if submitted with missing fields (lists what's missing)

### Progress Bar
- Linear bar showing `filledFields / totalFields × 100%` in teal
- Percentage shown as text

### Form Fields (all required except Photo)
| Field | Type | Options |
|---|---|---|
| First Name | Text input | — |
| Last Name | Text input | — |
| Email | Text input | Validated format |
| Phone | Text input | Validated format (+212…) |
| Age Group | Select | 15–17, 18–20, 21–24, 25–30, 31–40, 40+ |
| Gender | Select | Male/Female/Other (localized) |
| Education Level | Select | Collège, Bac, Bac+2, Bac+3, Bac+5, Doctorat… |
| Occupation Status | Select | Student, Job seeker, Employed, Self-employed… |
| Region | Select | 12 Moroccan regions |
| Prefecture | Select | **Only shown when Region = Casablanca-Settat** — auto-scrolls into view |
| Photo | File upload | Optional, stored as base64 data URL |

### Validation
- Real-time: border turns red on invalid, green on valid
- On submit: lists all missing/invalid fields in one error banner
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone regex: `/^[+]?[\d\s\-().]{8,15}$/`

### After Submit
- Profile saved to Firebase `candidates/{id}` + localStorage
- Routes to screen `"welcome"` (assessment intro)

---

## 3. ADMIN DASHBOARD

There are **two separate dashboards**:

---

### 3A. Candidate Manager (`index.html` — screen `"admin"`)

#### Purpose
Real-time management of all candidates: view, filter, export, manage advisors.

#### Access
Login with code `admin` → routed to AdminDash component

#### Top Bar
- CareerMap logo + "Administration" label
- Language switcher
- Logout button

#### Tab Navigation
| Tab | Content |
|---|---|
| **Overview** | KPI cards + chart summary |
| **Candidates** | Filterable table of all candidates |
| **Advisors** | List of advisor accounts |

#### Overview Tab — KPI Cards
| KPI | Description |
|---|---|
| Total Candidates | Count from Firestore |
| Completed | Has Holland + Big5 + Skills scores |
| Female % | Gender split |
| By Region | Top regions bar |
| Period filter | Last 7 / 30 / 90 days / All time |

#### Candidates Tab — Table
Columns: Avatar · Name · ID · Region · Code · Holland type · Employability % · Date · Actions

**Filters:**
- Search (name / ID / email)
- Region dropdown
- Gender dropdown
- Holland type dropdown
- Sort by any column (asc/desc)

**Row Actions:**
- 👁 View full candidate detail modal
- 📄 Download PDF report
- 🗑 Delete candidate (with confirmation)

**Candidate Detail Modal:**
- Full profile (photo, all fields)
- Holland hexagon radar chart
- Big Five scores
- Skills scores
- OrientaMap orientation result
- Placement test results (English / French)
- Resilience / EQ / Entrepreneurship scores
- PDF download button

**Export:**
- "Export CSV" button → downloads semicolon-separated file with all candidate data

#### Advisors Tab
- List of all advisor accounts (name, code, created date)
- "Add advisor" form: enter name → auto-generates `@nameADV` code
- Copy code to clipboard button
- Delete advisor button

---

### 3B. Analytics Dashboard (`admin.html` — separate page)

#### Purpose
National-level statistical analytics for INDH supervisors. Read-only, uses demo/generated data.

#### URL
`https://careermaponline.org/admin.html`

#### Access
Standalone page — no auth required (separate file)

#### Layout
- Fixed header + filter bar + KPI bar + tab content
- Dark theme matching main app

#### Header
- Logo + "Tableau de Bord Analytique" title
- Sample size slider (12–120 candidates, for demo data)
- "Données en direct" live indicator
- Supervisor identity chip (Superviseur / INDH · National)

#### Period Filter Bar
7 jours · 30 jours · 90 jours · Tout

#### KPI Bar (6 tiles)
| KPI | Color |
|---|---|
| INSCRITS (total candidates) | Teal |
| BILANS COMPLETS + % completion | Green |
| RAPPORTS PDF téléchargés | Purple |
| CONSEILLERS ACTIFS / total | Gold |
| ALERTES ROUGES (TRIPLE_RISK flag) | Red |
| RÉGIONS couvertes / 12 | Orange |

#### Tabs
| Tab | Charts / Content |
|---|---|
| **Vue d'ensemble** | Donut (Holland distribution), bar (top regions), spark (registrations over time), radar (avg Big5), completion funnel |
| **Démographie** | Age distribution, gender split, education level, occupation status, region map |
| **Tests & Scores** | Holland type frequency, Big5 averages, Skills radar, Employability histogram |
| **INDH** | INDH-specific metrics — social vulnerability, regional coverage, flagged cases |
| **Conseillers** | Advisor table: name, candidate count, avg completion rate, active status |
| **Données** | Raw candidate table with search + sort + CSV export |

#### Chart Types Used
- Donut chart (SVG, animated)
- Horizontal bar chart
- Sparkline (mini time-series)
- Radar / spider chart
- Progress bars

---

## Color Palette Reference

```
bg:    #06111f   (page background)
sur:   #0d1f33   (surface)
card:  #0f2540   (card)
cardB: #122d4a   (card variant)
bdr:   #1a3a55   (border)
wh:    #f0f4f8   (white text)
mu:    #6b8aaa   (muted text)
muB:   #8fadc8   (muted brighter)
body:  #c8daf0   (body text)
teal:  #1aabaa   (primary accent)
pu:    #9050d0   (purple — advisors)
gr:    #1db87a   (green — admin / success)
re:    #dc4c3c   (red — error / alert)
gold:  #e8b84b   (gold — CTA)
```

---

## Tech Stack Notes

- Single HTML file, React 18 + Babel Standalone (JSX compiled in-browser)
- Firebase Firestore for candidate persistence
- localStorage fallback when offline
- PWA with service worker (`careermap-v108`) — auto-reloads all clients on update
- No build step — edit `index.html` directly
- `var` only (no `const`/`let`), no template literals (Babel constraint)
