# Y-TRACK Admin Dashboard

A multi-tenant Monitoring & Evaluation system for youth platforms with integrated Vercel Web Analytics.

## Project Structure

- `/backend` - Flask API backend
- `/app` - Next.js frontend with Vercel Analytics

## Features

- ✅ Vercel Web Analytics integrated
- 🔥 Next.js 16 with App Router
- 📊 Flask REST API backend
- 🎯 TypeScript support
- 📱 Responsive design

## Getting Started

### Frontend (Next.js)

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

### Backend (Flask)

Navigate to the backend directory:
```bash
cd backend
```

Install Python dependencies (recommended: use a virtual environment):
```bash
pip install flask flask-cors
```

Run the Flask server:
```bash
python app.py
```

The API will be available at [http://localhost:5000](http://localhost:5000).

## Vercel Web Analytics

This project has been configured with Vercel Web Analytics following the official documentation.

### Configuration Details

- **Package**: `@vercel/analytics` v2.0.1
- **Integration**: Next.js App Router
- **Location**: `app/layout.tsx`

The Analytics component is placed at the root layout level to track all pages automatically.

### Enabling Analytics on Vercel

1. Deploy this project to Vercel
2. Go to your project dashboard on Vercel
3. Navigate to the Analytics tab
4. Click "Enable Web Analytics"

Analytics will start collecting data once deployed and enabled.

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/platforms` - Get all platforms
- `GET /api/v1/beneficiaries` - Get all beneficiaries
- `GET /api/v1/programs` - Get all programs

## Deployment

### Deploy to Vercel

The easiest way to deploy this project is using the Vercel platform:

```bash
npm install -g vercel
vercel
```<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>X-TRACK — Youth Tracking Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root {
    --primary: #2563EB; --primary-light: #3b82f6; --cyan: #06B6D4;
    --gold: #F59E0B; --green: #10B981; --red: #EF4444; --orange: #F97316;
    --dark: #0F172A; --dark-card: #1e293b; --gray: #94A3B8;
    --gray-light: #cbd5e1; --light: #F8FAFC; --white: #ffffff;
    --sidebar-width: 260px; --header-height: 64px; --radius: 12px;
    --shadow: 0 1px 3px rgba(0,0,0,0.1); --shadow-lg: 0 10px 40px rgba(0,0,0,0.15);
    --transition: all 0.3s ease;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: var(--light); color: var(--dark); overflow-x: hidden; }

  /* SPLASH */
  #splash { position: fixed; inset: 0; background: var(--dark); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.8s, visibility 0.8s; }
  #splash.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
  .splash-svg { width: 140px; height: 140px; }
  .s-ring { fill: none; stroke: var(--primary-light); stroke-width: 3; stroke-dasharray: 440; stroke-dashoffset: 440; animation: dr 1.5s ease-out forwards; }
  .s-ring2 { fill: none; stroke: var(--cyan); stroke-width: 2; stroke-dasharray: 314; stroke-dashoffset: 314; animation: dr2 1.2s ease-out 0.5s forwards; }
  .s-y { fill: none; stroke: var(--white); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 200; stroke-dashoffset: 200; animation: dy 1s ease-out 1s forwards; }
  .s-dot { fill: var(--gold); opacity: 0; animation: pi 0.6s ease-out 1.8s forwards, pd 2s ease-in-out 2.4s infinite; }
  .s-dp { fill: var(--green); opacity: 0; animation: pi 0.4s ease-out forwards; }
  .sdp1 { animation-delay: 2.0s; } .sdp2 { animation-delay: 2.2s; } .sdp3 { animation-delay: 2.4s; } .sdp4 { animation-delay: 2.6s; }
  .s-title { font-size: 36px; font-weight: 800; color: var(--white); letter-spacing: 4px; margin-top: 24px; opacity: 0; transform: translateY(20px); animation: su 0.8s ease-out 2s forwards; }
  .s-title span { color: var(--primary-light); }
  .s-tag { font-size: 14px; color: var(--gray); letter-spacing: 6px; text-transform: uppercase; margin-top: 8px; opacity: 0; animation: pi 0.8s ease-out 2.5s forwards; }
  .s-loader { width: 200px; height: 3px; background: var(--dark-card); border-radius: 3px; margin-top: 40px; overflow: hidden; }
  .s-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--primary), var(--cyan)); border-radius: 3px; animation: lp 2s ease-out 0.5s forwards; }
  @keyframes dr { to { stroke-dashoffset: 0; } } @keyframes dr2 { to { stroke-dashoffset: 0; } }
  @keyframes dy { to { stroke-dashoffset: 0; } } @keyframes pi { to { opacity: 1; } }
  @keyframes pd { 0%,100% { r: 5; } 50% { r: 8; opacity: 0.7; } } @keyframes su { to { opacity: 1; transform: translateY(0); } }
  @keyframes lp { to { width: 100%; } }

  /* LAYOUT */
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: var(--sidebar-width); background: var(--dark); color: var(--white); position: fixed; height: 100vh; overflow-y: auto; z-index: 100; transition: var(--transition); }
  .sidebar.collapsed { width: 70px; }
  .sidebar.collapsed .nav-text, .sidebar.collapsed .sf h1, .sidebar.collapsed .sf p { display: none; }
  .sf { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 12px; }
  .sf svg { width: 40px; height: 40px; flex-shrink: 0; }
  .sf h1 { font-size: 22px; font-weight: 800; letter-spacing: 2px; } .sf h1 span { color: var(--primary-light); }
  .sf p { font-size: 10px; color: var(--gray); letter-spacing: 3px; text-transform: uppercase; margin-top: 2px; }
  .nav-menu { padding: 16px 12px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: var(--transition); margin-bottom: 4px; color: var(--gray-light); text-decoration: none; }
  .nav-item:hover, .nav-item.active { background: rgba(37,99,235,0.15); color: var(--white); }
  .nav-item.active { border-left: 3px solid var(--primary); }
  .nav-item i { width: 20px; text-align: center; font-size: 16px; }
  .nav-text { font-size: 14px; font-weight: 500; }
  .s-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); position: absolute; bottom: 0; width: 100%; }
  .sync-st { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray); }
  .sync-d { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  .main { margin-left: var(--sidebar-width); flex: 1; min-height: 100vh; transition: var(--transition); }
  .sidebar.collapsed ~ .main { margin-left: 70px; }

  /* HEADER */
  .header { height: var(--header-height); background: var(--white); border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 50; }
  .hl { display: flex; align-items: center; gap: 16px; }
  .menu-btn { background: none; border: none; font-size: 20px; color: var(--dark); cursor: pointer; padding: 8px; border-radius: 8px; transition: var(--transition); }
  .menu-btn:hover { background: var(--light); }
  .ht { font-size: 20px; font-weight: 700; color: var(--dark); }
  .hr { display: flex; align-items: center; gap: 16px; }
  .search { position: relative; }
  .search input { background: var(--light); border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px 8px 36px; font-size: 14px; width: 240px; outline: none; transition: var(--transition); font-family: inherit; }
  .search input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .search i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray); font-size: 14px; }
  .h-btn { background: none; border: none; font-size: 18px; color: var(--gray); cursor: pointer; padding: 8px; border-radius: 8px; position: relative; transition: var(--transition); }
  .h-btn:hover { background: var(--light); color: var(--dark); }
  .badge { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: var(--red); border-radius: 50%; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--cyan)); display: flex; align-items: center; justify-content: center; color: var(--white); font-weight: 700; font-size: 14px; cursor: pointer; }

  .content { padding: 24px; }

  /* KPI */
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
  .kpi { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); transition: var(--transition); border: 1px solid #e2e8f0; }
  .kpi:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .kh { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .kt { font-size: 13px; font-weight: 500; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; }
  .kicon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .kicon.blue { background: rgba(37,99,235,0.1); color: var(--primary); }
  .kicon.green { background: rgba(16,185,129,0.1); color: var(--green); }
  .kicon.gold { background: rgba(245,158,11,0.1); color: var(--gold); }
  .kicon.red { background: rgba(239,68,68,0.1); color: var(--red); }
  .kicon.cyan { background: rgba(6,182,212,0.1); color: var(--cyan); }
  .kv { font-size: 28px; font-weight: 800; color: var(--dark); margin-bottom: 8px; }
  .kc { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 4px; }
  .kc.up { color: var(--green); } .kc.down { color: var(--red); }

  /* CHARTS */
  .charts { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px; }
  .chart { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border: 1px solid #e2e8f0; }
  .ch { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .ct { font-size: 16px; font-weight: 700; color: var(--dark); }
  .cf { display: flex; gap: 8px; }
  .cf button { padding: 6px 12px; border: 1px solid #e2e8f0; background: var(--white); border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: var(--transition); }
  .cf button:hover, .cf button.active { background: var(--primary); color: var(--white); border-color: var(--primary); }
  .cc { position: relative; height: 300px; }

  /* TABLES */
  .card { background: var(--white); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border: 1px solid #e2e8f0; margin-bottom: 24px; }
  .ch2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .ct2 { font-size: 18px; font-weight: 700; color: var(--dark); }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 14px 16px; font-size: 14px; color: var(--dark); border-bottom: 1px solid #f1f5f9; }
  tr:hover td { background: var(--light); }
  .pinfo { display: flex; align-items: center; gap: 12px; }
  .pava { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--cyan)); display: flex; align-items: center; justify-content: center; color: var(--white); font-weight: 700; font-size: 14px; }
  .pn { font-weight: 600; } .ploc { font-size: 12px; color: var(--gray); margin-top: 2px; }
  .st { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .st.on { background: rgba(16,185,129,0.1); color: var(--green); }
  .st.sy { background: rgba(245,158,11,0.1); color: var(--gold); }
  .st.of { background: rgba(239,68,68,0.1); color: var(--red); }
  .std { width: 6px; height: 6px; border-radius: 50%; }
  .st.on .std { background: var(--green); }
  .st.sy .std { background: var(--gold); animation: pulse 1.5s infinite; }
  .st.of .std { background: var(--red); }
  .abtns { display: flex; gap: 8px; }
  .abtn { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0; background: var(--white); color: var(--gray); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
  .abtn:hover { background: var(--primary); color: var(--white); border-color: var(--primary); }

  /* JOURNEY */
  .journey { display: flex; align-items: center; gap: 0; }
  .jstep { display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; }
  .jstep:not(:last-child)::after { content: ''; position: absolute; top: 16px; left: 50%; width: 50px; height: 2px; background: #e2e8f0; z-index: 0; }
  .jstep.done:not(:last-child)::after { background: var(--green); }
  .jcircle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; z-index: 1; }
  .jcircle.done { background: var(--green); color: var(--white); }
  .jcircle.act { background: var(--primary); color: var(--white); box-shadow: 0 0 0 4px rgba(37,99,235,0.2); }
  .jcircle.pen { background: var(--white); color: var(--gray); border: 2px solid #e2e8f0; }
  .jlabel { font-size: 10px; font-weight: 500; color: var(--gray); white-space: nowrap; }
  .jlabel.done { color: var(--green); } .jlabel.act { color: var(--primary); font-weight: 600; }

  /* MESSAGES */
  .mlist { display: flex; flex-direction: column; gap: 12px; }
  .mitem { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 10px; background: var(--light); transition: var(--transition); cursor: pointer; }
  .mitem:hover { background: #e2e8f0; }
  .mava { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--cyan)); display: flex; align-items: center; justify-content: center; color: var(--white); font-weight: 700; flex-shrink: 0; }
  .mcon { flex: 1; }
  .mh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .ms { font-weight: 600; font-size: 14px; color: var(--dark); }
  .mt { font-size: 12px; color: var(--gray); }
  .mp { font-size: 13px; color: var(--gray); line-height: 1.4; }
  .mst { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
  .mst.sent { background: rgba(37,99,235,0.1); color: var(--primary); }
  .mst.del { background: rgba(6,182,212,0.1); color: var(--cyan); }
  .mst.read { background: rgba(16,185,129,0.1); color: var(--green); }

  /* MODAL */
  .modal-o { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 200; opacity: 0; visibility: hidden; transition: var(--transition); }
  .modal-o.active { opacity: 1; visibility: visible; }
  .modal { background: var(--white); border-radius: var(--radius); width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); transform: scale(0.95); transition: var(--transition); }
  .modal-o.active .modal { transform: scale(1); }
  .mh3 { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .mt3 { font-size: 18px; font-weight: 700; color: var(--dark); }
  .mclose { background: none; border: none; font-size: 20px; color: var(--gray); cursor: pointer; padding: 4px; border-radius: 6px; transition: var(--transition); }
  .mclose:hover { background: var(--light); color: var(--dark); }
  .mb { padding: 24px; }
  .mf { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }

  /* FORMS */
  .fg { margin-bottom: 16px; }
  .fl { display: block; font-size: 13px; font-weight: 600; color: var(--dark); margin-bottom: 6px; }
  .fi, .fs { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: var(--transition); }
  .fi:focus, .fs:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .fr { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* BUTTONS */
  .btn { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition); border: none; display: inline-flex; align-items: center; gap: 8px; }
  .btn-p { background: var(--primary); color: var(--white); }
  .btn-p:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-o { background: var(--white); color: var(--dark); border: 1px solid #e2e8f0; }
  .btn-o:hover { background: var(--light); }

  /* TOAST */
  .tc { position: fixed; top: 80px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 12px; }
  .toast { background: var(--white); border-radius: 10px; padding: 14px 20px; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 12px; min-width: 300px; animation: tir 0.4s ease; border-left: 4px solid var(--primary); }
  .toast.ok { border-left-color: var(--green); } .toast.er { border-left-color: var(--red); } .toast.wa { border-left-color: var(--gold); }
  @keyframes tir { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* RESPONSIVE */
  @media (max-width: 1024px) { .charts { grid-template-columns: 1fr; } .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); } .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; } .kpi-grid { grid-template-columns: 1fr; }
    .ht { display: none; } .search input { width: 160px; } .fr { grid-template-columns: 1fr; }
  }

  .page { display: none; } .page.active { display: block; }
</style>
</head>
<body>

<!-- SPLASH -->
<div id="splash">
  <svg class="splash-svg" viewBox="0 0 200 200">
    <circle class="s-ring" cx="100" cy="100" r="70"/>
    <circle class="s-ring2" cx="100" cy="100" r="50"/>
    <path class="s-y" d="M 85 70 L 100 95 L 115 70 M 100 95 L 100 130"/>
    <circle class="s-dot" cx="100" cy="55" r="5"/>
    <circle class="s-dp sdp1" cx="100" cy="30" r="3"/>
    <circle class="s-dp sdp2" cx="130" cy="45" r="3"/>
    <circle class="s-dp sdp3" cx="145" cy="75" r="3"/>
    <circle class="s-dp sdp4" cx="140" cy="105" r="3"/>
  </svg>
  <div class="s-title">X-<span>TRACK</span></div>
  <div class="s-tag">Youth Tracking & Reporting</div>
  <div class="s-loader"><div class="s-fill"></div></div>
</div>

<div class="app">
  <aside class="sidebar" id="sidebar">
    <div class="sf">
      <svg viewBox="0 0 200 200" width="40" height="40">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#2563eb" stroke-width="10"/>
        <path d="M 75 60 L 100 100 L 125 60 M 100 100 L 100 150" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="100" cy="40" r="8" fill="#f59e0b"/>
      </svg>
      <div><h1>X-<span>TRACK</span></h1><p>Youth Tracking System</p></div>
    </div>
    <nav class="nav-menu">
      <a class="nav-item active" onclick="showPage('dashboard', this)"><i class="fas fa-chart-pie"></i><span class="nav-text">Dashboard</span></a>
      <a class="nav-item" onclick="showPage('platforms', this)"><i class="fas fa-building"></i><span class="nav-text">Youth Platforms</span></a>
      <a class="nav-item" onclick="showPage('beneficiaries', this)"><i class="fas fa-users"></i><span class="nav-text">Beneficiaries</span></a>
      <a class="nav-item" onclick="showPage('programs', this)"><i class="fas fa-graduation-cap"></i><span class="nav-text">Programs</span></a>
      <a class="nav-item" onclick="showPage('messages', this)"><i class="fas fa-envelope"></i><span class="nav-text">Messages</span><span style="margin-left:auto;background:var(--red);color:white;font-size:10px;padding:2px 6px;border-radius:10px;">3</span></a>
      <a class="nav-item" onclick="showPage('reports', this)"><i class="fas fa-file-alt"></i><span class="nav-text">Reports</span></a>
      <a class="nav-item" onclick="showPage('cloud', this)"><i class="fas fa-cloud"></i><span class="nav-text">Cloud Drives</span></a>
      <a class="nav-item" onclick="showPage('settings', this)"><i class="fas fa-cog"></i><span class="nav-text">Settings</span></a>
    </nav>
    <div class="s-footer"><div class="sync-st"><div class="sync-d"></div><span>All systems online</span></div></div>
  </aside>

  <main class="main">
    <header class="header">
      <div class="hl">
        <button class="menu-btn" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
        <h2 class="ht" id="pt">Dashboard</h2>
      </div>
      <div class="hr">
        <div class="search"><i class="fas fa-search"></i><input type="text" placeholder="Search..."></div>
        <button class="h-btn"><i class="fas fa-bell"></i><span class="badge"></span></button>
        <div class="avatar">SA</div>
      </div>
    </header>
    <div class="tc" id="tc"></div>

    <!-- DASHBOARD -->
    <div class="page active" id="p-dashboard">
      <div class="content">
        <div class="kpi-grid">
          <div class="kpi"><div class="kh"><span class="kt">Total Beneficiaries</span><div class="kicon blue"><i class="fas fa-users"></i></div></div><div class="kv">2,847</div><div class="kc up"><i class="fas fa-arrow-up"></i><span>+12.5% from last month</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Female Participation</span><div class="kicon cyan"><i class="fas fa-venus"></i></div></div><div class="kv">58.3%</div><div class="kc up"><i class="fas fa-arrow-up"></i><span>+3.2% from last quarter</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Completion Rate</span><div class="kicon green"><i class="fas fa-check-circle"></i></div></div><div class="kv">72.1%</div><div class="kc up"><i class="fas fa-arrow-up"></i><span>+5.8% year over year</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Active Platforms</span><div class="kicon gold"><i class="fas fa-building"></i></div></div><div class="kv">14</div><div class="kc"><span>Across 7 regions</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Dropout Rate</span><div class="kicon red"><i class="fas fa-user-minus"></i></div></div><div class="kv">8.4%</div><div class="kc down"><i class="fas fa-arrow-down"></i><span>-2.1% improvement</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Outcomes Achieved</span><div class="kicon green"><i class="fas fa-trophy"></i></div></div><div class="kv">1,243</div><div class="kc up"><i class="fas fa-arrow-up"></i><span>Employment, certs, education</span></div></div>
        </div>
        <div class="charts">
          <div class="chart"><div class="ch"><h3 class="ct">Registration Trends</h3><div class="cf"><button class="active">Monthly</button><button>Quarterly</button><button>Yearly</button></div></div><div class="cc"><canvas id="c1"></canvas></div></div>
          <div class="chart"><div class="ch"><h3 class="ct">Gender Distribution</h3></div><div class="cc"><canvas id="c2"></canvas></div></div>
        </div>
        <div class="card">
          <div class="ch2"><h3 class="ct2">Recent Platform Activity</h3><button class="btn btn-o" onclick="showPage('platforms', document.querySelectorAll('.nav-item')[1])"><i class="fas fa-arrow-right"></i> View All</button></div>
          <table>
            <thead><tr><th>Platform</th><th>Region</th><th>Beneficiaries</th><th>Completion</th><th>Sync Status</th><th>Last Sync</th></tr></thead>
            <tbody>
              <tr><td><div class="pinfo"><div class="pava">C</div><div><div class="pn">Casablanca Youth Center</div><div class="ploc">Casablanca-Settat</div></div></div></td><td>Casablanca-Settat</td><td><strong>342</strong> <span style="color:var(--gray);font-size:12px;">/ 400</span></td><td><strong style="color:var(--green);">78%</strong></td><td><span class="st on"><span class="std"></span> Online</span></td><td>2 min ago</td></tr>
              <tr><td><div class="pinfo"><div class="pava">R</div><div><div class="pn">Rabat Innovation Hub</div><div class="ploc">Rabat-Salé-Kénitra</div></div></div></td><td>Rabat-Salé-Kénitra</td><td><strong>256</strong> <span style="color:var(--gray);font-size:12px;">/ 300</span></td><td><strong style="color:var(--green);">82%</strong></td><td><span class="st on"><span class="std"></span> Online</span></td><td>5 min ago</td></tr>
              <tr><td><div class="pinfo"><div class="pava">M</div><div><div class="pn">Marrakech Skills Lab</div><div class="ploc">Marrakech-Safi</div></div></div></td><td>Marrakech-Safi</td><td><strong>189</strong> <span style="color:var(--gray);font-size:12px;">/ 250</span></td><td><strong style="color:var(--gold);">65%</strong></td><td><span class="st sy"><span class="std"></span> Syncing</span></td><td>Just now</td></tr>
              <tr><td><div class="pinfo"><div class="pava">F</div><div><div class="pn">Fès Digital Academy</div><div class="ploc">Fès-Meknès</div></div></div></td><td>Fès-Meknès</td><td><strong>198</strong> <span style="color:var(--gray);font-size:12px;">/ 220</span></td><td><strong style="color:var(--green);">71%</strong></td><td><span class="st on"><span class="std"></span> Online</span></td><td>12 min ago</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PLATFORMS -->
    <div class="page" id="p-platforms">
      <div class="content">
        <div class="card">
          <div class="ch2"><h3 class="ct2">Youth Platforms</h3><button class="btn btn-p" onclick="openM('mp')"><i class="fas fa-plus"></i> Add Platform</button></div>
          <table>
            <thead><tr><th>Platform</th><th>Coordinator</th><th>Beneficiaries</th><th>Programs</th><th>Sync Status</th><th>Actions</th></tr></thead>
            <tbody id="tb-plat"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- BENEFICIARIES -->
    <div class="page" id="p-beneficiaries">
      <div class="content">
        <div class="card">
          <div class="ch2"><h3 class="ct2">Beneficiaries</h3><div style="display:flex;gap:12px;"><button class="btn btn-o"><i class="fas fa-filter"></i> Filter</button><button class="btn btn-p" onclick="openM('mb')"><i class="fas fa-plus"></i> Add Beneficiary</button></div></div>
          <div style="overflow-x:auto;">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Age/Gender</th><th>Platform</th><th>Program</th><th>Journey</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="tb-ben"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- PROGRAMS -->
    <div class="page" id="p-programs">
      <div class="content">
        <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);">
          <div class="kpi"><div class="kh"><span class="kt">Leadership & Civic</span><div class="kicon blue"><i class="fas fa-handshake"></i></div></div><div class="kv">1,024</div><div class="kc"><span>Enrolled across 14 platforms</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Skills Training</span><div class="kicon cyan"><i class="fas fa-tools"></i></div></div><div class="kv">1,356</div><div class="kc"><span>Most popular program</span></div></div>
          <div class="kpi"><div class="kh"><span class="kt">Entrepreneurship</span><div class="kicon gold"><i class="fas fa-rocket"></i></div></div><div class="kv">467</div><div class="kc"><span>87 business plans submitted</span></div></div>
        </div>
        <div class="card">
          <div class="ch2"><h3 class="ct2">Program Enrollment by Platform</h3></div>
          <div class="cc" style="height:400px;"><canvas id="c3"></canvas></div>
        </div>
      </div>
    </div>

    <!-- MESSAGES -->
    <div class="page" id="p-messages">
      <div class="content">
        <div class="card">
          <div class="ch2"><h3 class="ct2">Messages</h3><button class="btn btn-p" onclick="openM('mm')"><i class="fas fa-pen"></i> Compose</button></div>
          <div class="mlist" id="mlist"></div>
        </div>
      </div>
    </div>

    <!-- REPORTS -->
    <div class="page" id="p-reports">
      <div class="content">
        <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);">
          <div class="kpi" style="cursor:pointer;" onclick="toast('Generating Monthly Report...','ok')"><div class="kh"><span class="kt">Monthly</span><div class="kicon blue"><i class="fas fa-calendar-day"></i></div></div><div class="kv" style="font-size:18px;">KPIs, Data Quality, Risks</div></div>
          <div class="kpi" style="cursor:pointer;" onclick="toast('Generating Quarterly Report...','ok')"><div class="kh"><span class="kt">Quarterly</span><div class="kicon cyan"><i class="fas fa-calendar-week"></i></div></div><div class="kv" style="font-size:18px;">Target vs Actual, Analysis</div></div>
          <div class="kpi" style="cursor:pointer;" onclick="toast('Generating Annual Report...','ok')"><div class="kh"><span class="kt">Annual</span><div class="kicon green"><i class="fas fa-calendar-alt"></i></div></div><div class="kv" style="font-size:18px;">Impact Analysis, Stories</div></div>
          <div class="kpi" style="cursor:pointer;" onclick="toast('Opening Custom Report Builder...','ok')"><div class="kh"><span class="kt">Ad-hoc</span><div class="kicon gold"><i class="fas fa-sliders-h"></i></div></div><div class="kv" style="font-size:18px;">Custom Filters & Dates</div></div>
        </div>
        <div class="card">
          <div class="ch2"><h3 class="ct2">Recent Reports</h3></div>
          <table>
            <thead><tr><th>Report Name</th><th>Type</th><th>Period</th><th>Generated</th><th>Format</th><th>Actions</th></tr></thead>
            <tbody>
              <tr><td><strong>Q2 2026 Performance</strong></td><td>Quarterly</td><td>Apr - Jun 2026</td><td>Jul 1, 2026</td><td><span class="st on" style="text-transform:none;">PDF</span></td><td><button class="abtn"><i class="fas fa-download"></i></button></td></tr>
              <tr><td><strong>June 2026 Monitoring</strong></td><td>Monthly</td><td>Jun 2026</td><td>Jul 2, 2026</td><td><span class="st sy" style="text-transform:none;">Excel</span></td><td><button class="abtn"><i class="fas fa-download"></i></button></td></tr>
              <tr><td><strong>Gender Analysis 2026</strong></td><td>Ad-hoc</td><td>Jan - Jun 2026</td><td>Jun 28, 2026</td><td><span class="st on" style="text-transform:none;background:rgba(139,92,246,0.1);color:#8b5cf6;">PowerPoint</span></td><td><button class="abtn"><i class="fas fa-download"></i></button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CLOUD -->
    <div class="page" id="p-cloud">
      <div class="content">
        <div class="card">
          <div class="ch2"><h3 class="ct2">Cloud Drive Sync Status</h3><button class="btn btn-p" onclick="toast('Syncing all platforms...','ok')"><i class="fas fa-sync"></i> Sync All</button></div>
          <table>
            <thead><tr><th>Platform</th><th>OneDrive</th><th>Google Drive</th><th>Status</th><th>Last Sync</th><th>Storage</th><th>Actions</th></tr></thead>
            <tbody id="tb-cloud"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- SETTINGS -->
    <div class="page" id="p-settings">
      <div class="content">
        <div class="card">
          <div class="ch2"><h3 class="ct2">Profile Settings</h3></div>
          <div style="max-width:500px;">
            <div class="fr">
              <div class="fg"><label class="fl">First Name</label><input type="text" class="fi" value="Super"></div>
              <div class="fg"><label class="fl">Last Name</label><input type="text" class="fi" value="Admin"></div>
            </div>
            <div class="fg"><label class="fl">Email</label><input type="email" class="fi" value="admin@xtrack.ma"></div>
            <div class="fg"><label class="fl">Role</label><input type="text" class="fi" value="Super Admin" disabled style="background:var(--light);"></div>
            <div class="fg"><label class="fl">Language</label><select class="fs"><option>English</option><option>Français</option><option>العربية</option></select></div>
            <button class="btn btn-p" onclick="toast('Settings saved successfully!','ok')"><i class="fas fa-save"></i> Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- MODALS -->
<div class="modal-o" id="mp"><div class="modal"><div class="mh3"><h3 class="mt3">Add New Youth Platform</h3><button class="mclose" onclick="closeM('mp')"><i class="fas fa-times"></i></button></div><div class="mb">
  <div class="fr"><div class="fg"><label class="fl">Platform Name</label><input type="text" class="fi" placeholder="e.g., Casablanca Youth Center"></div><div class="fg"><label class="fl">Coordinator</label><select class="fs"><option>Select Coordinator</option><option>Ahmed Benali</option><option>Fatima Zahra</option><option>Youssef Alami</option></select></div></div>
  <div class="fr"><div class="fg"><label class="fl">Region</label><select class="fs"><option>Select Region</option><option>Casablanca-Settat</option><option>Rabat-Salé-Kénitra</option><option>Marrakech-Safi</option><option>Fès-Meknès</option></select></div><div class="fg"><label class="fl">City</label><input type="text" class="fi" placeholder="City name"></div></div>
  <div class="fg"><label class="fl">Address</label><input type="text" class="fi" placeholder="Full address"></div>
  <div class="fg"><label class="fl">OneDrive URL</label><input type="url" class="fi" placeholder="https://..."></div>
  <div class="fg"><label class="fl">Google Drive URL</label><input type="url" class="fi" placeholder="https://..."></div>
</div><div class="mf"><button class="btn btn-o" onclick="closeM('mp')">Cancel</button><button class="btn btn-p" onclick="closeM('mp'); toast('Platform added successfully!','ok')"><i class="fas fa-save"></i> Save Platform</button></div></div></div>

<div class="modal-o" id="mb"><div class="modal"><div class="mh3"><h3 class="mt3">Register New Beneficiary</h3><button class="mclose" onclick="closeM('mb')"><i class="fas fa-times"></i></button></div><div class="mb">
  <div class="fr"><div class="fg"><label class="fl">First Name</label><input type="text" class="fi" placeholder="First name"></div><div class="fg"><label class="fl">Last Name</label><input type="text" class="fi" placeholder="Last name"></div></div>
  <div class="fr"><div class="fg"><label class="fl">Date of Birth</label><input type="date" class="fi"></div><div class="fg"><label class="fl">Gender</label><select class="fs"><option>Select</option><option>Female</option><option>Male</option></select></div></div>
  <div class="fr"><div class="fg"><label class="fl">Region</label><select class="fs"><option>Select Region</option><option>Casablanca-Settat</option><option>Rabat-Salé-Kénitra</option><option>Marrakech-Safi</option></select></div><div class="fg"><label class="fl">City</label><input type="text" class="fi" placeholder="City"></div></div>
  <div class="fg"><label class="fl">Education Level</label><select class="fs"><option>Select Level</option><option>Primary</option><option>Secondary</option><option>Bachelor</option><option>Master</option><option>Other</option></select></div>
  <div class="fr"><div class="fg"><label class="fl">Email</label><input type="email" class="fi" placeholder="email@example.com"></div><div class="fg"><label class="fl">Phone</label><input type="tel" class="fi" placeholder="+212 ..."></div></div>
  <div class="fr"><div class="fg"><label class="fl">Platform</label><select class="fs"><option>Select Platform</option><option>Casablanca Youth Center</option><option>Rabat Innovation Hub</option><option>Marrakech Skills Lab</option></select></div><div class="fg"><label class="fl">Program</label><select class="fs"><option>Select Program</option><option>Leadership & Civic Engagement</option><option>Skills Training</option><option>Entrepreneurship</option></select></div></div>
</div><div class="mf"><button class="btn btn-o" onclick="closeM('mb')">Cancel</button><button class="btn btn-p" onclick="closeM('mb'); toast('Beneficiary registered! ID: YTR-2848','ok')"><i class="fas fa-save"></i> Register</button></div></div></div>

<div class="modal-o" id="mm"><div class="modal"><div class="mh3"><h3 class="mt3">Compose Message</h3><button class="mclose" onclick="closeM('mm')"><i class="fas fa-times"></i></button></div><div class="mb">
  <div class="fg"><label class="fl">Recipients</label><select class="fs"><option>All Platforms</option><option>Casablanca Youth Center</option><option>Rabat Innovation Hub</option><option>Active Beneficiaries Only</option><option>Female Participants</option></select></div>
  <div class="fg"><label class="fl">Message Type</label><select class="fs"><option>Event Invitation</option><option>Program Announcement</option><option>Reminder</option><option>Follow-up</option></select></div>
  <div class="fg"><label class="fl">Message</label><textarea class="fi" rows="5" placeholder="Type your message here..."></textarea></div>
</div><div class="mf"><button class="btn btn-o" onclick="closeM('mm')">Cancel</button><button class="btn btn-p" onclick="closeM('mm'); toast('Message sent to 342 recipients!','ok')"><i class="fas fa-paper-plane"></i> Send</button></div></div></div>

<script>
// SPLASH
setTimeout(() => document.getElementById('splash').classList.add('hidden'), 3500);

// SIDEBAR
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }

// NAVIGATION
const titles = { dashboard: 'Dashboard', platforms: 'Youth Platforms', beneficiaries: 'Beneficiaries', programs: 'Programs', messages: 'Messages', reports: 'Reports', cloud: 'Cloud Drives', settings: 'Settings' };
function showPage(pid, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('p-' + pid).classList.add('active');
  document.getElementById('pt').textContent = titles[pid];
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  if (pid === 'dashboard') setTimeout(initCharts, 100);
  if (pid === 'programs') setTimeout(initProgChart, 100);
}

// MODALS
function openM(id) { document.getElementById(id).classList.add('active'); }
function closeM(id) { document.getElementById(id).classList.remove('active'); }
document.querySelectorAll('.modal-o').forEach(o => o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); }));

// TOAST
function toast(msg, type) {
  const c = document.getElementById('tc');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const i = type === 'ok' ? 'check-circle' : type === 'er' ? 'exclamation-circle' : 'info-circle';
  const col = type === 'ok' ? 'green' : type === 'er' ? 'red' : 'gold';
  t.innerHTML = `<i class="fas fa-${i}" style="color:var(--${col})"></i><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

// DATA
const plats = [
  { n: 'Casablanca Youth Center', loc: 'Casablanca-Settat', city: 'Casablanca', coord: 'Ahmed Benali', ben: 342, act: 298, comp: 267, st: 'on', sync: '2 min ago' },
  { n: 'Rabat Innovation Hub', loc: 'Rabat-Salé-Kénitra', city: 'Rabat', coord: 'Fatima Zahra', ben: 256, act: 210, comp: 210, st: 'on', sync: '5 min ago' },
  { n: 'Marrakech Skills Lab', loc: 'Marrakech-Safi', city: 'Marrakech', coord: 'Youssef Alami', ben: 189, act: 156, comp: 123, st: 'sy', sync: 'Just now' },
  { n: 'Fès Digital Academy', loc: 'Fès-Meknès', city: 'Fès', coord: 'Layla Moussaoui', ben: 198, act: 175, comp: 141, st: 'on', sync: '12 min ago' },
  { n: 'Tanger Connect', loc: 'Tanger-Tétouan', city: 'Tanger', coord: 'Omar Idrissi', ben: 167, act: 145, comp: 98, st: 'of', sync: '2 hours ago' },
  { n: 'Agadir Youth Zone', loc: 'Souss-Massa', city: 'Agadir', coord: 'Samira Tazi', ben: 134, act: 120, comp: 89, st: 'on', sync: '8 min ago' }
];

const bens = [
  { id: 'YTR-2847', name: 'Amina El Fassi', age: 22, g: 'F', plat: 'Casablanca Youth Center', prog: 'Skills Training', step: 3, st: 'Active' },
  { id: 'YTR-2846', name: 'Karim Benjelloun', age: 19, g: 'M', plat: 'Rabat Innovation Hub', prog: 'Leadership', step: 4, st: 'Completed' },
  { id: 'YTR-2845', name: 'Sanaa Moussaoui', age: 24, g: 'F', plat: 'Marrakech Skills Lab', prog: 'Entrepreneurship', step: 2, st: 'Active' },
  { id: 'YTR-2844', name: 'Youssef Alami', age: 20, g: 'M', plat: 'Fès Digital Academy', prog: 'Skills Training', step: 1, st: 'Registered' },
  { id: 'YTR-2843', name: 'Fatima Zahra', age: 21, g: 'F', plat: 'Casablanca Youth Center', prog: 'Leadership', step: 3, st: 'Active' },
  { id: 'YTR-2842', name: 'Mehdi Bennani', age: 23, g: 'M', plat: 'Tanger Connect', prog: 'Entrepreneurship', step: 5, st: 'Referred' },
  { id: 'YTR-2841', name: 'Nadia El Amrani', age: 18, g: 'F', plat: 'Agadir Youth Zone', prog: 'Skills Training', step: 6, st: 'Dropped' },
  { id: 'YTR-2840', name: 'Hassan El Mansouri', age: 25, g: 'M', plat: 'Rabat Innovation Hub', prog: 'Leadership', step: 4, st: 'Completed' }
];

const msgs = [
  { s: 'System', a: 'S', p: 'Monthly report for June 2026 is now available for download.', t: '10 min ago', st: 'read' },
  { s: 'Ahmed Benali', a: 'A', p: 'Casablanca platform reached 85% completion rate this month!', t: '1 hour ago', st: 'del' },
  { s: 'Fatima Zahra', a: 'F', p: 'Requesting additional resources for the Entrepreneurship program.', t: '3 hours ago', st: 'sent' },
  { s: 'System', a: 'S', p: 'Sync completed for Marrakech Skills Lab. 12 new records added.', t: '5 hours ago', st: 'read' }
];

// RENDER
function rPlats() {
  document.getElementById('tb-plat').innerHTML = plats.map(p => `
    <tr><td><div class="pinfo"><div class="pava">${p.n.charAt(0)}</div><div><div class="pn">${p.n}</div><div class="ploc">${p.city}, ${p.loc}</div></div></div></td>
    <td>${p.coord}</td><td><strong>${p.ben}</strong></td><td>3 Active</td>
    <td><span class="st ${p.st}"><span class="std"></span> ${p.st === 'on' ? 'Online' : p.st === 'sy' ? 'Syncing' : 'Offline'}</span></td>
    <td><div class="abtns"><button class="abtn" onclick="toast('Viewing ${p.n}...','ok')"><i class="fas fa-eye"></i></button><button class="abtn" onclick="toast('Syncing ${p.n}...','ok')"><i class="fas fa-sync"></i></button><button class="abtn" onclick="toast('Editing ${p.n}...','ok')"><i class="fas fa-edit"></i></button></div></td></tr>
  `).join('');
}

function rBens() {
  const steps = ['Registered','Orientation','Active','Completed','Referred','Dropped'];
  const sc = { Active: 'primary', Completed: 'green', Registered: 'gray', Referred: 'gold', Dropped: 'red' };
  document.getElementById('tb-ben').innerHTML = bens.map(b => {
    const j = steps.map((s, i) => {
      const state = i < b.step ? 'done' : i === b.step - 1 ? 'act' : 'pen';
      return `<div class="jstep ${state}"><div class="jcircle ${state}">${i < b.step ? '<i class="fas fa-check" style="font-size:9px;"></i>' : i + 1}</div><span class="jlabel ${state}">${s}</span></div>`;
    }).join('');
    return `<tr><td><strong style="font-family:monospace;">${b.id}</strong></td><td><strong>${b.name}</strong></td>
    <td>${b.age} yrs / ${b.g === 'F' ? '<i class="fas fa-venus" style="color:var(--cyan)"></i> F' : '<i class="fas fa-mars" style="color:var(--primary)"></i> M'}</td>
    <td>${b.plat}</td><td>${b.prog}</td><td><div class="journey">${j}</div></td>
    <td><span class="st ${sc[b.st] || 'gray'}">${b.st}</span></td>
    <td><div class="abtns"><button class="abtn"><i class="fas fa-eye"></i></button><button class="abtn"><i class="fas fa-edit"></i></button><button class="abtn"><i class="fas fa-envelope"></i></button></div></td></tr>`;
  }).join('');
}

function rMsgs() {
  document.getElementById('mlist').innerHTML = msgs.map(m => `
    <div class="mitem"><div class="mava">${m.a}</div><div class="mcon"><div class="mh"><span class="ms">${m.s}</span><span class="mt">${m.t}</span></div><div class="mp">${m.p}</div></div><span class="mst ${m.st}">${m.st}</span></div>
  `).join('');
}

function rCloud() {
  document.getElementById('tb-cloud').innerHTML = plats.map(p => `
    <tr><td><strong>${p.n}</strong></td><td><span style="color:var(--primary)"><i class="fab fa-microsoft"></i> Connected</span></td>
    <td><span style="color:var(--green)"><i class="fab fa-google-drive"></i> Connected</span></td>
    <td><span class="st ${p.st}"><span class="std"></span> ${p.st === 'on' ? 'Online' : p.st === 'sy' ? 'Syncing' : 'Offline'}</span></td>
    <td>${p.sync}</td><td>1.2 GB / 5 GB</td>
    <td><div class="abtns"><button class="abtn" title="Sync"><i class="fas fa-sync"></i></button><button class="abtn" title="Files"><i class="fas fa-folder-open"></i></button><button class="abtn" title="Settings"><i class="fas fa-cog"></i></button></div></td></tr>
  `).join('');
}

// CHARTS
let c1, c2, c3;
function initCharts() {
  if (c1) return;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#64748b';
  const ctx1 = document.getElementById('c1');
  if (ctx1) {
    c1 = new Chart(ctx1, {
      type: 'line',
      data: { labels: ['Jan','Feb','Mar','Apr','May','Jun'], datasets: [
        { label: 'New Registrations', data: [145,192,168,234,198,267], borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#2563EB' },
        { label: 'Completions', data: [89,134,156,178,201,245], borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10B981' }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', align: 'end' } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
    });
  }
  const ctx2 = document.getElementById('c2');
  if (ctx2) {
    c2 = new Chart(ctx2, {
      type: 'doughnut',
      data: { labels: ['Female','Male'], datasets: [{ data: [58.3, 41.7], backgroundColor: ['#06B6D4','#2563EB'], borderWidth: 0, hoverOffset: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
    });
  }
}

function initProgChart() {
  if (c3) return;
  const ctx = document.getElementById('c3');
  if (ctx) {
    c3 = new Chart(ctx, {
      type: 'bar',
      data: { labels: plats.map(p => p.n.split(' ')[0]), datasets: [
        { label: 'Leadership', data: [98,87,45,67,54,43], backgroundColor: '#2563EB', borderRadius: 4 },
        { label: 'Skills', data: [134,112,89,76,68,54], backgroundColor: '#06B6D4', borderRadius: 4 },
        { label: 'Entrepreneurship', data: [45,34,28,32,21,19], backgroundColor: '#F59E0B', borderRadius: 4 }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }
    });
  }
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  rPlats(); rBens(); rMsgs(); rCloud();
  setTimeout(initCharts, 500);
});

// Filter buttons
document.querySelectorAll('.cf button').forEach(b => {
  b.addEventListener('click', function() {
    this.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
  });
});
</script>
</body>
</html>

Or connect your GitHub repository to Vercel for automatic deployments.

## License

ISC
