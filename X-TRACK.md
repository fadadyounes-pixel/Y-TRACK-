# X-TRACK — Youth Tracking, Reporting & Knowledge System

> **Multi-tenant cloud-based Monitoring & Evaluation (M&E) dashboard**  
> Built for INDH Youth Platforms across Morocco  
> Version 1.0 | May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Modules](#3-core-modules)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Brand Identity & Logo](#5-brand-identity--logo)
6. [Color Palette](#6-color-palette)
7. [Typography](#7-typography)
8. [Logo Animation Guide](#8-logo-animation-guide)
9. [How to Use the App](#9-how-to-use-the-app)
10. [GitHub Integration](#10-github-integration)
11. [Vercel Deployment](#11-vercel-deployment)
12. [Technical Stack](#12-technical-stack)
13. [File Structure](#13-file-structure)
14. [API Reference](#14-api-reference)
15. [Database Schema](#15-database-schema)

---

## 1. Project Overview

### What is X-TRACK?

X-TRACK is a centralized admin dashboard that enables:

- **Multi-platform management** — Oversee all INDH Youth Platforms from one interface
- **Beneficiary journey tracking** — Monitor youth from registration through program completion
- **Real-time analytics** — Visualize KPIs, trends, and outcomes
- **Integrated messaging** — Communicate with participants via in-app messages
- **Cloud sync** — Automatic data synchronization from OneDrive/Google Drive per platform
- **Report generation** — Export donor-ready reports in PDF, Excel, CSV, PowerPoint

### Key Metrics Tracked

| Metric | Description |
|--------|-------------|
| Total Beneficiaries | Aggregated count across all platforms |
| Female Participation % | Gender disaggregation |
| Program Completion Rate | % of beneficiaries who completed programs |
| Active Youth Platforms | Number of operational platforms |
| Outcomes Achieved | Employment, certification, education advancement |
| Dropout Rate | % who left before completion |

### Core Programs

1. **Leadership & Civic Engagement**
2. **Skills Training & Vocational Education**
3. **Entrepreneurship & Business Development**

---

## 2. System Architecture

### Multi-Tenant Structure

```
┌─────────────────────────────────────────┐
│           SUPER ADMIN                   │
│    (Global dashboard, all platforms)      │
├─────────────────────────────────────────┤
│         PLATFORM COORDINATOR            │
│      (Per-platform access only)         │
├─────────────────────────────────────────┤
│           DATA ENTRY                    │
│   (Read/write assigned platform)        │
├─────────────────────────────────────────┤
│          READ-ONLY                      │
│    (Management and donor view)            │
└─────────────────────────────────────────┘
```

### Data Flow

```
Beneficiary Registration (Platform Level)
        ↓
Cloud Storage Sync (OneDrive / Google Drive)
        ↓
Central X-TRACK Database (Master aggregation)
        ↓
Admin Dashboard (Global view + drill-down)
        ↓
Reports, Analytics & Messaging
```

### Cloud Integration

| Service | Purpose | Status Indicator |
|---------|---------|-----------------|
| **OneDrive** | Primary sync for Windows platforms | Green = Online |
| **Google Drive** | Alternative/backup for Google Workspace | Yellow = Syncing |
| **Real-time sync** | Auto-sync with conflict resolution | Red = Offline |

---

## 3. Core Modules

### 3.1 Global Dashboard

**Purpose**: High-level overview across all platforms

**Visualizations**:
- Registration trend line chart (monthly/quarterly/yearly)
- Gender distribution pie/donut chart
- Program distribution bar chart
- Age group distribution chart
- Geographic coverage map

### 3.2 Youth Platforms Management

**Per-Platform Card Display**:
- Platform name & location (City, Region)
- Sync status indicator (green/yellow/red)
- Key stats: Total / Active / Completed beneficiaries
- Assigned coordinator with avatar
- Quick actions: View, Sync, Edit, Message

**Platform Data Model**:
```json
{
  "Platform_ID": "PLT-001",
  "Platform_Name": "Casablanca Youth Center",
  "Region": "Casablanca-Settat",
  "City": "Casablanca",
  "Address": "123 Avenue Hassan II",
  "Coordinator_ID": "USR-001",
  "OneDrive_URL": "https://...",
  "GoogleDrive_URL": "https://...",
  "Sync_Status": "online",
  "Last_Sync_Date": "2026-05-11T10:30:00Z",
  "Created_Date": "2026-01-15",
  "Status": "Active"
}
```

### 3.3 Beneficiary Tracking & Journey

**Lifecycle States**:

| # | State | Description | Color Code |
|---|-------|-------------|------------|
| 1 | **Registered** | Initial enrollment, data collected | Gray |
| 2 | **Orientation** | Attended orientation session | Blue |
| 3 | **Active in Program** | Participating in assigned program | Blue |
| 4 | **Completed** | Finished program requirements | Green |
| 5 | **Referred Out** | Directed to external center | Gold |
| 6 | **Dropped** | Left without completing | Red |

**Journey Tracker UI**:
```
[1] Registered → [2] Orientation → [3] Active → [4] Completed
   ✅              ✅              🔵           ⬜
```

- ✅ Completed (green)
- 🔵 Active (blue)
- ⬜ Pending (gray)

**Beneficiary Data Model**:
```json
{
  "Participant_ID": "YTR-2847",
  "First_Name": "Amina",
  "Last_Name": "El Fassi",
  "Gender": "Female",
  "Date_of_Birth": "2004-03-15",
  "Age": 22,
  "Age_Group": "18-24",
  "Region": "Casablanca-Settat",
  "City": "Casablanca",
  "Education_Level": "Bachelor",
  "Registration_Date": "2026-02-10",
  "Platform_ID": "PLT-001",
  "Current_Program": "Skills Training",
  "Status": "Active",
  "Email": "amina@example.com",
  "Phone": "+212612345678",
  "Current_Journey_Step": 3,
  "Referred_To": null,
  "Referred_Date": null,
  "Dropout_Reason": null
}
```

### 3.4 Programs Management

**Per-Program Tracking**:
- Enrollment numbers per platform
- Attendance rates
- Completion rates
- Outcome achievements

### 3.5 Messaging & Communication

**Features**:
- Compose messages to individuals, groups, or all platforms
- Recipient targeting by: Platform, Program, Status, Gender, Age Group
- Message templates for common scenarios
- Delivery tracking: Sent → Delivered → Read
- SMS/WhatsApp integration capability
- Scheduled sending

**Message Types**:
- Event invitations & reminders
- Program announcements
- Data collection requests
- Follow-up communications
- Completion congratulations
- Referral notifications

### 3.6 Reports & Analytics

| Report Type | Frequency | Content | Export |
|-------------|-----------|---------|--------|
| Monthly Monitoring | Monthly | KPIs, data quality, risks | PDF, Excel |
| Quarterly Performance | Quarterly | Target vs actual, analysis | PDF, Excel, PPT |
| Annual Impact | Annual | Outcome analysis, stories | PDF, PPT |
| Ad-hoc | On-demand | Custom filters and dates | All formats |

### 3.7 Cloud Drives Management

- OneDrive connector per platform
- Google Drive connector per platform
- Sync status dashboard
- Manual sync trigger
- File conflict resolution log
- Storage usage monitoring

---

## 4. User Roles & Permissions

| Role | Platforms | Beneficiaries | Messages | Reports | Settings |
|------|:---------:|:-------------:|:--------:|:-------:|:--------:|
| **Super Admin** | Full CRUD | Full CRUD | Full | Full | Full |
| **Platform Coordinator** | View own | Full on own | Own platform | Own platform | Limited |
| **Data Entry** | View own | Create/Edit own | None | None | None |
| **Management** | View all | View all | Read | View all | None |
| **Donor** | None | None | None | Reports only | None |

---

## 5. Brand Identity & Logo

### Brand Name
- **Primary**: X-TRACK
- **Full Name**: Youth Tracking, Reporting & Knowledge System
- **Tagline**: *Empowering Youth, Tracking Progress*

### Logo Concept

The X-TRACK logo combines three symbolic elements:

| Element | Symbolism | Visual |
|---------|-----------|--------|
| **Circular Ring** | Continuous tracking & monitoring cycle | Blue outer ring |
| **"Y" Letterform** | Youth — the core focus | White center shape |
| **Golden Tracking Dot** | Real-time monitoring point | Gold dot at top |
| **Data Points** | Multiple connected platforms | Green dots around ring |

### Logo Variants

#### A. Full Logo (Splash Screen)
- Icon + "X-TRACK" wordmark + tagline
- Used on: Login page, splash screen, presentations
- Size: 200×200px icon + text below

#### B. Compact Logo (Navbar)
- Icon + "X-TRACK" wordmark only
- Used on: Dashboard header, navigation bar
- Size: 36×36px icon + text

#### C. Icon Only (Favicon)
- Icon alone
- Used on: Browser favicon, app icon, loading spinner
- Sizes: 16×16, 32×32, 180×180, 192×192px

### SVG Logo Code

```svg
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer tracking ring -->
  <circle cx="100" cy="100" r="70" 
          fill="none" 
          stroke="#3b82f6" 
          stroke-width="3"/>

  <!-- Inner ring -->
  <circle cx="100" cy="100" r="50" 
          fill="none" 
          stroke="#06b6d4" 
          stroke-width="2"/>

  <!-- Y letter shape -->
  <path d="M 85 70 L 100 95 L 115 70 M 100 95 L 100 130" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"/>

  <!-- Tracking dot -->
  <circle cx="100" cy="55" r="5" fill="#f59e0b"/>

  <!-- Data points -->
  <circle cx="100" cy="30" r="3" fill="#10b981"/>
  <circle cx="130" cy="45" r="3" fill="#10b981"/>
  <circle cx="145" cy="75" r="3" fill="#10b981"/>
  <circle cx="140" cy="105" r="3" fill="#10b981"/>
</svg>
```

### Navbar Logo (Compact)

```svg
<svg width="36" height="36" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80" fill="none" stroke="#2563eb" stroke-width="10"/>
  <path d="M 75 60 L 100 100 L 125 60 M 100 100 L 100 150" 
        fill="none" stroke="#1e293b" stroke-width="14" 
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="100" cy="40" r="8" fill="#f59e0b"/>
</svg>
```

---

## 6. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary Blue** | `#2563EB` | rgb(37, 99, 235) | Main brand, buttons, links |
| **Cyan** | `#06B6D4` | rgb(6, 182, 212) | Secondary, accents, charts |
| **Dark Navy** | `#0F172A` | rgb(15, 23, 42) | Dark backgrounds, headers |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Gold** | `#F59E0B` | rgb(245, 158, 11) | Tracking indicators, highlights |
| **Green** | `#10B981` | rgb(16, 185, 129) | Success, completion, data points |
| **Red** | `#EF4444` | rgb(239, 68, 68) | Errors, dropouts, alerts |
| **Orange** | `#F97316` | rgb(249, 115, 22) | Warnings, pending status |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark |
| **Light Gray** | `#F8FAFC` | rgb(248, 250, 252) | Page backgrounds |
| **Gray** | `#94A3B8` | rgb(148, 163, 184) | Secondary text, borders |
| **Dark Gray** | `#1E293B` | rgb(30, 41, 59) | Body text, headings |

### Semantic Colors (Status)

| Status | Color | Hex |
|--------|-------|-----|
| Online/Synced | Green | `#10B981` |
| Syncing | Yellow | `#F59E0B` |
| Offline | Red | `#EF4444` |
| Completed | Green | `#10B981` |
| Active | Blue | `#3B82F6` |
| Pending | Gray | `#94A3B8` |
| Dropped | Red | `#EF4444` |

---

## 7. Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, navigation |
| SemiBold | 600 | Subheadings, buttons |
| Bold | 700 | Headings, metrics |
| ExtraBold | 800 | Logo text, hero numbers |

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Logo | 42px | 800 | 1.0 | 4px |
| H1 | 32px | 700 | 1.2 | -0.5px |
| H2 | 24px | 700 | 1.3 | -0.3px |
| H3 | 20px | 600 | 1.4 | 0px |
| Body | 16px | 400 | 1.5 | 0px |
| Small | 14px | 400 | 1.5 | 0px |
| Caption | 12px | 500 | 1.4 | 0.5px |
| Tagline | 14px | 400 | 1.0 | 6px (uppercase) |

---

## 8. Logo Animation Guide

### Animation Sequence

```
Step 1 (0.0s):    Outer ring begins drawing (blue stroke)
Step 2 (0.5s):    Inner ring begins drawing (cyan stroke)
Step 3 (1.0s):    "Y" shape draws itself (white stroke)
Step 4 (1.8s):    Tracking dot appears and pulses (gold)
Step 5 (2.0s):    Data points fade in around ring (green)
Step 6 (2.0s):    "X-TRACK" text slides up and fades in
Step 7 (2.5s):    Tagline fades in
Step 8 (ongoing): Tracking dot pulses infinitely
```

### CSS Animation Code

```css
/* Outer ring draw */
.logo-ring-outer {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-dasharray: 440;
  stroke-dashoffset: 440;
  animation: drawRing 1.5s ease-out forwards;
}

/* Inner ring draw */
.logo-ring-inner {
  fill: none;
  stroke: #06b6d4;
  stroke-width: 2;
  stroke-dasharray: 314;
  stroke-dashoffset: 314;
  animation: drawRingInner 1.2s ease-out 0.5s forwards;
}

/* Y shape draw */
.logo-y {
  fill: none;
  stroke: #ffffff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawY 1s ease-out 1s forwards;
}

/* Tracking dot */
.logo-dot {
  fill: #f59e0b;
  opacity: 0;
  animation: pulseDot 0.6s ease-out 1.8s forwards,
             pulse 2s ease-in-out 2.4s infinite;
}

/* Keyframes */
@keyframes drawRing { to { stroke-dashoffset: 0; } }
@keyframes drawRingInner { to { stroke-dashoffset: 0; } }
@keyframes drawY { to { stroke-dashoffset: 0; } }
@keyframes pulseDot { to { opacity: 1; } }
@keyframes pulse {
  0%, 100% { r: 5; opacity: 1; }
  50% { r: 8; opacity: 0.6; }
}
```

### Loading Spinner

```html
<div class="spinner">
  <svg width="60" height="60" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="80" 
            fill="none" 
            stroke="#e2e8f0" 
            stroke-width="8"/>
    <circle cx="100" cy="100" r="80" 
            fill="none" 
            stroke="#3b82f6" 
            stroke-width="8"
            stroke-dasharray="125 377"
            stroke-linecap="round">
      <animateTransform attributeName="transform"
                        type="rotate"
                        from="0 100 100"
                        to="360 100 100"
                        dur="1s"
                        repeatCount="indefinite"/>
    </circle>
    <text x="100" y="115" 
          text-anchor="middle" 
          font-size="60" 
          font-weight="800" 
          fill="#1e293b">Y</text>
  </svg>
</div>
```

---

## 9. How to Use the App

### 9.1 Getting Started

#### Login
1. Open X-TRACK in your browser
2. Enter your email and password
3. Select your role (if multi-role user)
4. Click **Sign In**

#### Dashboard Overview
After login, you will see:
- **Sidebar Navigation**: Platforms, Beneficiaries, Programs, Messages, Reports, Settings
- **Top Bar**: Search, notifications, profile, sync status
- **Main Content**: KPI cards, charts, recent activity

### 9.2 Managing Platforms

#### View All Platforms
1. Click **Youth Platforms** in the sidebar
2. View platform cards with:
   - Platform name & location
   - Sync status indicator (green/yellow/red)
   - Key stats: Total / Active / Completed beneficiaries
   - Assigned coordinator

#### Add a New Platform
1. Click **+ Add Platform** button
2. Fill in the form:
   - Platform Name (e.g., "Casablanca Youth Center")
   - Region & City
   - Address
   - Coordinator (select from users)
   - OneDrive URL (for cloud sync)
   - Google Drive URL (backup)
3. Click **Save**

#### Sync a Platform
1. Click the **Sync** button on a platform card
2. Wait for sync status to turn green
3. Check **Last Sync Date** to confirm

### 9.3 Managing Beneficiaries

#### Register a New Beneficiary
1. Navigate to **Beneficiaries** → **Add New**
2. Enter personal information:
   - First Name, Last Name
   - Gender, Date of Birth (age auto-calculated)
   - Region, City, Education Level
   - Contact: Email, Phone
3. Select **Platform** and **Program**
4. Click **Register**
5. System generates unique ID: `YTR-XXXX`

#### Track Beneficiary Journey
1. Go to **Beneficiaries** → Select a beneficiary
2. View the **Journey Tracker**:
   ```
   [Registered] → [Orientation] → [Active] → [Completed]
      ✅            ✅            🔵           ⬜
   ```
   - ✅ Completed (green)
   - 🔵 Active (blue)
   - ⬜ Pending (gray)

3. Click **Update Status** to move to next step
4. Add notes and date for each transition

#### Refer a Beneficiary
1. Open beneficiary profile
2. Click **Refer Out**
3. Select target platform
4. Add referral reason and notes
5. Click **Confirm Referral**

### 9.4 Programs Management

#### View Program Enrollment
1. Go to **Programs** in sidebar
2. See three core programs:
   - Leadership & Civic Engagement
   - Skills Training & Vocational Education
   - Entrepreneurship & Business Development
3. Click a program to see enrollment by platform

#### Track Attendance
1. Open a program → Select session/date
2. Mark beneficiaries as:
   - ✅ Present
   - ❌ Absent
   - ⏰ Late
3. Save attendance record

### 9.5 Messaging

#### Send a Message
1. Click **Messages** → **Compose**
2. Select recipients:
   - **All Platforms** (broadcast)
   - **Specific Platform**
   - **By Program**
   - **By Status** (e.g., all Active beneficiaries)
   - **By Gender / Age Group**
   - **Individual**
3. Choose message type:
   - Event invitation
   - Program announcement
   - Reminder
   - Follow-up
4. Write message or select a **Template**
5. Schedule send (optional) or click **Send Now**

#### Track Delivery
1. Go to **Messages** → **Sent**
2. View delivery status:
   - 📤 Sent
   - ✅ Delivered
   - 👁️ Read
3. Click a message for detailed read receipts

### 9.6 Reports & Analytics

#### Generate a Report
1. Navigate to **Reports**
2. Select report type:
   - Monthly Monitoring
   - Quarterly Performance
   - Annual Impact
   - Ad-hoc (custom)
3. Set filters:
   - Date range
   - Platform(s)
   - Program
   - Gender
   - Age group
4. Click **Generate**
5. Preview report with charts and data
6. Export in format: **PDF**, **Excel**, **CSV**, or **PowerPoint**

#### View Dashboard Analytics
- **Registration Trends**: Line chart (monthly/quarterly/yearly)
- **Gender Distribution**: Pie/donut chart
- **Program Distribution**: Bar chart
- **Age Groups**: Horizontal bar chart
- **Geographic Coverage**: Interactive map

### 9.7 Cloud Drive Management

#### Check Sync Status
1. Go to **Settings** → **Cloud Drives**
2. View per-platform sync status:
   - 🟢 Online (synced)
   - 🟡 Syncing (in progress)
   - 🔴 Offline (connection issue)

#### Manual Sync Trigger
1. Find platform in Cloud Drives list
2. Click **Force Sync** button
3. Monitor progress in sync log

### 9.8 User Settings

#### Update Profile
1. Click profile avatar → **Settings**
2. Update:
   - Name and email
   - Password
   - Notification preferences
   - Language (English / French / Arabic)

#### Manage Users (Super Admin)
1. Go to **Settings** → **User Management**
2. Add new users:
   - Enter name, email, role
   - Assign platform(s)
   - Set permissions
3. Edit or deactivate existing users

---

## 10. GitHub Integration

### 10.1 Setting Up GitHub Repository

#### Step 1: Install Git
```bash
# Windows: Download from https://git-scm.com/downloads
# macOS:
brew install git
# Linux (Ubuntu/Debian):
sudo apt-get install git
```

#### Step 2: Initialize Your Project
```bash
# Navigate to your X-TRACK project folder
cd /path/to/x-track

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial X-TRACK commit - Dashboard v1.0"
```

#### Step 3: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click **+** → **New repository**
3. Name: `x-track`
4. Description: `Youth Tracking, Reporting & Knowledge System for INDH`
5. Select **Public** or **Private**
6. Do NOT initialize with README (we already have one)
7. Click **Create repository**

#### Step 4: Link Local to GitHub
```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/x-track.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 10.2 Daily Workflow

```bash
# Pull latest changes before working
git pull origin main

# Make your changes to files...

# Check what changed
git status

# Stage changes
git add filename.html
git add assets/
# Or stage all:
git add .

# Commit with descriptive message
git commit -m "Add beneficiary journey tracker UI"

# Push to GitHub
git push origin main
```

### 10.3 Branching Strategy (Team Development)

```bash
# Create a feature branch
git checkout -b feature/beneficiary-search

# Work on your feature...
git add .
git commit -m "Add search filter to beneficiary table"

# Push branch to GitHub
git push origin feature/beneficiary-search

# Create Pull Request on GitHub
# After review, merge to main

# Switch back to main and pull updates
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/beneficiary-search
```

---

## 11. Vercel Deployment

### Method 1: GitHub + Vercel (Recommended)

1. **Push code to GitHub** (see Section 10)
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. Click **"Add New Project"**
4. Select your **x-track** repository
5. Click **"Deploy"**
6. Your dashboard will be live at:
   ```
   https://x-track-yourname.vercel.app
   ```

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd /path/to/x-track

# Deploy
vercel

# Follow prompts:
# - Link to existing project? [N]
# - Project name: x-track
# - Directory: ./
# - Deploy? [Y]
```

### Method 3: Drag & Drop (No GitHub)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Deploy"** on the homepage
3. Drag your `index.html` file (or zip of your project) into the upload area
4. Vercel will deploy instantly

### Vercel Configuration (Optional)

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "name": "x-track",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 12. Technical Stack

### Frontend
- **HTML5/CSS3/JS** — Vanilla JavaScript for maximum portability
- **Chart.js** — Data visualization (line, bar, pie, doughnut charts)
- **Font Awesome 6** — Icon system
- **Inter font** — Typography (Google Fonts)
- **Responsive design** — Mobile-first, collapsible sidebar

### Backend (Recommended)
- **Python (Flask/FastAPI)** or **Node.js (Express)**
- **PostgreSQL** or **MySQL** — Primary database
- **Redis** — Session management and caching
- **Celery** — Background task processing (sync jobs)

### Cloud Integration
- **Microsoft Graph API** — OneDrive sync
- **Google Drive API** — Google Drive sync
- **OAuth 2.0** — Authentication for cloud services

### Messaging
- **Twilio API** — SMS integration
- **WhatsApp Business API** — WhatsApp messaging
- **Email (SMTP/SendGrid)** — Email notifications

---

## 13. File Structure

### Recommended Repository Structure

```
x-track/
├── README.md                          # This file
├── LICENSE                            # MIT or Apache 2.0
├── .gitignore                         # Git ignore rules
├── vercel.json                        # Vercel config (optional)
│
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions deploy
│
├── docs/
│   ├── api-documentation.md           # Backend API docs
│   ├── deployment-guide.md            # Server setup
│   └── user-manual.md                 # End user guide
│
├── src/
│   ├── index.html                     # Entry point / Login
│   ├── dashboard.html                 # Main dashboard
│   ├── platforms.html                 # Platform management
│   ├── beneficiaries.html             # Beneficiary tracking
│   ├── programs.html                  # Programs overview
│   ├── messages.html                  # Messaging center
│   ├── reports.html                   # Reports & exports
│   ├── settings.html                  # User settings
│   │
│   ├── css/
│   │   ├── variables.css              # CSS custom properties
│   │   ├── reset.css                  # CSS reset
│   │   ├── layout.css                 # Grid, flex utilities
│   │   ├── components.css             # Buttons, cards, modals
│   │   ├── navigation.css             # Sidebar, header
│   │   ├── dashboard.css              # Dashboard-specific
│   │   ├── forms.css                  # Inputs, selects
│   │   ├── tables.css                 # Data tables
│   │   ├── charts.css                 # Chart containers
│   │   ├── animations.css             # Logo & transitions
│   │   ├── responsive.css             # Mobile breakpoints
│   │   └── dark-mode.css              # Dark theme variables
│   │
│   ├── js/
│   │   ├── config.js                  # App configuration
│   │   ├── utils.js                   # Helper functions
│   │   ├── api.js                     # API client
│   │   ├── auth.js                    # Authentication
│   │   ├── router.js                  # Simple page routing
│   │   ├── state.js                   # App state management
│   │   ├── dashboard.js               # Dashboard logic
│   │   ├── platforms.js               # Platform CRUD
│   │   ├── beneficiaries.js           # Beneficiary management
│   │   ├── programs.js                # Program logic
│   │   ├── messages.js                # Messaging system
│   │   ├── reports.js                 # Report generation
│   │   ├── charts.js                  # Chart configurations
│   │   ├── sync.js                    # Cloud sync logic
│   │   └── app.js                     # Main entry point
│   │
│   └── assets/
│       ├── logo/
│       │   ├── xtrack-logo.svg
│       │   ├── xtrack-logo-dark.svg
│       │   ├── xtrack-icon.svg
│       │   └── favicon.ico
│       │
│       ├── images/
│       │   ├── avatars/
│       │   ├── icons/
│       │   └── illustrations/
│       │
│       └── fonts/
│           └── Inter/
│
├── backend/                           # If using Node/Python backend
│   ├── server.js                      # Express/FastAPI entry
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── config/
│
└── database/
    ├── schema.sql                     # Database schema
    └── seed-data.sql                  # Demo data
```

### .gitignore Template

```gitignore
# Dependencies
node_modules/
venv/
__pycache__/

# Build outputs
dist/
build/
*.zip

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database (if local SQLite)
*.db
*.sqlite

# Temporary files
tmp/
temp/
```

---

## 14. API Reference

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@xtrack.ma",
  "password": "...",
  "role": "super_admin"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "USR-001",
    "name": "Super Admin",
    "role": "super_admin",
    "platforms": ["all"]
  }
}
```

### Platforms

```http
GET /api/platforms
Authorization: Bearer {token}

Response:
{
  "platforms": [
    {
      "id": "PLT-001",
      "name": "Casablanca Youth Center",
      "region": "Casablanca-Settat",
      "beneficiaries_count": 342,
      "sync_status": "online",
      "last_sync": "2026-05-11T10:30:00Z"
    }
  ]
}
```

```http
POST /api/platforms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Platform",
  "region": "...",
  "city": "...",
  "coordinator_id": "USR-002",
  "onedrive_url": "https://...",
  "googledrive_url": "https://..."
}
```

### Beneficiaries

```http
GET /api/beneficiaries?platform=PLT-001&status=active
Authorization: Bearer {token}

POST /api/beneficiaries
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Amina",
  "last_name": "El Fassi",
  "gender": "Female",
  "date_of_birth": "2004-03-15",
  "platform_id": "PLT-001",
  "program": "Skills Training"
}
```

### Messages

```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipients": {
    "type": "platform",
    "platform_id": "PLT-001"
  },
  "subject": "Event Invitation",
  "body": "You are invited to...",
  "send_now": true
}
```

### Reports

```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "quarterly",
  "period": "Q2-2026",
  "filters": {
    "platforms": ["PLT-001", "PLT-002"],
    "programs": ["skills_training"],
    "gender": "all"
  },
  "format": "pdf"
}
```

---

## 15. Database Schema

### Core Tables

```sql
-- Platforms
CREATE TABLE platforms (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    coordinator_id VARCHAR(20),
    onedrive_url VARCHAR(500),
    googledrive_url VARCHAR(500),
    sync_status VARCHAR(20) DEFAULT 'online',
    last_sync TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Users
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'data_entry',
    platform_id VARCHAR(20),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Beneficiaries
CREATE TABLE beneficiaries (
    id VARCHAR(20) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    age INTEGER GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM AGE(date_of_birth))
    ) STORED,
    region VARCHAR(100),
    city VARCHAR(100),
    education_level VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    platform_id VARCHAR(20),
    current_program VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Registered',
    email VARCHAR(255),
    phone VARCHAR(20),
    current_journey_step INTEGER DEFAULT 1,
    referred_to VARCHAR(20),
    referred_date TIMESTAMP,
    dropout_reason TEXT
);

-- Programs
CREATE TABLE programs (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration_weeks INTEGER,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Enrollments
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    beneficiary_id VARCHAR(20),
    program_id VARCHAR(20),
    platform_id VARCHAR(20),
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Active'
);

-- Journey Logs
CREATE TABLE journey_logs (
    id SERIAL PRIMARY KEY,
    beneficiary_id VARCHAR(20),
    from_step INTEGER,
    to_step INTEGER,
    transition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    changed_by VARCHAR(20)
);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(20),
    subject VARCHAR(255),
    body TEXT,
    recipient_type VARCHAR(50),
    recipient_filter JSONB,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft'
);

-- Message Deliveries
CREATE TABLE message_deliveries (
    id SERIAL PRIMARY KEY,
    message_id INTEGER,
    beneficiary_id VARCHAR(20),
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP
);

-- Cloud Sync Logs
CREATE TABLE cloud_logs (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR(20),
    drive_type VARCHAR(20),
    operation VARCHAR(50),
    status VARCHAR(20),
    file_name VARCHAR(255),
    sync_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);
```

### Key Relationships

```
Platform 1→N Beneficiaries
Platform 1→1 Coordinator (User)
Beneficiary 1→N Enrollments
Program 1→N Enrollments
Beneficiary 1→N Journey_Logs
Beneficiary 1→N Message_Deliveries
Platform 1→N Cloud_Logs
```

---

## Quick Reference

### Logo CSS Classes

| Class | Purpose |
|-------|---------|
| `.logo-ring-outer` | Main tracking ring (blue) |
| `.logo-ring-inner` | Secondary ring (cyan) |
| `.logo-y` | Y letter shape (white) |
| `.logo-dot` | Tracking dot (gold, pulsing) |

### Color CSS Variables

```css
:root {
  --color-primary: #2563EB;
  --color-cyan: #06B6D4;
  --color-gold: #F59E0B;
  --color-green: #10B981;
  --color-red: #EF4444;
  --color-dark: #0F172A;
  --color-gray: #94A3B8;
  --color-light: #F8FAFC;
  --font-primary: 'Inter', sans-serif;
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `online` | Fully synced |
| `syncing` | Sync in progress |
| `offline` | Connection lost |
| `registered` | Initial enrollment |
| `active` | Currently participating |
| `completed` | Program finished |
| `referred` | Moved to another platform |
| `dropped` | Left without completing |

---

*X-TRACK — Empowering Youth, Tracking Progress*  
*Built for INDH Youth Platforms, Morocco*  
*Version 1.0 | May 2026*
