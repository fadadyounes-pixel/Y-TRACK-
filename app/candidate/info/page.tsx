'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../../components/Logo';
import { useAuth } from '../../../contexts/AuthContext';

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'Mohammédia', 'El Jadida', 'Béni Mellal',
  'Nador', 'Taza', 'Settat', 'Khouribga', 'Berrechid', 'Khémisset', 'Autre',
];

const SECTORS = [
  'Technology / IT', 'Data Science', 'Finance / Comptabilité', 'Marketing / Communication',
  'Design / Créatif', 'Opérations / Supply Chain', 'BTP / Architecture', 'Tourisme / Hôtellerie',
  'Agro-alimentaire', 'Santé / Médical', 'Éducation / Formation', 'Industrie / Fabrication',
  'Transport / Logistique', 'Commerce / Vente', 'Droit / Juridique', 'Autre',
];

const EXPERIENCE_LEVELS = ['Étudiant(e)', 'Débutant (0–1 an)', 'Junior (1–3 ans)', 'Mid-Level (3–6 ans)', 'Senior (6–10 ans)', 'Expert (10+ ans)'];

const LANGS = ['Français', 'Arabe', 'Anglais', 'Espagnol', 'Allemand', 'Néerlandais', 'Autre'];

const DIPLOMA_LEVELS = [
  'Bac', 'Bac+2 / DUT / BTS', 'Licence / Bachelor (Bac+3)',
  'Master / MBA (Bac+5)', 'Doctorat / PhD', 'OFPPT / Technicien Spécialisé',
  'Formation professionnelle', 'Autodidacte', 'Autre',
];

interface InfoProfile {
  photo: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  city: string;
  address: string;
  cin: string;
  sector: string;
  experience: string;
  languages: string[];
  linkedin: string;
  portfolio: string;
  diploma: string;
  institution: string;
  graduationYear: string;
}

const EMPTY: InfoProfile = {
  photo: '', firstName: '', lastName: '', phone: '', birthDate: '',
  city: '', address: '', cin: '', sector: '', experience: '',
  languages: [], linkedin: '', portfolio: '',
  diploma: '', institution: '', graduationYear: '',
};

function storageKey(idNumber: string) { return `tm_info_${idNumber}`; }

export default function CandidateInfoPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<InfoProfile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoErr, setPhotoErr] = useState('');

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
      } else {
        const parts = user.name.split(' ');
        setForm(p => ({
          ...p,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          cin: user.idNumber || '',
        }));
      }
    } catch {}
  }, [user, initialized, router]);

  /* Show loading spinner while auth hydrates */
  if (!initialized) {
    return (
      <main style={{ minHeight: '100vh', background: '#F6F8FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1B4FD8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Chargement…</p>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'candidate') return null;

  const set = (k: keyof InfoProfile, v: string) => {
    setSaved(false);
    setForm(p => ({ ...p, [k]: v }));
  };

  const toggleLang = (l: string) => {
    setSaved(false);
    setForm(p => ({
      ...p,
      languages: p.languages.includes(l) ? p.languages.filter(x => x !== l) : [...p.languages, l],
    }));
  };

  const handlePhoto = (file: File) => {
    setPhotoErr('');
    if (file.size > 2 * 1024 * 1024) { setPhotoErr('Photo trop lourde — max 2 Mo.'); return; }
    if (!file.type.startsWith('image/')) { setPhotoErr('Fichier non supporté — JPG, PNG, WebP.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setSaved(false);
      setForm(p => ({ ...p, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(storageKey(user.idNumber), JSON.stringify(form));
      fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'save_cv', cv: { ...form, id: user.idNumber, name: `${form.firstName} ${form.lastName}`.trim() || user.name, role: 'candidate' } }),
      }).catch(() => {});
      setSaved(true);
    } catch {}
    setSaving(false);
  };

  /* Styles */
  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem',
  };
  const inputStyle = (filled: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
    border: `1.5px solid ${filled ? '#1B4FD8' : '#E2E8F0'}`,
    borderRadius: '9px', outline: 'none', background: filled ? '#EFF6FF' : '#f8fafc',
    color: '#0f172a', transition: 'border-color 0.15s, background 0.15s',
    fontFamily: 'inherit', boxSizing: 'border-box',
  });
  const fieldBlock: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0 };

  const filledCount = [
    form.photo, form.firstName, form.lastName, form.phone, form.city,
    form.sector, form.experience, form.languages.length > 0 ? 'ok' : '',
    form.diploma,
  ].filter(Boolean).length;
  const totalFields = 9;
  const pct = Math.round((filledCount / totalFields) * 100);

  return (
    <main style={{ minHeight: '100vh', background: '#F6F8FC', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <nav style={{ background: '#0B1629', height: 60, padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,.06)', boxShadow: '0 2px 16px rgba(0,0,0,.35)' }}>
        <Logo size="md" variant="light" />
        <Link href="/candidate" style={{ color: 'rgba(255,255,255,.75)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        {/* Title + progress */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Mes Informations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Ces informations apparaîtront dans votre CV et votre profil candidat.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #1B4FD8, #1443B8)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1B4FD8', minWidth: '36px' }}>{pct}%</span>
          </div>
        </div>

        {/* ── Photo card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>📷 Photo de profil</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: '96px', height: '96px', borderRadius: '50%', border: '3px dashed #93c5fd', background: form.photo ? 'transparent' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}
              title="Cliquez pour changer la photo"
            >
              {form.photo
                ? <img src={form.photo} alt="Photo de profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '2rem' }}>👤</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                {form.photo ? '✅ Photo chargée avec succès.' : 'Une photo professionnelle augmente vos chances d\'entretien de 40 %.'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {form.photo ? '🔄 Changer la photo' : '📁 Choisir une photo'}
                </button>
                {form.photo && (
                  <button
                    onClick={() => { setSaved(false); setForm(p => ({ ...p, photo: '' })); }}
                    style={{ padding: '0.55rem 1rem', background: 'transparent', color: '#ef4444', border: '1.5px solid #fca5a5', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              {photoErr && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>{photoErr}</p>}
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>JPG, PNG, WebP — max 2 Mo</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = ''; }}
          />
        </div>

        {/* ── Identity card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>🪪 État civil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Prénom *</label>
              <input style={inputStyle(!!form.firstName)} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Mohammed" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Nom de famille *</label>
              <input style={inputStyle(!!form.lastName)} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Benali" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>N° CIN</label>
              <input style={inputStyle(!!form.cin)} value={form.cin} onChange={e => set('cin', e.target.value.toUpperCase())} placeholder="AB123456" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Date de naissance</label>
              <input type="date" style={inputStyle(!!form.birthDate)} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Contact card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>📞 Contact & Localisation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Téléphone *</label>
              <input style={inputStyle(!!form.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+212 6 XX XX XX XX" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Ville *</label>
              <select style={{ ...inputStyle(!!form.city), cursor: 'pointer' }} value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Sélectionner une ville…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ ...fieldBlock, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Adresse (optionnel)</label>
              <input style={inputStyle(!!form.address)} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Rue Mohammed V, Casablanca" />
            </div>
          </div>
        </div>

        {/* ── Education card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>🎓 Formation & Diplôme</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ ...fieldBlock, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Niveau de diplôme *</label>
              <select style={{ ...inputStyle(!!form.diploma), cursor: 'pointer' }} value={form.diploma} onChange={e => set('diploma', e.target.value)}>
                <option value="">Sélectionner votre diplôme…</option>
                {DIPLOMA_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>École / Université</label>
              <input
                style={inputStyle(!!form.institution)}
                value={form.institution}
                onChange={e => set('institution', e.target.value)}
                placeholder="ENSA, ENCG, FSJES, OFPPT…"
              />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Année d'obtention</label>
              <input
                style={inputStyle(!!form.graduationYear)}
                value={form.graduationYear}
                onChange={e => set('graduationYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="2023"
                maxLength={4}
              />
            </div>
          </div>
          {form.diploma && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1B4FD8', fontWeight: 600 }}>
              ✅ {form.diploma}{form.institution ? ` — ${form.institution}` : ''}{form.graduationYear ? ` (${form.graduationYear})` : ''}
            </div>
          )}
        </div>

        {/* ── Professional card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>💼 Profil Professionnel</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Secteur *</label>
              <select style={{ ...inputStyle(!!form.sector), cursor: 'pointer' }} value={form.sector} onChange={e => set('sector', e.target.value)}>
                <option value="">Sélectionner un secteur…</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Niveau d'expérience *</label>
              <select style={{ ...inputStyle(!!form.experience), cursor: 'pointer' }} value={form.experience} onChange={e => set('experience', e.target.value)}>
                <option value="">Sélectionner…</option>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>LinkedIn (optionnel)</label>
              <input style={inputStyle(!!form.linkedin)} value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/votre-profil" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Portfolio / GitHub (optionnel)</label>
              <input style={inputStyle(!!form.portfolio)} value={form.portfolio} onChange={e => set('portfolio', e.target.value)} placeholder="github.com/votre-nom" />
            </div>
          </div>
        </div>

        {/* ── Languages card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>🌐 Langues maîtrisées *</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LANGS.map(l => {
              const active = form.languages.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLang(l)}
                  style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `2px solid ${active ? '#1B4FD8' : '#E2E8F0'}`, background: active ? '#EFF6FF' : '#f8fafc', color: active ? '#1B4FD8' : '#64748b', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {active ? '✓ ' : ''}{l}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Save + Next CTA ── */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '0.9rem 2rem', background: saved ? '#059669' : 'linear-gradient(135deg,#0B1629,#1B4FD8)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', minWidth: '160px' }}
          >
            {saving ? 'Enregistrement…' : saved ? '✅ Enregistré !' : '💾 Enregistrer'}
          </button>
          {saved && (
            <Link
              href="/candidate/upload"
              style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              📄 Créer / Mettre à jour mon CV →
            </Link>
          )}
        </div>

        {!saved && pct < 50 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            Remplissez au moins les champs obligatoires (*) pour continuer.
          </p>
        )}
      </div>
    </main>
  );
}
