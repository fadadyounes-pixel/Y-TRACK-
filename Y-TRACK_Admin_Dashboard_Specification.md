# Y-TRACK Admin Dashboard — System Specification

## Executive Summary

**Y-TRACK** is a multi-tenant cloud-based Monitoring & Evaluation (M&E) dashboard designed for the **INDH Youth Platforms** across Morocco. It provides a centralized admin interface to manage multiple youth platforms, track beneficiary journeys from registration through program completion or referral, and communicate with participants via integrated messaging.

---

## 1. System Architecture

### 1.1 Multi-Tenant Structure
- **Super Admin**: Global dashboard, platform management, coordinator creation
- **Platform Coordinator**: Per-platform access, beneficiary management, local reporting
- **Data Entry**: Read/write access to assigned platform data only
- **Read-Only**: Management and donor view access

### 1.2 Data Flow
```
Beneficiary Registration (Platform Level)
        ↓
Cloud Storage Sync (OneDrive / Google Drive per platform)
        ↓
Central Y-TRACK Database (Master aggregation)
        ↓
Admin Dashboard (Global view + per-platform drill-down)
        ↓
Reports, Analytics & Messaging
```

### 1.3 Cloud Integration
Each Youth Platform maintains its own folder structure synchronized with:
- **OneDrive** — Primary sync for Windows-based platforms
- **Google Drive** — Alternative/backup for Google Workspace platforms
- **Real-time sync status** — Online / Syncing / Offline indicators
- **Automatic conflict resolution** — Timestamp-based versioning

---

## 2. Core Modules

### 2.1 Global Dashboard (Admin View)
**Purpose**: High-level overview across all platforms

**Key Metrics**:
| Metric | Description |
|--------|-------------|
| Total Beneficiaries | Aggregated count across all platforms |
| Female Participation % | Gender disaggregation |
| Program Completion Rate | % of beneficiaries who completed programs |
| Active Youth Platforms | Number of operational platforms |
| Outcomes Achieved | Employment, certification, education advancement |
| Dropout Rate | % who left before completion |

**Visualizations**:
- Registration trend line chart (monthly/quarterly/yearly)
- Gender distribution pie/donut chart
- Program distribution bar chart
- Age group distribution chart
- Geographic coverage map

### 2.2 Youth Platforms Management
**Purpose**: CRUD operations for all INDH Youth Platforms

**Per-Platform Card Display**:
- Platform name & location (City, Region)
- Sync status indicator (green/yellow/red)
- Key stats: Total / Active / Completed beneficiaries
- Assigned coordinator with avatar
- Quick actions: View, Sync, Edit, Message

**Platform Data Model**:
```
Platform_ID (Unique)
Platform_Name
Region
City
Address
Coordinator_ID (FK to Users)
OneDrive_URL
GoogleDrive_URL
Sync_Status
Last_Sync_Date
Created_Date
Status (Active/Inactive)
```

### 2.3 Beneficiary Tracking & Journey
**Purpose**: End-to-end tracking of each youth from registration to outcome

**Beneficiary Lifecycle States**:
1. **Registered** — Initial enrollment, data collected
2. **Orientation** — Attended orientation session
3. **Active in Program** — Participating in assigned program
4. **Completed** — Finished program requirements
5. **Referred Out** — Directed to external center/platform
6. **Dropped** — Left without completing

**Journey Tracker UI**:
- Visual step indicator showing current stage
- Color-coded: Completed (green), Active (blue), Pending (gray)
- Timeline view with dates for each transition

**Beneficiary Data Model**:
```
Participant_ID (Unique, format: YTR-XXXX)
First_Name, Last_Name
Gender, Date_of_Birth, Age (auto), Age_Group
Region, City, Education_Level
Registration_Date, Platform_ID (FK)
Current_Program, Status
Email, Phone
Current_Journey_Step
Referred_To (Platform_ID if applicable)
Referred_Date
Dropout_Reason (if applicable)
```

### 2.4 Programs Management
**Purpose**: Track 3 core INDH programs per platform

**Programs**:
1. **Leadership & Civic Engagement**
2. **Skills Training & Vocational Education**
3. **Entrepreneurship & Business Development**

**Per-Program Tracking**:
- Enrollment numbers per platform
- Attendance rates
- Completion rates
- Outcome achievements

### 2.5 Messaging & Communication
**Purpose**: In-app messaging system for event notifications and updates

**Features**:
- Compose messages to individuals, groups, or all platforms
- Recipient targeting by: Platform, Program, Status, Gender, Age Group
- Message templates for common scenarios (event invites, reminders, follow-ups)
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

### 2.6 Reports & Analytics
**Purpose**: Generate donor-ready and management reports

**Report Types**:
| Frequency | Content |
|-----------|---------|
| Monthly Monitoring | KPIs, data quality notes, risks |
| Quarterly Performance | Target vs actual, regional/gender analysis |
| Annual Impact | Outcome analysis, success stories |
| Ad-hoc | Custom filters and date ranges |

**Export Formats**: PDF, Excel, CSV, PowerPoint

### 2.7 Cloud Drives Management
**Purpose**: Monitor and manage per-platform cloud connections

**Features**:
- OneDrive connector per platform
- Google Drive connector per platform
- Sync status dashboard
- Manual sync trigger
- File conflict resolution log
- Storage usage monitoring

---

## 3. User Roles & Permissions

| Role | Platforms | Beneficiaries | Messages | Reports | Settings |
|------|:---------:|:-------------:|:--------:|:-------:|:--------:|
| **Super Admin** | Full CRUD | Full CRUD | Full | Full | Full |
| **Platform Coordinator** | View own | Full on own | Own platform | Own platform | Limited |
| **Data Entry** | View own | Create/Edit own | None | None | None |
| **Management** | View all | View all | Read | View all | None |
| **Donor** | None | None | None | Reports only | None |

---

## 4. Data Model (Relational)

### 4.1 Core Tables
- **Platforms** — Youth platform locations and metadata
- **Users** — System users (admin, coordinators, data entry)
- **Beneficiaries** — Youth participant master records
- **Programs** — Available programs catalog
- **Enrollments** — Beneficiary-program associations
- **Activities** — Attendance and participation tracking
- **Outcomes** — Impact measurement records
- **Journey_Logs** — Status transition history
- **Messages** — Communication records
- **Events** — Scheduled activities and workshops
- **Cloud_Logs** — Sync and file operation logs

### 4.2 Key Relationships
```
Platform 1→N Beneficiaries
Platform 1→1 Coordinator (User)
Beneficiary 1→N Enrollments
Program 1→N Enrollments
Beneficiary 1→N Activities
Beneficiary 1→N Outcomes
Beneficiary 1→N Journey_Logs
Platform 1→N Events
Platform 1→N Messages
```

---

## 5. Technical Stack

### 5.1 Frontend
- **HTML5/CSS3/JS** — Vanilla JavaScript for maximum portability
- **Chart.js** — Data visualization (line, bar, pie, doughnut charts)
- **Font Awesome 6** — Icon system
- **Inter font** — Typography
- **Responsive design** — Mobile-first, collapsible sidebar

### 5.2 Backend (Recommended)
- **Python (Flask/FastAPI)** or **Node.js (Express)**
- **PostgreSQL** or **MySQL** — Primary database
- **Redis** — Session management and caching
- **Celery** — Background task processing (sync jobs)

### 5.3 Cloud Integration
- **Microsoft Graph API** — OneDrive sync
- **Google Drive API** — Google Drive sync
- **OAuth 2.0** — Authentication for cloud services

### 5.4 Messaging
- **Twilio API** — SMS integration
- **WhatsApp Business API** — WhatsApp messaging
- **Email (SMTP/SendGrid)** — Email notifications

---

## 6. Folder Structure (Per Platform)

```
Y-TRACK/
├── Platforms/
│   ├── Platform_001_Casablanca/
│   │   ├── 1_Data_Raw/
│   │   │   ├── Registrations/
│   │   │   ├── Activities/
│   │   │   └── Outcomes/
│   │   ├── 2_Data_Clean/
│   │   │   └── Master_Database.xlsx
│   │   ├── 3_Dashboards/
│   │   ├── 4_Reports/
│   │   │   ├── Monthly/
│   │   │   ├── Quarterly/
│   │   │   └── Annual/
│   │   ├── 5_Documentation/
│   │   └── sync_status.json
│   ├── Platform_002_Rabat/
│   └── ...
├── Global/
│   ├── Admin_Dashboard/
│   ├── Global_Reports/
│   └── Master_Analytics/
└── Archive/
```

---

## 7. Key Features Summary

| Feature | Description | Priority |
|---------|-------------|:--------:|
| Multi-platform dashboard | Single admin view for all platforms | High |
| Cloud drive sync | OneDrive/Google Drive per platform | High |
| Beneficiary journey tracking | Visual lifecycle from registration to outcome | High |
| In-app messaging | Event notifications and communication | High |
| Role-based access | Admin, coordinator, data entry, read-only | High |
| Real-time analytics | Charts and KPIs with auto-refresh | Medium |
| Report generation | Monthly, quarterly, annual exports | Medium |
| Mobile responsive | Works on tablets and phones | Medium |
| SMS/WhatsApp integration | External messaging capability | Low |
| Offline mode | Local data entry when disconnected | Low |

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up project structure and database
- Create admin dashboard UI shell
- Implement authentication and user roles

### Phase 2: Platform Management (Weeks 3-4)
- Build platform CRUD operations
- Implement cloud drive connectors
- Create sync status monitoring

### Phase 3: Beneficiary Tracking (Weeks 5-6)
- Build beneficiary data model
- Implement journey tracker UI
- Create registration workflows

### Phase 4: Messaging System (Weeks 7-8)
- Build compose and send functionality
- Implement recipient targeting
- Add delivery tracking

### Phase 5: Analytics & Reports (Weeks 9-10)
- Create chart visualizations
- Build report templates
- Implement export functionality

### Phase 6: Testing & Deployment (Weeks 11-12)
- User acceptance testing
- Performance optimization
- Production deployment

---

## 9. Success Criteria

- [ ] Admin can view all platforms in single dashboard
- [ ] Each platform syncs data from its cloud drive automatically
- [ ] Beneficiary journey is trackable from registration to outcome
- [ ] Messages can be sent to individuals, groups, or all platforms
- [ ] Reports export in PDF, Excel, and CSV formats
- [ ] System supports 12+ platforms with 200+ beneficiaries each
- [ ] Mobile-responsive design for field coordinators
- [ ] Role-based access controls function correctly
- [ ] Data sync completes within 5 minutes of cloud file update
- [ ] 99.5% uptime for core dashboard functionality

---

*Y-TRACK — Youth Tracking, Reporting & Knowledge System*
*Built for INDH Youth Platforms, Morocco*
*Version 1.0 | May 2026*
