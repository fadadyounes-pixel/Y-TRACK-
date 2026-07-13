'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';
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
  admin: '#7c3aed',
  coordinator: '#059669',
  candidate: '#2563eb',
  unknown: '#dc2626',
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
    error: 'Code non reconnu. Vérifiez et réessayez.',
    cont: 'Continuer →',
    loading: 'Connexion…',
  },
  en: {
    tagline: 'Your career, mapped.',
    label: 'Access Code',
    error: 'Unrecognized code. Please check and try again.',
    cont: 'Continue →',
    loading: 'Signing in…',
  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const t = TX[lang];
  const liveRole = detectRole(code);
  const roleColor = liveRole && liveRole !== 'unknown' ? ROLE_COLORS[liveRole] : undefined;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);
    const success = login(code);
    if (!success) {
      setError(t.error);
      setIsLoading(false);
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}
    >
      {/* Language toggle — top right */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
        {(['fr', 'en'] as const).map(k => (
          <button
            key={k}
            onClick={() => setLang(k)}
            style={{
              padding: '4px 10px', borderRadius: 7,
              border: `1px solid ${lang === k ? '#ffffff88' : 'rgba(255,255,255,.25)'}`,
              background: lang === k ? 'rgba(255,255,255,.2)' : 'transparent',
              color: lang === k ? '#fff' : 'rgba(255,255,255,.55)',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all .18s',
            }}
          >{k}</button>
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '0.25rem' }}>
          <Logo size="lg" showText variant="dark" />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              margin: '0 0 0.35rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0a1f5c',
              letterSpacing: '-0.02em',
            }}
          >
            {t.tagline}
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
            {lang === 'fr' ? 'Entrez votre code d\'accès pour continuer.' : 'Enter your access code to continue.'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
        >
          {/* Access Code field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="code"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0a1f5c' }}
            >
              {t.label}
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); if (error) setError(''); }}
              placeholder="e.g. CAN001"
              autoComplete="off"
              autoFocus
              maxLength={30}
              style={{
                padding: '0.85rem 1rem',
                fontSize: '1.05rem',
                border: `2px solid ${error ? '#ef4444' : roleColor ?? '#e2e8f0'}`,
                borderRadius: '10px',
                outline: 'none',
                color: '#0f172a',
                background: '#f8fafc',
                transition: 'border-color 0.15s',
                width: '100%',
                boxSizing: 'border-box',
                letterSpacing: '0.06em',
                fontFamily: 'monospace',
              }}
            />

            {/* Live role badge */}
            {liveRole && !error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8,
                background: (roleColor ?? '#dc2626') + '12',
                border: `1px solid ${(roleColor ?? '#dc2626')}30`,
                width: 'fit-content',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: roleColor ?? '#dc2626' }}>
                  {liveRole === 'unknown' ? '✗' : '✓'}{' '}
                  {ROLE_LABELS[liveRole]?.[lang]}
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.65rem 0.9rem',
                fontSize: '0.875rem',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span aria-hidden>&#9888;</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              background: isLoading || !code.trim()
                ? '#93c5fd'
                : roleColor ?? '#2563eb',
              border: 'none',
              borderRadius: '10px',
              cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {isLoading ? t.loading : t.cont}
          </button>
        </form>

        {/* Contact hint */}
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 }}>
          {lang === 'fr' ? 'Contactez votre conseiller pour obtenir votre code.' : 'Contact your advisor to get your access code.'}
        </p>
      </div>
    </div>
  );
}
