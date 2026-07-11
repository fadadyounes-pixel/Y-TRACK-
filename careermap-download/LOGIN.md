# CareerMap — Login & Information Pages

**URL** : `https://careermaponline.org`

---

## Login Page

### Access

The app opens directly on the login screen. There is **no username/password** — authentication uses a single **Access Code** that determines the user's role automatically.

### Access Code Formats

| Role | Code Format | Example |
|---|---|---|
| **Administrator** | Fixed secret code | `@adminyfadad` |
| **Advisor** | `@` + name + `ADV` | `@BenaliADV` |
| **Candidate** | 2 uppercase letters + 3+ digits | `CM001` |

### How to Log In

1. Open `https://careermaponline.org`
2. Select your language — **FR**, **EN**, or **AR** (top-right corner)
3. Type your access code in the **Access Code** field
4. Click **Continue →**

The app routes you automatically based on the code:

| Code type | Destination |
|---|---|
| Admin code | Admin dashboard |
| Advisor code (`@…ADV`) | Advisor panel |
| New candidate code | Profile form → Welcome screen → Tests |
| Returning candidate code | Results screen (your code + retake option) |

### Error Messages

| Message | Cause |
|---|---|
| "Please enter your access code." | Field left empty |
| "Invalid code." | Code doesn't match any known format |
| "Advisor not found." | Advisor code not in the system |

---

## Information / Welcome Page

Displayed to **new candidates** after completing the profile form. It introduces the three assessments.

### Content

**Greeting**

> "Hello, [Your Name] 👋"

**Headline**

| Language | Text |
|---|---|
| FR | "Trois tests. Votre carte de carrière complète." |
| EN | "Three tests. Your complete career map." |
| AR | "ثلاثة اختبارات. خريطة مهنية متكاملة." |

**Instruction**

> Complete all 3 tests to receive your results code to share with your advisor.

### The Three Tests

| # | Test | Questions | Duration |
|---|---|---|---|
| 1 | 🎯 Holland Career Test | 30 | ~20 min |
| 2 | 🧠 Big Five Personality | 25 | ~15 min |
| 3 | ⚡ Skill Up | 20 | ~12 min |

**Total : ~75 questions · ~47 minutes**

Click **"Begin All 3 Tests →"** to start.

---

## Returning Candidate Screen

If you log in again after completing all tests, you land on your **results screen** instead of the welcome page.

| Element | Description |
|---|---|
| Results code | Large gold monospace code — share this with your advisor |
| Copy Code button | Copies the code to clipboard |
| Retake Tests | Start the assessments again |
| My Orientation | View your career orientation report |
| Language Tests | Optional EN / FR language exercises |

---

## Language Support

All pages are fully available in three languages, switchable at any time from the top-right corner:

| Button | Language |
|---|---|
| **FR** | Français |
| **EN** | English |
| **ع** | العربية (RTL) |
