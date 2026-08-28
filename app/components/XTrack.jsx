"use client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ── CSS injection ──────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg0:#03060D;--bg1:#070D1A;--bg2:#0C1423;--bg3:#11192E;--bg4:#16213E;
  --border:rgba(255,255,255,.06);--border-h:rgba(255,255,255,.12);--border-glow:rgba(59,130,246,.35);
  --text:#DDE6F5;--text2:#94A3B8;--text3:#4B6080;
  --blue:#3B82F6;--cyan:#06B6D4;--green:#10B981;--amber:#F59E0B;--red:#EF4444;--purple:#A78BFA;--pink:#F472B6;
  --glow-blue:0 0 20px rgba(59,130,246,.25);--glow-cyan:0 0 20px rgba(6,182,212,.2);
  --r-sm:6px;--r-md:10px;--r-lg:16px;--r-xl:22px;
  --f-head:'Syne',sans-serif;--f-body:'DM Sans',sans-serif;--f-mono:'DM Mono',monospace;
}
html,body{height:100%;background:var(--bg0);color:var(--text);font-family:var(--f-body)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg1)}
::-webkit-scrollbar-thumb{background:rgba(59,130,246,.3);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:rgba(59,130,246,.55)}

@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes glow{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes pulseRing{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.1);opacity:.9}}
@keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes slideLeft{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

/* Layout */
.xc{display:flex;height:100vh;overflow:hidden;background:var(--bg0)}

/* Sidebar */
.sb{
  width:236px;flex-shrink:0;height:100vh;background:linear-gradient(180deg,var(--bg1) 0%,var(--bg0) 100%);
  border-right:1px solid var(--border);display:flex;flex-direction:column;
  position:relative;overflow:hidden;
}
.sb::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(59,130,246,.4),transparent);
}
.sb-logo{padding:22px 20px 18px;border-bottom:1px solid var(--border)}
.sb-logo-mark{
  display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:10px;
  background:linear-gradient(135deg,#3B82F6,#06B6D4);
  font-family:var(--f-head);font-weight:800;font-size:14px;color:#fff;
  box-shadow:0 4px 16px rgba(59,130,246,.4),0 0 0 1px rgba(59,130,246,.25);
  margin-right:10px;letter-spacing:-0.5px;
}
.sb-logo-txt{font-family:var(--f-head);font-weight:700;font-size:15px;
  background:linear-gradient(135deg,#DDE6F5,#94A3B8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sb-logo-sub{font-size:10px;color:var(--text3);font-family:var(--f-mono);margin-top:1px}
.sb-nav{flex:1;padding:10px 10px;overflow-y:auto}
.sb-section{font-family:var(--f-mono);font-size:9px;font-weight:500;letter-spacing:1.2px;
  color:var(--text3);text-transform:uppercase;padding:14px 12px 6px}
.la{
  display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-md);
  cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);
  transition:all .18s;border:1px solid transparent;margin-bottom:2px;
  position:relative;user-select:none;
}
.la:hover{background:rgba(255,255,255,.04);color:var(--text);border-color:var(--border)}
.la.act{
  background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(6,182,212,.08));
  border-color:rgba(59,130,246,.28);color:#fff;font-weight:600;
  box-shadow:0 2px 12px rgba(59,130,246,.12),inset 0 1px 0 rgba(255,255,255,.06);
}
.la.act::before{
  content:'';position:absolute;left:0;top:25%;width:3px;height:50%;
  background:linear-gradient(180deg,var(--blue),var(--cyan));
  border-radius:0 2px 2px 0;box-shadow:0 0 8px rgba(59,130,246,.6);
}
.la-ic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;
  justify-content:center;font-size:15px;flex-shrink:0;
  background:rgba(255,255,255,.04);border:1px solid var(--border);transition:all .18s}
.la.act .la-ic{background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(6,182,212,.15));border-color:rgba(59,130,246,.35)}
.sb-footer{padding:14px 10px;border-top:1px solid var(--border)}
.sb-user{
  display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--r-md);
  background:rgba(255,255,255,.03);border:1px solid var(--border);cursor:pointer;
  transition:border-color .2s;
}
.sb-user:hover{border-color:var(--border-h)}
.sb-avatar{
  width:32px;height:32px;border-radius:50%;
  background:linear-gradient(135deg,#3B82F6,#A78BFA);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;color:#fff;flex-shrink:0;
}
.sb-uname{font-size:12px;font-weight:600;color:var(--text)}
.sb-urole{font-size:10px;color:var(--text3)}

/* Main area */
.main{flex:1;overflow-y:auto;background:var(--bg0);display:flex;flex-direction:column;min-width:0}
.topbar{
  padding:16px 24px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  background:linear-gradient(180deg,var(--bg1),var(--bg0));
  position:sticky;top:0;z-index:10;backdrop-filter:blur(12px);
}
.topbar-left h1{font-family:var(--f-head);font-size:18px;font-weight:700;color:var(--text)}
.topbar-left p{font-size:12px;color:var(--text3);margin-top:1px}
.content{padding:24px;flex:1;animation:fadeIn .3s ease}

/* KPI Cards */
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px}
.kc{
  background:linear-gradient(135deg,var(--bg2),var(--bg3));
  border:1px solid var(--border);border-radius:var(--r-lg);
  padding:20px;position:relative;overflow:hidden;
  transition:transform .22s,box-shadow .22s;cursor:default;
  --kc-color:#3B82F6;
}
.kc::before{
  content:'';position:absolute;inset:-1px;border-radius:calc(var(--r-lg) + 1px);padding:1px;
  background:linear-gradient(135deg,var(--kc-color,#3B82F6),transparent 60%);
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:0;transition:opacity .22s;pointer-events:none;
}
.kc:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.kc:hover::before{opacity:.65}
.kc-glow{
  position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;
  background:var(--kc-color,#3B82F6);opacity:.08;filter:blur(24px);pointer-events:none;
}
.kc-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
.kc-icon{
  width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:18px;background:rgba(255,255,255,.05);border:1px solid var(--border);
}
.kc-badge{font-size:10px;font-family:var(--f-mono);padding:3px 8px;border-radius:20px;font-weight:500}
.kc-val{font-family:var(--f-head);font-size:30px;font-weight:800;color:var(--text);
  animation:countUp .5s ease;line-height:1.1}
.kc-label{font-size:12px;color:var(--text3);margin-top:4px}
.kc-delta{font-size:11px;font-family:var(--f-mono);margin-top:10px;display:flex;align-items:center;gap:5px}
.kc-bar{height:3px;background:rgba(255,255,255,.07);border-radius:2px;margin-top:10px;overflow:hidden}
.kc-bar-fill{height:100%;border-radius:2px;position:relative;transition:width 1s cubic-bezier(.4,0,.2,1)}
.kc-bar-fill::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,.2) 50%,transparent 80%);
  background-size:200% 100%;animation:shimmer 2s linear infinite;
}

/* Charts */
.charts-row{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:22px}
.chart-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px}
.chart-card h3{font-family:var(--f-head);font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px}
.chart-card p{font-size:11px;color:var(--text3);margin-bottom:16px}

/* Table */
.tbl-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.tbl-head{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.tbl-head h3{font-family:var(--f-head);font-size:13px;font-weight:600;color:var(--text)}
table{width:100%;border-collapse:collapse}
th{padding:10px 16px;font-size:10px;font-family:var(--f-mono);font-weight:500;letter-spacing:.8px;
  text-transform:uppercase;color:var(--text3);text-align:left;border-bottom:1px solid var(--border);
  background:rgba(255,255,255,.015)}
td{padding:13px 16px;font-size:12.5px;color:var(--text2);border-bottom:1px solid var(--border);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.td-name{color:var(--text);font-weight:600;font-size:13px}
.td-id{font-family:var(--f-mono);font-size:11px;color:var(--text3)}

/* Status badges */
.badge{
  display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
  border-radius:20px;font-size:10.5px;font-weight:600;font-family:var(--f-mono);
}
.dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.b-green{background:rgba(16,185,129,.15);color:#34D399;border:1px solid rgba(16,185,129,.25)}
.b-amber{background:rgba(245,158,11,.15);color:#FCD34D;border:1px solid rgba(245,158,11,.25)}
.b-red{background:rgba(239,68,68,.15);color:#FCA5A5;border:1px solid rgba(239,68,68,.25)}
.b-blue{background:rgba(59,130,246,.15);color:#93C5FD;border:1px solid rgba(59,130,246,.25)}
.b-purple{background:rgba(167,139,250,.15);color:#C4B5FD;border:1px solid rgba(167,139,250,.25)}

/* Search & filters */
.search-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:14px 20px;border-bottom:1px solid var(--border)}
.search-wrap{position:relative;flex:1;min-width:220px}
.search-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none}
.search-inp{
  width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-md);
  padding:9px 12px 9px 36px;font-size:13px;color:var(--text);font-family:var(--f-body);
  outline:none;transition:border-color .18s;
}
.search-inp:focus{border-color:rgba(59,130,246,.5);box-shadow:0 0 0 2px rgba(59,130,246,.1)}
.search-inp::placeholder{color:var(--text3)}
.flt{
  padding:8px 14px;border-radius:var(--r-md);border:1px solid var(--border);
  background:var(--bg3);color:var(--text2);font-size:12px;cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:all .18s;font-family:var(--f-body);white-space:nowrap;
}
.flt:hover,.flt.on{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.35);color:#93C5FD}
.flt-cnt{
  background:linear-gradient(135deg,var(--blue),var(--cyan));
  color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px;font-family:var(--f-mono);
}
.filter-pills{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 20px;
  border-bottom:1px solid var(--border);background:rgba(255,255,255,.01)}
.pill{
  padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;transition:all .15s;
  border:1px solid var(--border);color:var(--text3);background:transparent;font-family:var(--f-body);
}
.pill:hover{border-color:var(--border-h);color:var(--text2)}
.pill.on{background:linear-gradient(135deg,rgba(59,130,246,.2),rgba(6,182,212,.1));
  border-color:rgba(59,130,246,.4);color:#93C5FD;font-weight:600}
.result-info{font-size:11px;color:var(--text3);font-family:var(--f-mono);margin-left:auto}

/* Buttons */
.btn{
  padding:9px 18px;border-radius:var(--r-md);font-size:13px;font-weight:600;
  cursor:pointer;transition:all .18s;border:1px solid transparent;font-family:var(--f-body);
  display:inline-flex;align-items:center;gap:7px;
}
.btn-primary{
  background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;border:none;
  box-shadow:0 4px 14px rgba(59,130,246,.3);
}
.btn-primary:hover{box-shadow:0 6px 20px rgba(59,130,246,.45);transform:translateY(-1px)}
.btn-ghost{background:var(--bg3);border-color:var(--border);color:var(--text2)}
.btn-ghost:hover{border-color:var(--border-h);color:var(--text)}
.btn-sm{padding:6px 12px;font-size:11.5px}
.btn-danger{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#FCA5A5}
.btn-danger:hover{background:rgba(239,68,68,.25)}

/* Cards misc */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;margin-bottom:14px}
.card-title{font-family:var(--f-head);font-size:14px;font-weight:600;color:var(--text);margin-bottom:14px}
.section-label{
  font-family:var(--f-mono);font-size:9.5px;letter-spacing:1.4px;font-weight:500;
  text-transform:uppercase;color:var(--text3);margin-bottom:12px;
  display:flex;align-items:center;gap:8px;
}
.section-label::after{content:'';flex:1;height:1px;background:var(--border)}

/* Progress bar */
.pbar{height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;position:relative}
.pbar-fill{height:100%;border-radius:3px;position:relative;transition:width 1s cubic-bezier(.4,0,.2,1)}
.pbar-fill::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,.18) 50%,transparent 80%);
  background-size:200% 100%;animation:shimmer 2s linear infinite;
}

/* Login page */
.login-bg{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 20% 50%,rgba(59,130,246,.08) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 20%,rgba(6,182,212,.06) 0%,transparent 50%),
             var(--bg0);
  position:relative;overflow:hidden;
}
.login-orb1{
  position:absolute;width:500px;height:500px;border-radius:50%;
  background:radial-gradient(circle,rgba(59,130,246,.12),transparent 70%);
  top:-100px;left:-150px;pointer-events:none;animation:float 8s ease-in-out infinite;
}
.login-orb2{
  position:absolute;width:400px;height:400px;border-radius:50%;
  background:radial-gradient(circle,rgba(6,182,212,.08),transparent 70%);
  bottom:-80px;right:-100px;pointer-events:none;animation:float 10s ease-in-out infinite reverse;
}
.login-card{
  width:420px;max-width:calc(100vw - 40px);
  background:linear-gradient(135deg,rgba(11,20,35,.95),rgba(7,13,26,.98));
  border:1px solid rgba(59,130,246,.2);border-radius:24px;padding:40px;
  box-shadow:0 24px 64px rgba(0,0,0,.6),0 0 0 1px rgba(59,130,246,.08),inset 0 1px 0 rgba(255,255,255,.06);
  animation:fadeIn .5s ease;position:relative;z-index:2;
}
.login-logo{
  width:52px;height:52px;border-radius:15px;margin:0 auto 20px;
  background:linear-gradient(135deg,#3B82F6,#06B6D4);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--f-head);font-size:20px;font-weight:800;color:#fff;
  box-shadow:0 8px 32px rgba(59,130,246,.45);
}
.login-h1{font-family:var(--f-head);font-size:24px;font-weight:800;text-align:center;
  background:linear-gradient(135deg,#DDE6F5,#94A3B8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.login-sub{font-size:12.5px;color:var(--text3);text-align:center;margin-top:6px;margin-bottom:28px}
.form-group{margin-bottom:16px}
.form-label{font-size:11px;font-family:var(--f-mono);letter-spacing:.8px;font-weight:500;
  color:var(--text3);text-transform:uppercase;margin-bottom:7px;display:block}
.form-inp{
  width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:var(--r-md);padding:12px 14px;font-size:13.5px;color:var(--text);
  font-family:var(--f-body);outline:none;transition:all .2s;
}
.form-inp:focus{border-color:rgba(59,130,246,.5);background:rgba(59,130,246,.06);
  box-shadow:0 0 0 3px rgba(59,130,246,.12)}
.form-inp::placeholder{color:var(--text3)}
.login-btn{
  width:100%;padding:13px;border-radius:var(--r-md);border:none;cursor:pointer;
  background:linear-gradient(135deg,#3B82F6,#06B6D4);
  font-family:var(--f-head);font-size:14px;font-weight:700;color:#fff;
  box-shadow:0 6px 24px rgba(59,130,246,.4);transition:all .2s;margin-top:8px;
}
.login-btn:hover{box-shadow:0 8px 32px rgba(59,130,246,.55);transform:translateY(-1px)}
.login-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.login-err{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);
  border-radius:var(--r-md);padding:10px 14px;font-size:12px;color:#FCA5A5;margin-top:12px}
.login-footer{text-align:center;font-size:11px;color:var(--text3);margin-top:24px}
.login-footer strong{color:var(--blue)}

/* Activity feed */
.activity-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.activity-item:last-child{border-bottom:none}
.act-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;animation:pulseRing 2s infinite}
.act-text{font-size:12.5px;color:var(--text2);flex:1;line-height:1.5}
.act-time{font-size:10.5px;color:var(--text3);font-family:var(--f-mono);white-space:nowrap}

/* Tags */
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;
  font-size:10px;font-family:var(--f-mono);font-weight:500}
.tag-blue{background:rgba(59,130,246,.15);color:#93C5FD}
.tag-green{background:rgba(16,185,129,.15);color:#6EE7B7}
.tag-amber{background:rgba(245,158,11,.15);color:#FCD34D}
.tag-purple{background:rgba(167,139,250,.15);color:#C4B5FD}

/* Modal */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;
  animation:fadeIn .2s ease;
}
.modal{
  background:linear-gradient(135deg,var(--bg2),var(--bg3));
  border:1px solid var(--border-glow);border-radius:20px;width:560px;max-width:100%;
  max-height:85vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.7);
  animation:slideLeft .25s ease;
}
.modal-header{padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.modal-header h2{font-family:var(--f-head);font-size:16px;font-weight:700;color:var(--text)}
.modal-body{padding:24px}
.modal-close{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:transparent;
  color:var(--text2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px}
.modal-close:hover{background:rgba(255,255,255,.06);color:var(--text)}

/* Journey steps */
.journey{display:flex;flex-direction:column;gap:0}
.j-step{display:flex;gap:14px;position:relative}
.j-step:not(:last-child) .j-line{position:absolute;left:15px;top:32px;bottom:-4px;width:2px;
  background:linear-gradient(180deg,var(--blue),transparent)}
.j-num{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;font-family:var(--f-mono);border:2px solid}
.j-done{background:rgba(16,185,129,.15);border-color:var(--green);color:#6EE7B7}
.j-active{background:rgba(59,130,246,.15);border-color:var(--blue);color:#93C5FD}
.j-todo{background:rgba(255,255,255,.03);border-color:var(--border);color:var(--text3)}
.j-content{padding-bottom:18px}
.j-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px}
.j-desc{font-size:11.5px;color:var(--text3)}
.j-date{font-size:10px;font-family:var(--f-mono);color:var(--text3);margin-top:4px}

/* Platform card */
.plt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}
.plt-card{
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;
  transition:all .22s;cursor:pointer;position:relative;overflow:hidden;
}
.plt-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--plt-color,#3B82F6),transparent);opacity:.5;
}
.plt-card:hover{border-color:var(--border-h);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.3)}
.plt-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.plt-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:18px;background:rgba(255,255,255,.05);border:1px solid var(--border)}
.plt-name{font-family:var(--f-head);font-size:14px;font-weight:700;color:var(--text);margin-top:8px}
.plt-org{font-size:11.5px;color:var(--text3);margin-top:2px}
.plt-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px}
.plt-stat{text-align:center;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:8px}
.plt-stat-val{font-family:var(--f-head);font-size:17px;font-weight:700;color:var(--text)}
.plt-stat-label{font-size:9px;font-family:var(--f-mono);color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-top:2px}
.plt-bar-wrap{margin-top:12px}
.plt-bar-label{display:flex;justify-content:space-between;font-size:10.5px;color:var(--text3);margin-bottom:5px}

/* Messages */
.msg-layout{display:grid;grid-template-columns:280px 1fr;height:calc(100vh - 120px);gap:0;
  background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.msg-list{border-right:1px solid var(--border);overflow-y:auto}
.msg-item{padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background .15s}
.msg-item:hover{background:rgba(255,255,255,.03)}
.msg-item.active{background:rgba(59,130,246,.08)}
.msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.msg-name{font-size:13px;font-weight:600;color:var(--text)}
.msg-preview{font-size:11.5px;color:var(--text3);margin-top:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.msg-time{font-size:10px;font-family:var(--f-mono);color:var(--text3)}
.msg-unread{width:8px;height:8px;border-radius:50%;background:var(--blue);flex-shrink:0}
.msg-pane{display:flex;flex-direction:column}
.msg-pane-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px}
.msg-pane-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px}
.bubble{max-width:65%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.55}
.bubble-out{
  background:linear-gradient(135deg,rgba(59,130,246,.25),rgba(6,182,212,.15));
  border:1px solid rgba(59,130,246,.3);color:var(--text);align-self:flex-end;border-radius:14px 14px 2px 14px;
}
.bubble-in{background:var(--bg3);border:1px solid var(--border);color:var(--text2);align-self:flex-start;border-radius:14px 14px 14px 2px}
.bubble-time{font-size:10px;font-family:var(--f-mono);color:var(--text3);margin-top:4px;text-align:right}
.msg-input-row{padding:14px 16px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center}
.msg-inp{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r-md);
  padding:10px 14px;color:var(--text);font-size:13px;font-family:var(--f-body);outline:none}
.msg-inp:focus{border-color:rgba(59,130,246,.4)}

/* Reports */
.report-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.metric-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)}
.metric-row:last-child{border-bottom:none}
.metric-name{font-size:12.5px;color:var(--text2)}
.metric-val{font-size:13px;font-weight:700;color:var(--text);font-family:var(--f-mono)}

/* Empty state */
.empty{text-align:center;padding:48px 20px;color:var(--text3)}
.empty-icon{font-size:40px;margin-bottom:12px;opacity:.4}
.empty-text{font-size:13px}

/* Tooltip custom */
.ct{background:var(--bg2)!important;border:1px solid var(--border)!important;border-radius:10px!important;
  padding:10px 14px!important;box-shadow:0 8px 24px rgba(0,0,0,.4)!important}
.ct-label{font-family:var(--f-mono);font-size:10px;color:var(--text3);margin-bottom:5px}
.ct-val{font-family:var(--f-head);font-size:16px;font-weight:700;color:var(--text)}

/* Programs */
.prog-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px;margin-bottom:14px;
  transition:border-color .2s}
.prog-card:hover{border-color:var(--border-h)}
.prog-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.prog-title{font-family:var(--f-head);font-size:15px;font-weight:700;color:var(--text)}
.prog-sub{font-size:12px;color:var(--text3);margin-top:2px}
.prog-phase{font-size:11px;color:var(--text3);font-family:var(--f-mono)}
.prog-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}
.prog-stat{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center}
.prog-stat-val{font-family:var(--f-head);font-size:20px;font-weight:700;color:var(--text)}
.prog-stat-label{font-size:9.5px;font-family:var(--f-mono);color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-top:3px}

/* Responsive */
@media(max-width:1024px){
  .kpi-grid{grid-template-columns:repeat(2,1fr)}
  .charts-row{grid-template-columns:1fr}
  .msg-layout{grid-template-columns:1fr}
  .msg-list{display:none}
  .report-grid{grid-template-columns:1fr}
}
@media(max-width:768px){
  .sb{display:none}
  .kpi-grid{grid-template-columns:1fr}
  .content{padding:14px}
  .plt-grid{grid-template-columns:1fr}
}
`;

function G() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />;
}

/* ── Data constants ──────────────────────────────────────────── */
const PLATFORMS = [
  {
    id:"PLT-001",name:"Hub Jeunes Agadir",org:"Fondation Hassan II",region:"Souss-Massa",
    icon:"🏛️",color:"#3B82F6",status:"active",
    beneficiaries:312,sessions:48,satisfaction:92,capacity:400,
    sync:"Aujourd'hui 09:41",syncStatus:"ok",programs:3,
    coords:{lat:30.43,lng:-9.6}
  },
  {
    id:"PLT-002",name:"Centre Ryad Casa",org:"INDH Casablanca",region:"Casablanca-Settat",
    icon:"🌆",color:"#10B981",status:"active",
    beneficiaries:287,sessions:61,satisfaction:88,capacity:350,
    sync:"Hier 23:12",syncStatus:"ok",programs:4,
    coords:{lat:33.59,lng:-7.61}
  },
  {
    id:"PLT-003",name:"Espace Fès Médina",org:"Commune Fès",region:"Fès-Meknès",
    icon:"🕌",color:"#F59E0B",status:"warning",
    beneficiaries:198,sessions:29,satisfaction:79,capacity:250,
    sync:"Il y a 3j",syncStatus:"warn",programs:2,
    coords:{lat:34.03,lng:-5.0}
  },
  {
    id:"PLT-004",name:"Hub Marrakech Sud",org:"Région Marrakech-Safi",region:"Marrakech-Safi",
    icon:"🌹",color:"#EF4444",status:"active",
    beneficiaries:445,sessions:72,satisfaction:94,capacity:500,
    sync:"Aujourd'hui 11:02",syncStatus:"ok",programs:5,
    coords:{lat:31.63,lng:-8.0}
  },
  {
    id:"PLT-005",name:"Point Jeunes Rabat",org:"Mairie Rabat",region:"Rabat-Salé-Kénitra",
    icon:"🏛️",color:"#A78BFA",status:"inactive",
    beneficiaries:89,sessions:12,satisfaction:71,capacity:200,
    sync:"Il y a 7j",syncStatus:"error",programs:1,
    coords:{lat:33.97,lng:-6.85}
  },
  {
    id:"PLT-006",name:"Centre Atlas Beni Mellal",org:"Province Beni Mellal",region:"Béni Mellal-Khénifra",
    icon:"⛰️",color:"#06B6D4",status:"active",
    beneficiaries:176,sessions:38,satisfaction:85,capacity:220,
    sync:"Aujourd'hui 08:15",syncStatus:"ok",programs:3,
    coords:{lat:32.34,lng:-6.34}
  },
  {
    id:"PLT-007",name:"Espace Rural Ouarzazate",org:"INDH Ouarzazate",region:"Drâa-Tafilalet",
    icon:"🏜️",color:"#F472B6",status:"warning",
    beneficiaries:134,sessions:21,satisfaction:76,capacity:180,
    sync:"Il y a 2j",syncStatus:"warn",programs:2,
    coords:{lat:30.92,lng:-6.9}
  },
  {
    id:"PLT-008",name:"Hub Digital Tanger",org:"Tanger-Tetouan-Al Hoceima",region:"Tanger-Tétouan-Al Hoceïma",
    icon:"💻",color:"#34D399",status:"active",
    beneficiaries:268,sessions:55,satisfaction:91,capacity:320,
    sync:"Aujourd'hui 10:30",syncStatus:"ok",programs:4,
    coords:{lat:35.77,lng:-5.8}
  },
];

const BENEFICIARIES = [
  {id:"YTR-2847",name:"Fatima Zahra Moussaoui",age:22,gender:"F",platform:"Hub Jeunes Agadir",platId:"PLT-001",region:"Souss-Massa",program:"SKL",status:"active",enrolled:"12 Jan 2026",lastSeen:"Aujourd'hui",score:87,step:3},
  {id:"YTR-2848",name:"Youssef Alami",age:25,gender:"M",platform:"Centre Ryad Casa",platId:"PLT-002",region:"Casablanca-Settat",program:"LDR",status:"active",enrolled:"8 Jan 2026",lastSeen:"Hier",score:72,step:2},
  {id:"YTR-2849",name:"Amira Benali",age:19,gender:"F",platform:"Hub Marrakech Sud",platId:"PLT-004",region:"Marrakech-Safi",program:"ENT",status:"graduated",enrolled:"3 Nov 2025",lastSeen:"15 Fév 2026",score:95,step:5},
  {id:"YTR-2850",name:"Rachid Outtaleb",age:28,gender:"M",platform:"Espace Fès Médina",platId:"PLT-003",region:"Fès-Meknès",program:"SKL",status:"at_risk",enrolled:"20 Déc 2025",lastSeen:"Il y a 9j",score:48,step:1},
  {id:"YTR-2851",name:"Salma Cherkaoui",age:23,gender:"F",platform:"Point Jeunes Rabat",platId:"PLT-005",region:"Rabat-Salé-Kénitra",program:"LDR",status:"inactive",enrolled:"15 Oct 2025",lastSeen:"Il y a 14j",score:61,step:2},
  {id:"YTR-2852",name:"Karim Bouazzaoui",age:21,gender:"M",platform:"Hub Jeunes Agadir",platId:"PLT-001",region:"Souss-Massa",program:"ENT",status:"active",enrolled:"5 Fév 2026",lastSeen:"Aujourd'hui",score:83,step:2},
  {id:"YTR-2853",name:"Hind Tazi",age:24,gender:"F",platform:"Centre Atlas Beni Mellal",platId:"PLT-006",region:"Béni Mellal-Khénifra",program:"SKL",status:"active",enrolled:"18 Jan 2026",lastSeen:"Hier",score:79,step:3},
  {id:"YTR-2854",name:"Omar Soussi",age:26,gender:"M",platform:"Hub Digital Tanger",platId:"PLT-008",region:"Tanger-Tétouan-Al Hoceïma",program:"LDR",status:"graduated",enrolled:"10 Sep 2025",lastSeen:"2 Mar 2026",score:91,step:5},
  {id:"YTR-2855",name:"Nadia Ferhat",age:20,gender:"F",platform:"Hub Marrakech Sud",platId:"PLT-004",region:"Marrakech-Safi",program:"SKL",status:"active",enrolled:"14 Jan 2026",lastSeen:"Aujourd'hui",score:76,step:2},
  {id:"YTR-2856",name:"Mehdi Bakkali",age:27,gender:"M",platform:"Centre Ryad Casa",platId:"PLT-002",region:"Casablanca-Settat",program:"ENT",status:"at_risk",enrolled:"22 Nov 2025",lastSeen:"Il y a 6j",score:54,step:1},
  {id:"YTR-2857",name:"Zineb Mouhtadi",age:22,gender:"F",platform:"Espace Rural Ouarzazate",platId:"PLT-007",region:"Drâa-Tafilalet",program:"LDR",status:"active",enrolled:"9 Fév 2026",lastSeen:"Hier",score:68,step:2},
  {id:"YTR-2858",name:"Anas Berrada",age:24,gender:"M",platform:"Hub Digital Tanger",platId:"PLT-008",region:"Tanger-Tétouan-Al Hoceïma",program:"SKL",status:"active",enrolled:"1 Mar 2026",lastSeen:"Aujourd'hui",score:82,step:2},
];

const TREND_DATA = [
  {month:"Oct",beneficiaires:1124,sessions:312,satisfaction:81},
  {month:"Nov",beneficiaires:1298,sessions:376,satisfaction:83},
  {month:"Déc",beneficiaires:1187,sessions:298,satisfaction:80},
  {month:"Jan",beneficiaires:1456,sessions:441,satisfaction:85},
  {month:"Fév",beneficiaires:1623,sessions:512,satisfaction:87},
  {month:"Mar",beneficiaires:1909,sessions:587,satisfaction:89},
];

const PROG_DATA = [
  {name:"SKL",val:42},
  {name:"LDR",val:33},
  {name:"ENT",val:25},
];

const GENDER_DATA = [
  {name:"Femmes",val:58,color:"#A78BFA"},
  {name:"Hommes",val:42,color:"#3B82F6"},
];

const OUTCOME_DATA = [
  {cat:"Emploi CDI",val:23},
  {cat:"Auto-emploi",val:18},
  {cat:"Formation sup.",val:31},
  {cat:"Bénévolat",val:12},
  {cat:"En recherche",val:16},
];

const KPI = [
  {icon:"👥",label:"Bénéficiaires actifs",val:"1 909",delta:"+14.3%",positive:true,color:"#3B82F6",pct:76,unit:"/ 2 520"},
  {icon:"🏛️",label:"Plateformes actives",val:"6 / 8",delta:"+1 ce mois",positive:true,color:"#10B981",pct:75,unit:"plateformes"},
  {icon:"📅",label:"Sessions ce mois",val:"587",delta:"+13.8%",positive:true,color:"#06B6D4",pct:82,unit:"sessions"},
  {icon:"⭐",label:"Satisfaction moyenne",val:"89%",delta:"+2 pts",positive:true,color:"#F59E0B",pct:89,unit:"/ 100"},
  {icon:"🎓",label:"Diplômés 2026",val:"148",delta:"+31 ce mois",positive:true,color:"#A78BFA",pct:60,unit:"/ 250 objectif"},
  {icon:"⚠️",label:"Jeunes à risque",val:"23",delta:"-5 ce mois",positive:false,color:"#EF4444",pct:23,unit:"signalés"},
];

const ACTIVITY = [
  {color:"#10B981",text:"YTR-2849 Amira Benali a complété le programme ENT — diplômée avec mention","time":"Il y a 12 min"},
  {color:"#3B82F6",text:"Nouvelle synchronisation Hub Digital Tanger — 12 sessions ajoutées","time":"Il y a 1h"},
  {color:"#F59E0B",text:"Alerte : PLT-003 Espace Fès Médina — synchronisation en retard (3 jours)","time":"Il y a 2h"},
  {color:"#A78BFA",text:"Programme LDR — session #47 planifiée pour demain à 10h00","time":"Il y a 3h"},
  {color:"#EF4444",text:"YTR-2850 Rachid Outtaleb marqué à risque — absence 9 jours","time":"Il y a 5h"},
];

const NAV = [
  {id:"dashboard",label:"Tableau de bord",icon:"📊"},
  {id:"platforms",label:"Plateformes",icon:"🏛️"},
  {id:"beneficiaries",label:"Bénéficiaires",icon:"👥"},
  {id:"programs",label:"Programmes",icon:"🎓"},
  {id:"messages",label:"Messages",icon:"💬"},
  {id:"reports",label:"Rapports",icon:"📈"},
];

const PROGS = [
  {
    id:"SKL",name:"SkillUp Maroc",abbr:"SKL",color:"#3B82F6",
    desc:"Développement des compétences numériques et professionnelles pour les 18-30 ans",
    phase:"Phase 3",duration:"6 mois",
    enrolled:42,active:38,graduated:148,target:250,
    satisfaction:88,completion:76,
    modules:["Compétences numériques","Bureautique avancée","Langues professionnelles","Communication"],
    tags:["tag-blue"],
  },
  {
    id:"LDR",name:"Jeunes Leaders INDH",abbr:"LDR",color:"#A78BFA",
    desc:"Programme de leadership et citoyenneté active pour jeunes porteurs de projets",
    phase:"Phase 2",duration:"4 mois",
    enrolled:33,active:31,graduated:89,target:150,
    satisfaction:91,completion:80,
    modules:["Leadership participatif","Gestion de projet","Communication publique","Entrepreneuriat social"],
    tags:["tag-purple"],
  },
  {
    id:"ENT",name:"Entreprendre Ensemble",abbr:"ENT",color:"#10B981",
    desc:"Accompagnement entrepreneurial : de l'idée au financement INDH",
    phase:"Phase 4",duration:"8 mois",
    enrolled:25,active:24,graduated:61,target:100,
    satisfaction:93,completion:84,
    modules:["Idéation & Business Model","Étude de marché","Finance & Budget","Pitch INDH"],
    tags:["tag-green"],
  },
];

const SENT_MSGS = [
  {id:1,from:"Coordinateur Agadir",initials:"CA",color:"#3B82F6",preview:"Rapport mensuel PLT-001 envoyé",time:"10:32",unread:2,
    conv:[
      {out:false,text:"Bonjour, le rapport mensuel pour PLT-001 est disponible.",time:"10:30"},
      {out:true,text:"Merci, je vais le consulter. Quelques points à discuter ?",time:"10:31"},
      {out:false,text:"Oui, en particulier la baisse de présence semaine 3.",time:"10:32"},
    ]},
  {id:2,from:"Hub Marrakech Sud",initials:"MS",color:"#EF4444",preview:"Demande de ressources supplémentaires",time:"09:18",unread:0,
    conv:[
      {out:false,text:"Nous avons besoin de 2 formateurs supplémentaires pour le mois de Mars.",time:"09:15"},
      {out:true,text:"Demande notée, je transmets à la direction régionale.",time:"09:18"},
    ]},
  {id:3,from:"INDH Central",initials:"IC",color:"#10B981",preview:"Réunion nationale jeudi 10h",time:"Hier",unread:1,
    conv:[
      {out:false,text:"La réunion nationale de coordination est planifiée jeudi à 10h00 en visio.",time:"Hier 14:00"},
    ]},
  {id:4,from:"Coordinateur Tanger",initials:"CT",color:"#A78BFA",preview:"Hub Digital : excellent taux",time:"Lun",unread:0,
    conv:[
      {out:false,text:"Excellent mois ! Taux de satisfaction à 91%, record pour notre plateforme.",time:"Lun 16:44"},
      {out:true,text:"Félicitations à toute l'équipe, continuez comme ça !",time:"Lun 17:02"},
    ]},
];

const STATUS_CFG = {
  active:{label:"Actif",cls:"b-green"},
  warning:{label:"Attention",cls:"b-amber"},
  inactive:{label:"Inactif",cls:"b-red"},
  graduated:{label:"Diplômé",cls:"b-blue"},
  at_risk:{label:"À risque",cls:"b-red"},
};

const SYNC_CFG = {
  ok:{icon:"✓",cls:"b-green"},
  warn:{icon:"⚠",cls:"b-amber"},
  error:{icon:"✗",cls:"b-red"},
};

const JOURNEY_STEPS = [
  {label:"Inscription & diagnostic",desc:"Évaluation des compétences initiales","date":"Semaine 1"},
  {label:"Formation socle",desc:"Modules de base et compétences transversales","date":"Semaines 2-4"},
  {label:"Ateliers pratiques",desc:"Mise en situation et projets collectifs","date":"Semaines 5-10"},
  {label:"Projet personnel",desc:"Développement et suivi individuel","date":"Semaines 11-16"},
  {label:"Certification & insertion",desc:"Évaluation finale et accompagnement","date":"Semaine 20"},
];

/* ── Utility hooks ──────────────────────────────────────────── */
function useDebounce(value, delay = 300) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ── Shared components ──────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || {label:status,cls:"b-blue"};
  const dot = status === "active" || status === "graduated" ? "#10B981"
    : status === "at_risk" ? "#EF4444"
    : status === "inactive" ? "#94A3B8" : "#F59E0B";
  return (
    <span className={`badge ${cfg.cls}`}>
      <span className="dot" style={{ background: dot }} />
      {cfg.label}
    </span>
  );
}

function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

function PBar({ pct, color = "#3B82F6", height = 5 }) {
  return (
    <div className="pbar" style={{ height }}>
      <div
        className="pbar-fill"
        style={{
          width: `${Math.min(pct, 100)}%`,
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
        }}
      />
    </div>
  );
}

function CT({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ct">
      <div className="ct-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontFamily: "var(--f-mono)", fontSize: 13 }}>
          {p.name}: <strong style={{ color: "var(--text)" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function TopBar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--text3)" }}>
          {new Date().toLocaleDateString("fr-MA", { weekday: "long", day: "2-digit", month: "long" })}
        </span>
        <button className="btn btn-ghost btn-sm">🔔</button>
        <button className="btn btn-ghost btn-sm">⚙️</button>
      </div>
    </div>
  );
}

/* ── Logo ───────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className="sb-logo-mark">XT</div>
      <div>
        <div className="sb-logo-txt">X-Track</div>
        <div className="sb-logo-sub">v2.4 · INDH 2026</div>
      </div>
    </div>
  );
}

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar({ active, setActive, onLogout }) {
  return (
    <aside className="sb">
      <div className="sb-logo">
        <Logo />
      </div>
      <div className="sb-nav">
        <div className="sb-section">Navigation</div>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`la ${active === n.id ? "act" : ""}`}
            onClick={() => setActive(n.id)}
          >
            <div className="la-ic">{n.icon}</div>
            {n.label}
          </div>
        ))}
      </div>
      <div className="sb-footer">
        <div className="sb-user" onClick={onLogout} title="Déconnexion">
          <div className="sb-avatar">A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-uname">Admin INDH</div>
            <div className="sb-urole">Administrateur national</div>
          </div>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>↗</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Login Page ─────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (email === "admin@xtrack.ma" && pass === "xtrack2026") {
      onLogin({ name: "Admin INDH", role: "admin" });
    } else {
      setErr("Identifiants incorrects. Vérifiez votre e-mail et mot de passe.");
    }
    setLoading(false);
  }, [email, pass, onLogin]);

  return (
    <div className="login-bg">
      <div className="login-orb1" />
      <div className="login-orb2" />

      {/* Animated grid lines */}
      <div style={{ position: "absolute", inset: 0, opacity: .03, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(59,130,246,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.6) 1px,transparent 1px)",
        backgroundSize: "60px 60px" }} />

      <div className="login-card">
        <div className="login-logo">XT</div>
        <h1 className="login-h1">X-Track</h1>
        <p className="login-sub">Plateforme de suivi INDH · Espace sécurisé</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adresse e-mail</label>
            <input
              className="form-inp"
              type="email"
              placeholder="admin@xtrack.ma"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(""); }}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-inp"
              type="password"
              placeholder="••••••••••••"
              value={pass}
              onChange={e => { setPass(e.target.value); setErr(""); }}
              autoComplete="current-password"
              required
            />
          </div>
          {err && <div className="login-err">⚠ {err}</div>}
          <button className="login-btn" type="submit" disabled={loading || !email || !pass}>
            {loading ? "Vérification…" : "Accéder au tableau de bord →"}
          </button>
        </form>

        <div className="login-footer">
          <strong>INDH · Initiative Nationale pour le Développement Humain</strong>
          <br />Système de suivi des plateformes jeunesse — Maroc 2026
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Page ─────────────────────────────────────────── */
function DashboardPage() {
  return (
    <div className="main">
      <TopBar title="Tableau de bord" subtitle="Vue d'ensemble des plateformes INDH · Mars 2026" />
      <div className="content">
        <SectionLabel>Indicateurs clés</SectionLabel>
        <div className="kpi-grid">
          {KPI.map((k, i) => (
            <div key={i} className="kc" style={{ "--kc-color": k.color }}>
              <div className="kc-glow" style={{ background: k.color }} />
              <div className="kc-header">
                <div className="kc-icon">{k.icon}</div>
                <span
                  className="kc-badge"
                  style={{
                    background: `${k.color}22`,
                    color: k.color,
                    border: `1px solid ${k.color}44`,
                  }}
                >
                  {k.delta}
                </span>
              </div>
              <div className="kc-val">{k.val}</div>
              <div className="kc-label">{k.label}</div>
              <div className="kc-delta" style={{ color: k.positive ? "#10B981" : "#EF4444" }}>
                <span>{k.positive ? "↑" : "↓"}</span>
                <span style={{ color: "var(--text3)" }}>{k.unit}</span>
              </div>
              <div className="kc-bar">
                <div
                  className="kc-bar-fill"
                  style={{
                    width: `${k.pct}%`,
                    background: `linear-gradient(90deg, ${k.color}, ${k.color}88)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="charts-row">
          {/* Trend chart */}
          <div className="chart-card">
            <h3>Évolution mensuelle</h3>
            <p>Bénéficiaires, sessions et satisfaction — 6 derniers mois</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#4B6080", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4B6080", fontSize: 10, fontFamily: "DM Mono" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CT />} />
                <Area type="monotone" dataKey="beneficiaires" name="Bénéficiaires" stroke="#3B82F6" strokeWidth={2} fill="url(#gBlue)" />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#06B6D4" strokeWidth={2} fill="url(#gCyan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="chart-card">
            <h3>Répartition programmes</h3>
            <p>Distribution des bénéficiaires</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={PROG_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                  dataKey="val" paddingAngle={3} stroke="none">
                  {PROG_DATA.map((_, i) => (
                    <Cell key={i} fill={["#3B82F6","#A78BFA","#10B981"][i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            {PROG_DATA.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ["#3B82F6","#A78BFA","#10B981"][i], flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: "var(--text2)", flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11.5, fontFamily: "var(--f-mono)", color: "var(--text)" }}>{p.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <SectionLabel>Activité récente</SectionLabel>
        <div className="card">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="activity-item">
              <div className="act-dot" style={{ background: a.color }} />
              <div className="act-text">{a.text}</div>
              <div className="act-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Platforms Page ─────────────────────────────────────────── */
function PlatformsPage() {
  const [search, setSearch] = useState("");
  const [statusFlt, setStatusFlt] = useState("");
  const dSearch = useDebounce(search);

  const filtered = useMemo(() => {
    const q = dSearch.toLowerCase().trim();
    return PLATFORMS.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
        || p.org.toLowerCase().includes(q) || p.region.toLowerCase().includes(q);
      const matchStatus = !statusFlt || p.status === statusFlt;
      return matchSearch && matchStatus;
    });
  }, [dSearch, statusFlt]);

  const statuses = useMemo(() => [...new Set(PLATFORMS.map(p => p.status))], []);

  return (
    <div className="main">
      <TopBar title="Plateformes" subtitle={`${PLATFORMS.length} plateformes · ${PLATFORMS.filter(p=>p.status==="active").length} actives`} />
      <div className="content">
        <div className="search-row">
          <div className="search-wrap">
            <span className="search-ic">🔍</span>
            <input
              className="search-inp"
              placeholder="Rechercher par nom, ID, organisation, région…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {statuses.map(s => (
              <button key={s} className={`flt ${statusFlt === s ? "on" : ""}`}
                onClick={() => setStatusFlt(statusFlt === s ? "" : s)}>
                {STATUS_CFG[s]?.label || s}
                {statusFlt === s && <span className="flt-cnt">{filtered.length}</span>}
              </button>
            ))}
          </div>
          <div className="result-info">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🏛️</div>
            <div className="empty-text">Aucune plateforme ne correspond à votre recherche</div>
          </div>
        ) : (
          <div className="plt-grid" style={{ marginTop: 14 }}>
            {filtered.map(p => {
              const syncCfg = SYNC_CFG[p.syncStatus];
              return (
                <div key={p.id} className="plt-card" style={{ "--plt-color": p.color }}>
                  <div className="plt-header">
                    <div className="plt-icon" style={{ borderColor: `${p.color}33` }}>{p.icon}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <StatusBadge status={p.status} />
                      <span className={`badge ${syncCfg.cls}`} style={{ fontSize: 10 }}>{syncCfg.icon}</span>
                    </div>
                  </div>
                  <div className="plt-name">{p.name}</div>
                  <div className="plt-org">{p.org}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontFamily: "var(--f-mono)" }}>
                    {p.id} · {p.region}
                  </div>

                  <div className="plt-stats">
                    <div className="plt-stat">
                      <div className="plt-stat-val" style={{ color: p.color }}>{p.beneficiaries}</div>
                      <div className="plt-stat-label">Bénéf.</div>
                    </div>
                    <div className="plt-stat">
                      <div className="plt-stat-val">{p.sessions}</div>
                      <div className="plt-stat-label">Sessions</div>
                    </div>
                    <div className="plt-stat">
                      <div className="plt-stat-val">{p.satisfaction}%</div>
                      <div className="plt-stat-label">Satisf.</div>
                    </div>
                  </div>

                  <div className="plt-bar-wrap">
                    <div className="plt-bar-label">
                      <span>Capacité</span>
                      <span>{Math.round((p.beneficiaries / p.capacity) * 100)}%</span>
                    </div>
                    <PBar pct={(p.beneficiaries / p.capacity) * 100} color={p.color} />
                  </div>

                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--f-mono)" }}>
                      Sync: {p.sync}
                    </span>
                    <button className="btn btn-ghost btn-sm">Détails →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Journey Modal ──────────────────────────────────────────── */
function JourneyModal({ beneficiary, onClose }) {
  if (!beneficiary) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{beneficiary.name}</h2>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>
              {beneficiary.id} · {beneficiary.platform} · Programme {beneficiary.program}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div className="prog-stat">
              <div className="prog-stat-val" style={{ color: "#3B82F6" }}>{beneficiary.score}</div>
              <div className="prog-stat-label">Score</div>
            </div>
            <div className="prog-stat">
              <div className="prog-stat-val">{beneficiary.step}/5</div>
              <div className="prog-stat-label">Étape</div>
            </div>
            <div className="prog-stat">
              <StatusBadge status={beneficiary.status} />
              <div className="prog-stat-label" style={{ marginTop: 4 }}>Statut</div>
            </div>
          </div>

          <PBar pct={(beneficiary.step / 5) * 100} color="#3B82F6" height={6} />
          <div style={{ marginTop: 4, fontSize: 10, color: "var(--text3)", fontFamily: "var(--f-mono)", marginBottom: 18 }}>
            Progression : {Math.round((beneficiary.step / 5) * 100)}%
          </div>

          <SectionLabel>Parcours de formation</SectionLabel>
          <div className="journey">
            {JOURNEY_STEPS.map((step, i) => {
              const isDone = i < beneficiary.step;
              const isActive = i === beneficiary.step - 1;
              return (
                <div key={i} className="j-step">
                  <div className="j-line" />
                  <div className={`j-num ${isDone ? "j-done" : isActive ? "j-active" : "j-todo"}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className="j-content">
                    <div className="j-title" style={{ color: isDone ? "var(--green)" : isActive ? "var(--blue)" : "var(--text2)" }}>
                      {step.label}
                    </div>
                    <div className="j-desc">{step.desc}</div>
                    <div className="j-date">{step.date}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }}>Contacter</button>
            <button className="btn btn-ghost">Rapport complet</button>
            <button className="btn btn-danger btn-sm">Signaler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Beneficiaries Page ─────────────────────────────────────── */
function BeneficiariesPage() {
  const [search, setSearch] = useState("");
  const [statusFlt, setStatusFlt] = useState("");
  const [programFlt, setProgramFlt] = useState("");
  const [platFlt, setPlatFlt] = useState("");
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  const dSearch = useDebounce(search, 250);

  const statuses = useMemo(() => [...new Set(BENEFICIARIES.map(b => b.status))], []);
  const programs = useMemo(() => [...new Set(BENEFICIARIES.map(b => b.program))], []);
  const platforms = useMemo(() => [...new Set(BENEFICIARIES.map(b => b.platform))], []);

  const filtered = useMemo(() => {
    const q = dSearch.toLowerCase().trim();
    return BENEFICIARIES.filter(b => {
      const matchSearch = !q
        || b.name.toLowerCase().includes(q)
        || b.id.toLowerCase().includes(q)
        || b.platform.toLowerCase().includes(q)
        || b.region.toLowerCase().includes(q)
        || b.program.toLowerCase().includes(q)
        || b.status.toLowerCase().includes(q);
      const matchStatus = !statusFlt || b.status === statusFlt;
      const matchProg = !programFlt || b.program === programFlt;
      const matchPlat = !platFlt || b.platform === platFlt;
      return matchSearch && matchStatus && matchProg && matchPlat;
    });
  }, [dSearch, statusFlt, programFlt, platFlt]);

  const hasFilters = statusFlt || programFlt || platFlt;

  const clearFilters = useCallback(() => {
    setStatusFlt("");
    setProgramFlt("");
    setPlatFlt("");
    setSearch("");
    inputRef.current?.focus();
  }, []);

  const statusCounts = useMemo(() =>
    statuses.reduce((acc, s) => ({ ...acc, [s]: BENEFICIARIES.filter(b => b.status === s).length }), {}),
  [statuses]);

  return (
    <div className="main">
      <TopBar
        title="Bénéficiaires"
        subtitle={`${BENEFICIARIES.length} jeunes inscrits · ${BENEFICIARIES.filter(b => b.status === "active").length} actifs`}
      />
      <div className="content" style={{ padding: 0 }}>
        {/* Search bar */}
        <div className="search-row">
          <div className="search-wrap">
            <span className="search-ic">🔍</span>
            <input
              ref={inputRef}
              className="search-inp"
              placeholder="Rechercher par nom, ID, plateforme, programme, région, statut…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 14 }}>
                ✕
              </button>
            )}
          </div>
          <button className="btn btn-primary btn-sm">+ Ajouter</button>
          <button className="btn btn-ghost btn-sm">⬇ Export</button>
          <div className="result-info">{filtered.length} / {BENEFICIARIES.length}</div>
        </div>

        {/* Filter pills */}
        <div className="filter-pills">
          <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--f-mono)", marginRight: 4 }}>Statut :</span>
          {statuses.map(s => (
            <button key={s} className={`pill ${statusFlt === s ? "on" : ""}`}
              onClick={() => setStatusFlt(statusFlt === s ? "" : s)}>
              {STATUS_CFG[s]?.label || s}
              <span style={{ marginLeft: 4, opacity: 0.6 }}>({statusCounts[s]})</span>
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--f-mono)", marginRight: 4 }}>Programme :</span>
          {programs.map(p => (
            <button key={p} className={`pill ${programFlt === p ? "on" : ""}`}
              onClick={() => setProgramFlt(programFlt === p ? "" : p)}>
              {p}
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--f-mono)", marginRight: 4 }}>Plateforme :</span>
          {platforms.slice(0, 4).map(p => (
            <button key={p} className={`pill ${platFlt === p ? "on" : ""}`}
              onClick={() => setPlatFlt(platFlt === p ? "" : p)}>
              {p.replace("Hub ", "").replace("Centre ", "").replace("Espace ", "")}
            </button>
          ))}
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ marginLeft: "auto", fontSize: 11, color: "#EF4444", background: "none",
                border: "1px solid rgba(239,68,68,.3)", borderRadius: 20, padding: "4px 10px",
                cursor: "pointer", fontFamily: "var(--f-body)" }}>
              ✕ Effacer filtres
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ padding: "0 0 24px" }}>
          {filtered.length === 0 ? (
            <div className="empty" style={{ marginTop: 24 }}>
              <div className="empty-icon">👥</div>
              <div className="empty-text">Aucun bénéficiaire ne correspond à votre recherche</div>
              <button onClick={clearFilters}
                className="btn btn-ghost"
                style={{ marginTop: 12 }}>
                Effacer les filtres
              </button>
            </div>
          ) : (
            <table style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Bénéficiaire</th>
                  <th>Plateforme</th>
                  <th>Programme</th>
                  <th>Statut</th>
                  <th>Score</th>
                  <th>Étape</th>
                  <th>Dernière activité</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setSelected(b)}>
                    <td>
                      <div className="td-name">{b.name}</div>
                      <div className="td-id">{b.id} · {b.age} ans · {b.gender}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: "var(--text2)" }}>{b.platform}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--f-mono)" }}>{b.region}</div>
                    </td>
                    <td>
                      <span className={`tag ${b.program === "SKL" ? "tag-blue" : b.program === "LDR" ? "tag-purple" : "tag-green"}`}>
                        {b.program}
                      </span>
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 50 }}>
                          <PBar
                            pct={b.score}
                            color={b.score >= 75 ? "#10B981" : b.score >= 50 ? "#F59E0B" : "#EF4444"}
                            height={4}
                          />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--text)", width: 28, textAlign: "right" }}>
                          {b.score}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 3 }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{
                            width: 8, height: 8, borderRadius: 2,
                            background: n <= b.step ? "#3B82F6" : "rgba(255,255,255,.08)",
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3, fontFamily: "var(--f-mono)" }}>
                        {b.step}/5
                      </div>
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--f-mono)" }}>{b.lastSeen}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>Voir →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <JourneyModal beneficiary={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── Programs Page ──────────────────────────────────────────── */
function ProgramsPage() {
  return (
    <div className="main">
      <TopBar title="Programmes" subtitle="3 programmes actifs · 340 bénéficiaires" />
      <div className="content">
        {/* Outcome chart */}
        <div className="chart-card" style={{ marginBottom: 22 }}>
          <h3>Résultats d'insertion</h3>
          <p>Distribution des débouchés après programme (tous programmes confondus)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={OUTCOME_DATA} barSize={32}>
              <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="cat" tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B6080", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CT />} />
              <Bar dataKey="val" name="Jeunes" radius={[4,4,0,0]}>
                {OUTCOME_DATA.map((_, i) => (
                  <Cell key={i} fill={["#3B82F6","#10B981","#A78BFA","#06B6D4","#F59E0B"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <SectionLabel>Programmes actifs</SectionLabel>
        {PROGS.map(prog => (
          <div key={prog.id} className="prog-card">
            <div className="prog-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${prog.color}22`, border: `1px solid ${prog.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-head)", fontSize: 13, fontWeight: 800, color: prog.color,
                  }}>{prog.abbr}</div>
                  <div>
                    <div className="prog-title">{prog.name}</div>
                    <div className="prog-phase" style={{ color: prog.color }}>{prog.phase} · {prog.duration}</div>
                  </div>
                </div>
                <div className="prog-sub" style={{ marginTop: 8 }}>{prog.desc}</div>
              </div>
              <StatusBadge status="active" />
            </div>

            <div className="prog-stats">
              <div className="prog-stat">
                <div className="prog-stat-val" style={{ color: prog.color }}>{prog.active}</div>
                <div className="prog-stat-label">En cours</div>
              </div>
              <div className="prog-stat">
                <div className="prog-stat-val">{prog.graduated}</div>
                <div className="prog-stat-label">Diplômés</div>
              </div>
              <div className="prog-stat">
                <div className="prog-stat-val">{prog.satisfaction}%</div>
                <div className="prog-stat-label">Satisf.</div>
              </div>
              <div className="prog-stat">
                <div className="prog-stat-val">{prog.completion}%</div>
                <div className="prog-stat-label">Taux complétion</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11, color: "var(--text3)" }}>
                <span>Objectif annuel</span>
                <span style={{ fontFamily: "var(--f-mono)" }}>{prog.graduated} / {prog.target} ({Math.round((prog.graduated/prog.target)*100)}%)</span>
              </div>
              <PBar pct={(prog.graduated / prog.target) * 100} color={prog.color} height={6} />
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontFamily: "var(--f-mono)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                Modules
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {prog.modules.map((m, i) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11,
                    background: `${prog.color}15`, color: prog.color,
                    border: `1px solid ${prog.color}30`, fontFamily: "var(--f-mono)",
                  }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Messages Page ──────────────────────────────────────────── */
function MessagesPage() {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState(SENT_MSGS.map(m => ({ ...m, conv: [...m.conv] })));

  const current = conversations[active];

  const sendMsg = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setConversations(prev => prev.map((c, i) =>
      i === active
        ? { ...c, conv: [...c.conv, { out: true, text, time: new Date().toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" }) }] }
        : c
    ));
    setInput("");
  }, [active, input]);

  return (
    <div className="main">
      <TopBar title="Messages" subtitle={`${SENT_MSGS.reduce((s,m) => s + m.unread, 0)} non lus`} />
      <div className="content" style={{ padding: 14 }}>
        <div className="msg-layout">
          <div className="msg-list">
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <input placeholder="Rechercher…" style={{
                width: "100%", background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "var(--text)",
                fontFamily: "var(--f-body)", outline: "none",
              }} />
            </div>
            {conversations.map((m, i) => (
              <div key={m.id} className={`msg-item ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div className="msg-avatar" style={{ background: m.color }}>{m.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div className="msg-name">{m.from}</div>
                      <div className="msg-time">{m.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div className="msg-preview">{m.preview}</div>
                      {m.unread > 0 && <div className="msg-unread" style={{ flexShrink: 0 }} />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="msg-pane">
            <div className="msg-pane-header">
              <div className="msg-avatar" style={{ background: current.color }}>{current.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{current.from}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>En ligne</div>
              </div>
            </div>
            <div className="msg-pane-body">
              {current.conv.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.out ? "flex-end" : "flex-start" }}>
                  <div className={`bubble ${msg.out ? "bubble-out" : "bubble-in"}`}>{msg.text}</div>
                  <div className="bubble-time">{msg.time}</div>
                </div>
              ))}
            </div>
            <div className="msg-input-row">
              <input
                className="msg-inp"
                placeholder="Écrire un message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMsg()}
              />
              <button className="btn btn-primary" onClick={sendMsg} disabled={!input.trim()}>
                Envoyer →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reports Page ───────────────────────────────────────────── */
function ReportsPage() {
  return (
    <div className="main">
      <TopBar title="Rapports" subtitle="Analyses & exports — Mars 2026" />
      <div className="content">
        <div className="report-grid">
          {/* Gender chart */}
          <div className="chart-card">
            <h3>Genre</h3>
            <p>Répartition des bénéficiaires</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={GENDER_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                  dataKey="val" paddingAngle={3} stroke="none">
                  {GENDER_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: "var(--text2)" }}>{v}</span>} />
                <Tooltip formatter={v => `${v}%`} contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Key metrics */}
          <div className="chart-card">
            <h3>Métriques clés</h3>
            <p>Performance nationale</p>
            {[
              { name: "Taux de complétion", val: "76%" },
              { name: "Taux d'insertion", val: "63%" },
              { name: "NPS moyen", val: "82/100" },
              { name: "Délai moyen diplôme", val: "5.2 mois" },
              { name: "Coût / bénéficiaire", val: "1 840 MAD" },
              { name: "Ratio encadrement", val: "1 / 18" },
            ].map((m, i) => (
              <div key={i} className="metric-row">
                <div className="metric-name">{m.name}</div>
                <div className="metric-val">{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional stats */}
        <SectionLabel>Performance par région</SectionLabel>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Région</th>
                <th>Plateformes</th>
                <th>Bénéficiaires</th>
                <th>Satisfaction</th>
                <th>Progression</th>
              </tr>
            </thead>
            <tbody>
              {[
                { region: "Marrakech-Safi", plts: 1, ben: 445, sat: 94 },
                { region: "Souss-Massa", plts: 1, ben: 312, sat: 92 },
                { region: "Tanger-Tétouan-Al Hoceïma", plts: 1, ben: 268, sat: 91 },
                { region: "Casablanca-Settat", plts: 1, ben: 287, sat: 88 },
                { region: "Béni Mellal-Khénifra", plts: 1, ben: 176, sat: 85 },
                { region: "Fès-Meknès", plts: 1, ben: 198, sat: 79 },
                { region: "Drâa-Tafilalet", plts: 1, ben: 134, sat: 76 },
                { region: "Rabat-Salé-Kénitra", plts: 1, ben: 89, sat: 71 },
              ].map((r, i) => (
                <tr key={i}>
                  <td><div className="td-name">{r.region}</div></td>
                  <td><span className="tag tag-blue">{r.plts} PLT</span></td>
                  <td style={{ fontFamily: "var(--f-mono)", fontWeight: 700, color: "var(--text)" }}>{r.ben}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60 }}>
                        <PBar pct={r.sat} color={r.sat >= 85 ? "#10B981" : r.sat >= 75 ? "#F59E0B" : "#EF4444"} height={4} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "var(--f-mono)", color: "var(--text)" }}>{r.sat}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[20,40,60,80,100].map(n => (
                        <div key={n} style={{
                          width: 10, height: 10, borderRadius: 2,
                          background: r.ben > n * 4.5 ? "#3B82F6" : "rgba(255,255,255,.06)",
                        }} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button className="btn btn-primary">⬇ Exporter PDF</button>
          <button className="btn btn-ghost">📊 Exporter Excel</button>
          <button className="btn btn-ghost">📧 Envoyer par email</button>
        </div>
      </div>
    </div>
  );
}

/* ── Root component ─────────────────────────────────────────── */
export default function XTrack() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");

  if (!user) {
    return (
      <>
        <G />
        <LoginPage onLogin={setUser} />
      </>
    );
  }

  const pages = {
    dashboard: <DashboardPage />,
    platforms: <PlatformsPage />,
    beneficiaries: <BeneficiariesPage />,
    programs: <ProgramsPage />,
    messages: <MessagesPage />,
    reports: <ReportsPage />,
  };

  return (
    <>
      <G />
      <div className="xc">
        <Sidebar active={active} setActive={setActive} onLogout={() => setUser(null)} />
        {pages[active] || <DashboardPage />}
      </div>
    </>
  );
}
