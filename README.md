# Y-TRACK: Youth Employability Intelligence Platform

A multi-tenant Monitoring, Evaluation, Profiling, and Job Matching platform for youth employability programs.

## Vision

Y-TRACK helps youth create professional profiles and CVs, access opportunities, and receive career guidance while enabling coordinators and employers to track outcomes and engagement.

## Key Features

### Youth Portal

- AI-powered CV Builder
- CV Scoring
- Career Profiling
- Employability Assessment
- Job Matching
- Internship Discovery
- Opportunity Tracking
- Multilingual Support (Arabic, French, English)

### Coordinator Portal

- User Management
- Youth Profiling Dashboard
- Opportunity Management
- Monitoring & Evaluation
- KPI Tracking
- Program Reporting
- Regional Analytics
- Data Export

### Employer Portal

- Publish Vacancies
- Candidate Search
- Talent Pool Access
- Application Tracking
- Interview Management

## Technical Stack

### Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- App Router
- Vercel Analytics
- React Query

### Backend

- Flask API
- Gunicorn
- JWT Authentication
- Celery Workers
- Redis

### Database

- PostgreSQL

### Storage

- Cloudflare R2 / AWS S3

### Monitoring

- Vercel Analytics
- Grafana
- Prometheus
- Sentry

## Scalability Targets

### Capacity

- 50,000+ Registered Users
- 1,000 Concurrent Users
- 10,000 Daily Sessions
- 100,000 CVs
- Multi-Tenant Support

## Architecture

```
Users
  ↓
Cloudflare CDN
  ↓
Vercel Frontend
  ↓
Load Balancer
  ↓
Flask API Cluster
  ↓
Redis Cache
  ↓
PostgreSQL
  ↓
Object Storage
```

## Core Modules

### Authentication

- JWT Access Token
- Refresh Token
- MFA for Coordinators

### Youth Profiling

Fields:

- Personal Information
- Education
- Languages
- Technical Skills
- Soft Skills
- Career Interests
- Employment Status

### Employability Score

Categories:

- CV Quality
- Skills Readiness
- Language Level
- Training Completion
- Experience

Score range: **0–100**

### Opportunity Management

Opportunity Types:

- Jobs
- Internships
- Scholarships
- Trainings
- Events

### KPI Dashboard

Metrics:

- Registered Youth
- Active Youth
- CV Completion Rate
- Applications Submitted
- Interviews
- Placements
- Employment Rate

## Multi-Tenant Structure

Entities:

- Organizations
- Programs
- Users
- Opportunities
- Reports

Data isolation is implemented using `tenant_id`.

## Performance Requirements

- API Response Time: < 500ms
- Dashboard Load Time: < 2 seconds
- Availability: 99.9%

## Deployment

Frontend:

```bash
npm install
npm run build
npm run start
```

Backend:

```bash
pip install -r requirements.txt

gunicorn -w 8 -k gevent app:app
```

Redis:

```bash
redis-server
```

Worker:

```bash
celery -A app.celery worker --loglevel=info
```

## Roadmap

**Phase 1**

- CV Builder
- User Profiles
- Opportunity Portal

**Phase 2**

- Job Matching Engine
- AI Career Advisor
- Coordinator Dashboard

**Phase 3**

- Employer Portal
- Impact Analytics
- Regional Reporting

**Phase 4**

- AI Employability Coach
- Skill Gap Analysis
- Recommendation Engine
