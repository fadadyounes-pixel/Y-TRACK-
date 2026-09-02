'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';
import { isProfileComplete } from '@/lib/profile';
import { REGIONS, CASABLANCA_SETTAT, PREFECTURE_CASABLANCA, prefecturesFor, arrondissementsFor } from '@/lib/morocco';

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

const LANGUAGE_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Langue maternelle'];

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
  region: string;
  prefecture: string;
  arrondissement: string;
  city: string;
  address: string;
  cin: string;
  sector: string;
  experience: string;
  languages: string[];
  // Proficiency level per language, keyed by the exact string in `languages`
  // (e.g. { "Anglais": "Courant" }). Additive only — matching/completeness
  // checks keep reading plain `languages: string[]`.
  languageLevels: Record<string, string>;
  linkedin: string;
  portfolio: string;
  diploma: string;
  institution: string;
  graduationYear: string;
}

const EMPTY: InfoProfile = {
  photo: '', firstName: '', lastName: '', phone: '', birthDate: '',
  region: '', prefecture: '', arrondissement: '', city: '', address: '', cin: '', sector: '', experience: '',
  languages: [], languageLevels: {}, linkedin: '', portfolio: '',
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
        const parts = user.name.split(' ');
        setForm(p => ({
          ...p,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          cin: user.idNumber || '',
        }));
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
    setForm(p => ({
      ...p, region: v,
      prefecture: v === CASABLANCA_SETTAT ? p.prefecture : '',
      arrondissement: v === CASABLANCA_SETTAT ? p.arrondissement : '',
    }));
  };

  const setPrefecture = (v: string) => {
    setSaved(false);
    setForm(p => ({ ...p, prefecture: v, arrondissement: v === PREFECTURE_CASABLANCA ? p.arrondissement : '' }));
  };

  const toggleLang = (l: string) => {
    setSaved(false);
    setForm(p => {
      const active = p.languages.includes(l);
      const languageLevels = { ...p.languageLevels };
      if (active) delete languageLevels[l];
      return {
        ...p,
        languages: active ? p.languages.filter(x => x !== l) : [...p.languages, l],
        languageLevels,
      };
    });
  };

  const setLangLevel = (l: string, level: string) => {
    setSaved(false);
    setForm(p => ({ ...p, languageLevels: { ...p.languageLevels, [l]: level } }));
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
  const inputStyle = (filled: boolean): React.CSSProperties => ({
    width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
    border: `1.5px solid ${filled ? '#2563eb' : '#e5e7eb'}`,
    borderRadius: '9px', outline: 'none', background: filled ? '#EFF6FF' : '#f8fafc',
    color: '#0f172a', transition: 'border-color 0.15s, background 0.15s',
    fontFamily: 'inherit', boxSizing: 'border-box',
  });
  const fieldBlock: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 0 };

  const needsPrefecture = form.region === CASABLANCA_SETTAT;
  const needsArrondissement = form.prefecture === PREFECTURE_CASABLANCA;
  const filledCount = [
    form.photo, form.firstName, form.lastName, form.phone, form.city,
    form.cin, form.region, needsPrefecture ? form.prefecture : 'n/a',
    needsArrondissement ? form.arrondissement : 'n/a',
    form.sector, form.experience, form.languages.length > 0 ? 'ok' : '',
    form.diploma,
  ].filter(Boolean).length;
  const totalFields = 13;
  const pct = Math.round((filledCount / totalFields) * 100);

  // ── Section header: icon square + bold label + divider (CareerMap pattern) ──
  const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0a1f5c', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  );

  // ── Enumerated select that reveals a free-text field when "Autre" is chosen —
  // the value itself just holds whatever the candidate typed (or the literal
  // "Autre" marker while the text box is still empty), so nothing downstream
  // (matching, CV export, coordinator views) needs to know this field can be custom. ──
  const SelectWithOther = ({ label, value, options, onChange, placeholder }: {
    label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder: string;
  }) => {
    const showOther = value === 'Autre' || (!!value && !options.includes(value));
    return (
      <>
        <label style={labelStyle}>{label}</label>
        <select
          style={{ ...inputStyle(!!value), cursor: 'pointer' }}
          value={showOther ? 'Autre' : value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {showOther && (
          <input
            style={{ ...inputStyle(!!value && value !== 'Autre'), marginTop: '0.5rem' }}
            value={value === 'Autre' ? '' : value}
            onChange={e => onChange(e.target.value === '' ? 'Autre' : e.target.value)}
            placeholder="Précisez…"
            autoFocus
          />
        )}
      </>
    );
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <PageHeader title="TalentMap" subtitle="Candidate Portal" />

      {/* ── Sticky info bar: ID badge + title + progress + Next (CareerMap pattern) ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
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
            style={{ padding: '0.7rem 1.5rem', background: saved ? '#059669' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
          >
            {saving ? 'Enregistrement…' : saved ? '✅ Enregistré' : 'Suivant →'}
          </button>
        </div>
        <div style={{ maxWidth: '780px', margin: '0.75rem auto 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #1d4ed8)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', minWidth: '36px' }}>{pct}%</span>
        </div>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ces informations apparaîtront dans votre CV et votre profil candidat.
        </p>

        {/* ── Photo card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="📷" label="Photo de profil" />
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
                  style={{ padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
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
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.4rem' }}>JPG, PNG, WebP — max 2 Mo</p>
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
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="🪪" label="État civil" />
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
              <label style={labelStyle}>N° CIN *</label>
              <input style={inputStyle(!!form.cin)} value={form.cin} onChange={e => set('cin', e.target.value.toUpperCase())} placeholder="AB123456" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Date de naissance</label>
              <input type="date" style={inputStyle(!!form.birthDate)} value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Contact card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="📞" label="Contact & Localisation" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <label style={labelStyle}>Téléphone *</label>
              <input style={inputStyle(!!form.phone)} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+212 6 XX XX XX XX" />
            </div>
            <div style={fieldBlock}>
              <SelectWithOther label="Ville *" value={form.city} options={CITIES} onChange={v => set('city', v)} placeholder="Sélectionner une ville…" />
            </div>
            <div style={fieldBlock}>
              <label style={labelStyle}>Région *</label>
              <select style={{ ...inputStyle(!!form.region), cursor: 'pointer' }} value={form.region} onChange={e => setRegion(e.target.value)}>
                <option value="">Sélectionner une région…</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {form.region === CASABLANCA_SETTAT && (
              <div style={fieldBlock}>
                <label style={labelStyle}>Préfecture / Province *</label>
                <select style={{ ...inputStyle(!!form.prefecture), cursor: 'pointer' }} value={form.prefecture} onChange={e => setPrefecture(e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {prefecturesFor(form.region).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {form.prefecture === PREFECTURE_CASABLANCA && (
              <div style={fieldBlock}>
                <label style={labelStyle}>Arrondissement *</label>
                <select style={{ ...inputStyle(!!form.arrondissement), cursor: 'pointer' }} value={form.arrondissement} onChange={e => set('arrondissement', e.target.value)}>
                  <option value="">Sélectionner…</option>
                  {arrondissementsFor(form.prefecture).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            )}
            <div style={{ ...fieldBlock, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Adresse (optionnel)</label>
              <input style={inputStyle(!!form.address)} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Rue Mohammed V, Casablanca" />
            </div>
          </div>
        </div>

        {/* ── Education card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="🎓" label="Formation & Diplôme" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ ...fieldBlock, gridColumn: '1 / -1' }}>
              <SelectWithOther label="Niveau de diplôme *" value={form.diploma} options={DIPLOMA_LEVELS} onChange={v => set('diploma', v)} placeholder="Sélectionner votre diplôme…" />
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
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
              ✅ {form.diploma}{form.institution ? ` — ${form.institution}` : ''}{form.graduationYear ? ` (${form.graduationYear})` : ''}
            </div>
          )}
        </div>

        {/* ── Professional card ── */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="💼" label="Profil Professionnel" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldBlock}>
              <SelectWithOther label="Secteur *" value={form.sector} options={SECTORS} onChange={v => set('sector', v)} placeholder="Sélectionner un secteur…" />
            </div>
            <div style={{ ...fieldBlock, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Niveau d'expérience *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {EXPERIENCE_LEVELS.map(l => {
                  const active = form.experience === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => set('experience', l)}
                      style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `2px solid ${active ? '#2563eb' : '#e5e7eb'}`, background: active ? '#eff6ff' : '#f8fafc', color: active ? '#2563eb' : '#6b7280', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {active ? '✓ ' : ''}{l}
                    </button>
                  );
                })}
              </div>
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
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.75rem', marginBottom: '1.75rem', boxShadow: '0 1px 4px rgba(0,0,0,.06)', border: '1px solid #e5e7eb' }}>
          <SectionHeader icon="🌐" label="Langues maîtrisées *" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LANGS.map(l => {
              const active = form.languages.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLang(l)}
                  style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `2px solid ${active ? '#2563eb' : '#e5e7eb'}`, background: active ? '#EFF6FF' : '#f8fafc', color: active ? '#2563eb' : '#6b7280', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {active ? '✓ ' : ''}{l}
                </button>
              );
            })}
          </div>

          {form.languages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.1rem' }}>
              {form.languages.map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0a1f5c', minWidth: '90px' }}>{l}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {LANGUAGE_LEVELS.map(level => {
                      const activeLevel = form.languageLevels[l] === level;
                      return (
                        <button
                          key={level}
                          onClick={() => setLangLevel(l, level)}
                          style={{ padding: '0.32rem 0.75rem', borderRadius: '9999px', border: `1.5px solid ${activeLevel ? '#2563eb' : '#e5e7eb'}`, background: activeLevel ? '#2563eb' : '#f8fafc', color: activeLevel ? '#fff' : '#6b7280', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Save + Next CTA ── */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '0.9rem 2rem', background: saved ? '#059669' : 'linear-gradient(135deg,#0a1f5c,#2563eb)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', minWidth: '160px' }}
          >
            {saving ? 'Enregistrement…' : saved ? '✅ Enregistré !' : '💾 Enregistrer'}
          </button>
          {saved && !(onboarding && isProfileComplete(form)) && (
            <Link
              href="/candidate/upload"
              style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              📄 Créer / Mettre à jour mon CV →
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
