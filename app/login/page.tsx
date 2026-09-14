'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';
import Icon, { type IconName } from '../../components/Icon';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';
import { isProfileComplete, loadStoredProfile } from '@/lib/profile';

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
  // Coordinator codes are NAME+COR+digits (e.g. BENALICOR4821); the legacy
  // COORD-prefixed shape still authenticates too, so keep hinting on it.
  if (/COR\d{3,}$/i.test(v) || /^COORD/i.test(v)) return 'coordinator';
  // Moroccan CIN shape: exactly 2 uppercase letters + 4-or-more digits (e.g. AB1234) —
  // must mirror RE_CANDIDATE in app/api/auth/route.ts, the actual auth gate.
  if (/^[A-Z]{2}\d{4,}$/.test(v)) return 'candidate';
  if (v.length >= 3) return 'unknown';
  return null;
}

const ROLE_CONFIG: Record<string, { color: string; label: { fr: string; en: string }; icon: IconName }> = {
  admin:       { color: '#7c3aed', label: { fr: 'Administrateur',  en: 'Administrator' }, icon: 'settings' },
  coordinator: { color: '#059669', label: { fr: 'Conseiller RH',   en: 'HR Advisor'    }, icon: 'briefcase' },
  candidate:   { color: '#2563eb', label: { fr: 'Candidat',        en: 'Candidate'     }, icon: 'graduation-cap' },
  unknown:     { color: '#dc2626', label: { fr: 'Code non reconnu', en: 'Unrecognized'  }, icon: 'x' },
};

const TX = {
  fr: {
    tagline: 'Votre carrière, cartographiée.',
    sub:     'Entrez votre code d\'accès pour continuer.',
    label:   'Code d\'accès',
    ph:      'ex: AB1234 ou NOMCOR...',
    error:   'Code non reconnu. Vérifiez et réessayez.',
    cont:    'Continuer',
    hint:    'Contactez votre conseiller pour obtenir votre code.',
  },
  en: {
    tagline: 'Your career, mapped.',
    sub:     'Enter your access code to continue.',
    label:   'Access Code',
    ph:      'e.g. AB1234 or NAMECOR...',
    error:   'Unrecognized code. Please check and try again.',
    cont:    'Continue',
    hint:    'Contact your advisor to get your access code.',
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
  const cfg = liveRole ? ROLE_CONFIG[liveRole] : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(code);
    if (!success) {
      setError(t.error);
      setIsLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem('talentmap_user');
      if (stored) {
        const user = JSON.parse(stored);
        // Candidates must complete their profile before anything else —
        // send them straight to the info form instead of bouncing through
        // the dashboard first, mirroring the CareerMap onboarding flow.
        if (user.role === 'candidate' && !isProfileComplete(loadStoredProfile(user.idNumber))) {
          router.push('/candidate/info');
          return;
        }
        router.push(ROLE_ROUTES[user.role as UserRole] ?? '/');
        return;
      }
    } catch {}
    setIsLoading(false);
  };

  const borderColor = error ? '#dc2626' : cfg && cfg.color !== ROLE_CONFIG.unknown.color ? cfg.color : '#E2E8F0';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(27,79,216,.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(27,79,216,.06) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,79,216,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Lang toggle */}
      <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 4 }}>
        {(['fr', 'en'] as const).map(k => (
          <button key={k} onClick={() => setLang(k)} style={{
            padding: '4px 11px', borderRadius: 6,
            border: `1px solid ${lang === k ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`,
            background: lang === k ? 'rgba(255,255,255,.12)' : 'transparent',
            color: lang === k ? '#fff' : 'rgba(255,255,255,.4)',
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .18s', letterSpacing: '.04em',
          }}>{k}</button>
        ))}
      </div>

      {/* Split-screen shell: brand panel (wide viewports only) + form column */}
      <div className="login-shell" style={{
        display: 'flex', alignItems: 'center', minHeight: '100vh',
        padding: '1.5rem', gap: '3rem', position: 'relative', zIndex: 1,
      }}>
        {/* Brand panel — hidden below the login-shell breakpoint */}
        <div className="login-brand" style={{ flex: '1 1 460px', maxWidth: '480px', color: '#fff' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 1rem' }}>
            {lang === 'fr' ? 'Votre carrière, cartographiée.' : 'Your career, mapped.'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 2rem', maxWidth: '400px' }}>
            {lang === 'fr'
              ? 'La plateforme de recrutement IA qui connecte candidats, conseillers RH et administrateurs sur un seul flux.'
              : 'The AI recruitment platform connecting candidates, HR advisors, and admins on one shared pipeline.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { icon: 'sparkles' as const, fr: 'CV optimisé par IA en quelques minutes', en: 'AI-optimized CV in minutes' },
              { icon: 'target' as const, fr: 'Score de compatibilité instantané', en: 'Instant compatibility scoring' },
              { icon: 'shield-check' as const, fr: 'Conçu pour le marché marocain', en: 'Built for the Moroccan market' },
            ].map(item => (
              <div key={item.en} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={item.icon} size={17} color="#93c5fd" />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                  {lang === 'fr' ? item.fr : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form column */}
        <div className="login-form-col" style={{ flex: '1 1 420px', display: 'flex', justifyContent: 'center' }}>
      <div className="animate-fade-up" style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Logo size="lg" variant="dark" />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, color: '#0a1f5c',
            letterSpacing: '-0.02em', margin: '0 0 0.35rem',
          }}>
            {t.tagline}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, lineHeight: 1.55 }}>
            {t.sub}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', letterSpacing: '.02em' }}>
              {t.label}
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); if (error) setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={t.ph}
              autoComplete="off"
              autoFocus
              maxLength={30}
              style={{
                padding: '0.8rem 1rem',
                fontSize: '1rem',
                border: `2px solid ${borderColor}`,
                borderRadius: '9px',
                color: '#0F172A',
                background: error ? '#FEF2F2' : '#F8FAFC',
                transition: 'border-color 0.15s, background 0.15s',
                width: '100%',
                letterSpacing: '0.08em',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontWeight: 600,
              }}
            />

            {/* Live role indicator */}
            {cfg && !error && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '8px',
                background: `${cfg.color}12`,
                border: `1px solid ${cfg.color}30`,
                width: 'fit-content',
              }}>
                <Icon name={cfg.icon} size={12} color={cfg.color} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>
                  {cfg.label[lang]}
                </span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '0.6rem 0.875rem',
              fontSize: '0.8rem', color: '#DC2626',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#DC2626"/>
                <path d="M7 4v3.5M7 9.5v.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#ffffff',
              background: isLoading || !code.trim()
                ? '#93c5fd'
                : cfg && cfg.color !== ROLE_CONFIG.unknown.color
                  ? cfg.color
                  : '#1d4ed8',
              border: 'none',
              borderRadius: '9px',
              cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,.35)" strokeWidth="2" fill="none"/>
                  <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
                {lang === 'fr' ? 'Connexion…' : 'Signing in…'}
              </>
            ) : (
              <>{t.cont} →</>
            )}
          </button>
        </form>

        {/* Hint */}
        <p style={{
          margin: '1.25rem 0 0', fontSize: '0.75rem',
          color: '#94A3B8', textAlign: 'center', lineHeight: 1.6,
        }}>
          {t.hint}
        </p>
      </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{
        position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
        fontSize: '0.7rem', color: 'rgba(255,255,255,.2)',
        letterSpacing: '.04em',
      }}>
        © 2026 TalentMap
      </p>

      <style>{`
        @media (max-width: 900px) {
          .login-brand { display: none; }
          .login-shell { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
