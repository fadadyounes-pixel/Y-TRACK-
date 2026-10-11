'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import Icon from '../../../components/Icon';
import { useAuth } from '../../../contexts/AuthContext';
import { isProfileComplete } from '@/lib/profile';
import { REGIONS, CASABLANCA_SETTAT, ARRONDISSEMENTS_CASABLANCA } from '@/lib/morocco';

interface InfoProfile {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  region: string;
  // One of the 8 préfectures d'arrondissements of Casablanca — only asked
  // when region === Casablanca-Settat, since a plain region is too coarse
  // there (most candidates are concentrated in this one region).
  prefecture: string;
}

const EMPTY: InfoProfile = { fullName: '', phone: '', email: '', age: '', region: '', prefecture: '' };

function storageKey(idNumber: string) { return `tm_info_${idNumber}`; }

const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function CandidateInfoPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<InfoProfile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // True when the candidate landed here via the mandatory onboarding gate
  // (profile was incomplete) rather than choosing to edit an already-complete
  // profile — only the former auto-advances to the dashboard after saving.
  const [onboarding, setOnboarding] = useState(false);

  /* Guard & load saved data */
  useEffect(() => {
    if (initialized && (!user || user.role !== 'candidate')) {
      router.push('/login');
      return;
    }
    if (!user) return;
    try {
      const stored = localStorage.getItem(storageKey(user.idNumber));
      if (stored) {
        const parsed = JSON.parse(stored);
        setForm({ ...EMPTY, ...parsed });
        setOnboarding(!isProfileComplete(parsed));
      } else {
        setForm(p => ({ ...p, fullName: user.name.startsWith('Candidat ') ? '' : user.name, email: user.email || '' }));
        setOnboarding(true);
      }
    } catch {}
  }, [user, initialized, router]);

  /* Show loading spinner while auth hydrates */
  if (!initialized) {
    return (
      <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Chargement…</p>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'candidate') return null;

  const set = (k: keyof InfoProfile, v: string) => {
    setSaved(false);
    setForm(p => ({ ...p, [k]: v }));
  };

  const setRegion = (v: string) => {
    setSaved(false);
    setForm(p => ({ ...p, region: v, prefecture: v === CASABLANCA_SETTAT ? p.prefecture : '' }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      // Split the single "Full name" field into first/last so the dashboard
      // greeting and cover-letter signature (which read info.firstName /
      // info.lastName) keep working unchanged — this split happens only at
      // save time, not on every keystroke, so the input never fights the user
      // over a trimmed trailing space while they're still typing a surname.
      const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ');
      const record = { ...form, firstName, lastName };

      localStorage.setItem(storageKey(user.idNumber), JSON.stringify(record));
      fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_cv', cv: { ...record, id: user.idNumber, name: form.fullName.trim() || user.name, role: 'candidate' } }),
      }).catch(() => {});
      setSaved(true);
      // Onboarding gate satisfied — continue straight into the app instead
      // of leaving the candidate stranded on the info form.
      if (onboarding && isProfileComplete(form)) {
        setTimeout(() => router.push('/candidate'), 900);
      }
    } catch {}
    setSaving(false);
  };

  /* Styles */
  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem',
  };
  const inputStyle = (filled: boolean, invalid?: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
    border: `1.5px solid ${invalid ? '#ef4444' : filled ? '#2563eb' : '#e5e7eb'}`,
    borderRadius: '9px', outline: 'none', background: filled ? '#EFF6FF' : '#f8fafc',
    color: '#0f172a', transition: 'border-color 0.15s, background 0.15s',
    fontFamily: 'inherit', boxSizing: 'border-box',
  });
  const fieldBlock: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0 };

  const needsPrefecture = form.region === CASABLANCA_SETTAT;
  const emailInvalid = !!form.email && !isEmailValid(form.email);
  const filledCount = [
    form.fullName, form.phone, form.email && !emailInvalid ? form.email : '', form.age, form.region,
    needsPrefecture ? form.prefecture : 'n/a',
  ].filter(Boolean).length;
  const totalFields = 6;
  const pct = Math.round((filledCount / totalFields) * 100);

  // ── Section header: icon square + bold label + divider (CareerMap pattern) ──
  const SectionHeader = ({ icon, label }: { icon: 'id-card' | 'phone'; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={16} color="#2563eb" />
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0a1f5c', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <PageHeader label="Candidate Portal" icon="user" />

      {/* ── Sticky info bar: ID badge + title + progress + Next (CareerMap pattern) ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
              Votre ID · <span style={{ color: '#2563eb', fontFamily: 'monospace' }}>{user.idNumber}</span>
            </p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a1f5c', letterSpacing: '-0.02em', margin: 0 }}>
              Mes Informations
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: saved ? '#059669' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
          >
            {saving ? 'Enregistrement…' : saved ? <><Icon name="check" size={15}/>Enregistré</> : 'Suivant →'}
          </button>
        </div>
        <div style={{ maxWidth: '640px', margin: '0.75rem auto 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #1d4ed8)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', minWidth: '36px' }}>{pct}%</span>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ces informations de base servent à vous identifier et à vous recontacter.
        </p>

        {/* ── Identity card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="id-card" label="Identité" />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Nom complet *</label>
              <input style={inputStyle(!!form.fullName)} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Mohammed Benali" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Âge *</label>
              <input
                type="number"
                style={inputStyle(!!form.age)}
                value={form.age}
                onChange={e => set('age', e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="28"
                min={15}
                max={99}
              />
            </div>
          </div>
        </div>

        {/* ── Contact card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="phone" label="Contact & Localisation" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Téléphone *</label>
              <input style={inputStyle(!!form.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+212 6 XX XX XX XX" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle(!!form.email, emailInvalid)}
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="mohammed.benali@email.com"
              />
              {emailInvalid && <p style={{ color: '#ef4444', fontSize: '0.74rem', marginTop: '0.35rem' }}>Format d&apos;email invalide.</p>}
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Région *</label>
              <select style={{ ...inputStyle(!!form.region), cursor: 'pointer' }} value={form.region} onChange={e => setRegion(e.target.value)}>
                <option value="">Sélectionner une région…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {needsPrefecture && (
              <div style={fieldBlock}>
                <label style={labelStyle}>Préfecture *</label>
                <select style={{ ...inputStyle(!!form.prefecture), cursor: 'pointer' }} value={form.prefecture} onChange={e => set('prefecture', e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {ARRONDISSEMENTS_CASABLANCA.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ── Save + Next CTA ── */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.9rem 2rem', background: saved ? '#059669' : 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', minWidth: '160px' }}
          >
            {saving ? 'Enregistrement…' : saved ? <><Icon name="check" size={15}/>Enregistré !</> : <><Icon name="save" size={15}/>Enregistrer</>}
          </button>
          {saved && !(onboarding && isProfileComplete(form)) && (
            <Link
              href="/candidate/upload"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <Icon name="file-text" size={15}/>Créer / Mettre à jour mon CV →
            </Link>
          )}
          {saved && onboarding && isProfileComplete(form) && (
            <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
              ↻ Redirection vers votre tableau de bord…
            </span>
          )}
        </div>

        {!saved && pct < 50 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            Remplissez au moins les champs obligatoires (*) pour continuer.
          </p>
        )}
      </div>
    </main>
  );
}
