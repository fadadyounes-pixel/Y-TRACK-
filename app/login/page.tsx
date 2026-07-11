'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  coordinator: '/coordinator',
  candidate: '/candidate',
};

type DetectedRole = 'admin' | 'coordinator' | 'candidate' | 'unknown' | null;

function detectRole(val: string): DetectedRole {
  if (!val.trim()) return null;
  const v = val.trim().toUpperCase();
  if (/^ADMIN/i.test(v)) return 'admin';
  if (/^COORD/i.test(v)) return 'coordinator';
  if (/^(CAN|CM)[A-Z0-9]/i.test(v) || /^[A-Z]{2}\d{3,}$/.test(v)) return 'candidate';
  if (v.length >= 3) return 'unknown';
  return null;
}

const ROLE_COLORS: Record<string, string> = {
  admin: '#9B59B6',
  coordinator: '#22C55E',
  candidate: '#1aabaa',
  unknown: '#EF4444',
};

const ROLE_ICONS: Record<string, string> = {
  admin: '⚙️',
  coordinator: '👔',
  candidate: '🎓',
  unknown: '❌',
};

const ROLE_LABELS: Record<string, { fr: string; en: string }> = {
  admin: { fr: 'Administrateur', en: 'Administrator' },
  coordinator: { fr: 'Conseiller RH', en: 'HR Advisor' },
  candidate: { fr: 'Candidat', en: 'Candidate' },
  unknown: { fr: 'Code non reconnu', en: 'Unrecognized code' },
};

const TX = {
  fr: {
    tagline: 'Votre carrière, cartographiée.',
    label: 'Code d\'accès',
    hint: 'Admin: ADMIN001 · Conseiller: COORD001 · Candidat: CAN001',
    error: 'Code non reconnu. Vérifiez et réessayez.',
    cont: 'Continuer',
  },
  en: {
    tagline: 'Your career, mapped.',
    label: 'Access Code',
    hint: 'Admin: ADMIN001 · Advisor: COORD001 · Candidate: CAN001',
    error: 'Unrecognized code. Please check and try again.',
    cont: 'Continue',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [shake, setShake] = useState(false);

  const t = TX[lang];
  const liveRole = detectRole(code);
  const inputBorder =
    liveRole && liveRole !== 'unknown'
      ? ROLE_COLORS[liveRole]
      : liveRole === 'unknown'
      ? '#EF4444'
      : 'rgba(255,255,255,.12)';

  const handleSubmit = () => {
    setError('');
    setIsLoading(true);
    const success = login(code);
    if (!success) {
      setError(t.error);
      setIsLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    try {
      const stored = localStorage.getItem('talentmap_user');
      if (stored) {
        const user = JSON.parse(stored);
        router.push(ROLE_ROUTES[user.role as UserRole] ?? '/');
        return;
      }
    } catch {}
    setIsLoading(false);
  };

  // inject keyframes once
  useEffect(() => {
    if (document.getElementById('tm-login-css')) return;
    const el = document.createElement('style');
    el.id = 'tm-login-css';
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
      @keyframes tmFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes tmShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
      .tm-fadeup{animation:tmFadeUp .35s ease both}
      .tm-shake{animation:tmShake .35s ease}
      .tm-lang-btn:hover{background:rgba(255,255,255,.1)!important}
      .tm-cont-btn:hover:not(:disabled){filter:brightness(1.12)}
    `;
    document.head.appendChild(el);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0F2C',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Poppins', -apple-system, sans-serif",
    }}>
      {/* Glow orbs */}
      <div style={{
        position: 'absolute', left: -80, bottom: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'rgba(37,99,235,.18)', filter: 'blur(72px)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', right: -60, top: -60,
        width: 280, height: 280, borderRadius: '50%',
        background: 'rgba(30,64,175,.4)', filter: 'blur(72px)', pointerEvents: 'none',
      }}/>

      {/* Language toggle */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4, zIndex: 10 }}>
        {(['fr', 'en'] as const).map(k => (
          <button
            key={k}
            onClick={() => setLang(k)}
            className="tm-lang-btn"
            style={{
              padding: '4px 10px', borderRadius: 7,
              border: `1px solid ${lang === k ? '#2563EB' : 'rgba(255,255,255,.15)'}`,
              background: lang === k ? '#2563EB' : 'transparent',
              color: lang === k ? '#fff' : 'rgba(255,255,255,.55)',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all .18s', fontFamily: 'inherit',
            }}
          >{k}</button>
        ))}
      </div>

      {/* Glass card */}
      <div
        className="tm-fadeup"
        style={{
          background: 'rgba(15,34,51,.95)',
          borderRadius: 22,
          padding: '36px 26px',
          width: '100%',
          maxWidth: 400,
          border: '1px solid rgba(28,58,92,.8)',
          boxShadow: '0 0 60px rgba(0,0,0,.5)',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 12,
            background: 'rgba(37,99,235,.15)', border: '1px solid rgba(37,99,235,.3)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg,#2563EB,#1E40AF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#fff',
            }}>T</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-.3px' }}>
              TalentMap
            </span>
          </div>
        </div>

        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,.35)',
          fontSize: 12, marginBottom: 28, fontFamily: 'inherit',
        }}>
          {t.tagline}
        </p>

        {/* Label */}
        <label style={{
          display: 'block', fontSize: 9, fontWeight: 700,
          color: 'rgba(255,255,255,.4)', marginBottom: 6,
          letterSpacing: '.9px', textTransform: 'uppercase',
        }}>
          {t.label}
        </label>

        {/* Input */}
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && !isLoading && code.trim() && handleSubmit()}
          placeholder=""
          maxLength={30}
          autoFocus
          className={shake ? 'tm-shake' : ''}
          style={{
            width: '100%',
            padding: '13px 14px',
            background: 'rgba(255,255,255,.04)',
            border: `2px solid ${inputBorder}`,
            borderRadius: 11,
            fontSize: 15,
            fontFamily: 'monospace',
            color: '#fff',
            marginBottom: liveRole ? 8 : 12,
            transition: 'border-color .2s',
            letterSpacing: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Live role badge */}
        {liveRole && liveRole !== 'unknown' && !error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
            padding: '5px 10px', borderRadius: 7,
            background: ROLE_COLORS[liveRole] + '18',
            border: `1px solid ${ROLE_COLORS[liveRole]}30`,
          }}>
            <span style={{ fontSize: 13 }}>{ROLE_ICONS[liveRole]}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLORS[liveRole] }}>
              {ROLE_LABELS[liveRole]?.[lang]}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ color: '#EF4444', fontSize: 11, marginBottom: 10 }}>{error}</p>
        )}

        {/* Hint */}
        {!liveRole && !error && (
          <p style={{ color: 'rgba(255,255,255,.22)', fontSize: 10, marginBottom: 12, lineHeight: 1.5 }}>
            {t.hint}
          </p>
        )}

        {/* Continue button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !code.trim()}
          className="tm-cont-btn"
          style={{
            width: '100%',
            padding: 15,
            background: liveRole && liveRole !== 'unknown'
              ? `linear-gradient(135deg,${ROLE_COLORS[liveRole]},${ROLE_COLORS[liveRole]}cc)`
              : 'linear-gradient(135deg,#2563EB,#1E40AF)',
            color: '#0F2233',
            border: 'none',
            borderRadius: 12,
            fontFamily: 'inherit',
            fontSize: 15,
            fontWeight: 800,
            opacity: !code.trim() ? 0.5 : 1,
            transition: 'all .18s',
            cursor: !code.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? '…' : `${t.cont} →`}
        </button>
      </div>

      <p style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.18)',
      }}>
        © 2026 TalentMap
      </p>
    </div>
  );
}
