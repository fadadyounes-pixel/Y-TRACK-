'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

const NAVY = '#0a1f5c';
const BLUE = '#2563eb';
const WH   = '#ffffff';
const BG   = '#f0f4ff';
const GR   = '#6b7280';
const GN   = '#22c55e';
const RE   = '#ef4444';
const BORDER = '#dde4f0';

const SECTORS = ['Numérique/TIC','Artisanat','Agriculture/Élevage','Commerce/Services','BTP/Maçonnerie','Éducation/Formation','Tourisme rural','Agro-alimentaire'];

export default function CoordinatorJobs() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', company: '', sector: '', location: '', type: 'CDI', minExp: '', description: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  async function enhanceWithAI() {
    if (!form.title || !form.sector) return;
    setAiEnhancing(true);
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Rédigez une description d'offre d'emploi attrayante pour: ${form.title} dans le secteur ${form.sector} à ${form.location || 'Maroc'}. 3-4 phrases, style professionnel marocain.` }],
          system: 'Tu es un expert RH au Maroc. Rédige des offres d\'emploi concises et attractives en français. 3-4 phrases max.',
          task: 'dialogue',
        }),
      });
      const d = await r.json();
      const text = d.content?.[0]?.text || '';
      if (text) setForm(p => ({ ...p, description: text }));
    } catch {}
    setAiEnhancing(false);
  }

  const inp = (field: keyof typeof form, placeholder: string, multi?: boolean) => {
    const style: React.CSSProperties = {
      width: '100%', padding: '11px 14px', borderRadius: 11,
      border: `2px solid ${form[field] ? BLUE : BORDER}`,
      background: form[field] ? '#f0f6ff' : WH,
      fontSize: 13, color: NAVY, resize: multi ? 'vertical' : undefined,
      minHeight: multi ? 100 : undefined, boxSizing: 'border-box',
    };
    if (multi) return <textarea value={form[field]} placeholder={placeholder}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={style} rows={4}/>;
    return <input value={form[field]} placeholder={placeholder}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={style}/>;
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ background: NAVY, height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(10,31,92,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,.1)',
            border: 'none', color: WH, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>← Retour</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: WH }}>Publier une offre d'emploi</span>
        </div>
        <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
          color: 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 18px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Détails du poste</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { f: 'title' as const, p: 'Intitulé du poste', span: true },
              { f: 'company' as const, p: 'Entreprise' },
              { f: 'location' as const, p: 'Ville / Région' },
              { f: 'minExp' as const, p: 'Expérience minimale (ex: 2 ans)' },
            ].map(x => (
              <div key={x.f} style={{ gridColumn: x.span ? '1/-1' : undefined }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
                  textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>{x.p}</label>
                {inp(x.f, x.p)}
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
                textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>Secteur</label>
              <select value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: `2px solid ${form.sector ? BLUE : BORDER}`,
                  background: form.sector ? '#f0f6ff' : WH, fontSize: 13, color: form.sector ? NAVY : GR, appearance: 'none', boxSizing: 'border-box' }}>
                <option value="">Choisir un secteur</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
                textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>Type de contrat</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: `2px solid ${BLUE}`,
                  background: '#f0f6ff', fontSize: 13, color: NAVY, appearance: 'none', boxSizing: 'border-box' }}>
                {['CDI','CDD','Stage','Freelance','Intérim'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Description du poste</span>
            </div>
            <button onClick={enhanceWithAI} disabled={aiEnhancing || !form.title || !form.sector}
              style={{ padding: '6px 14px', borderRadius: 9, border: `1.5px solid ${BLUE}`,
                background: BG, color: BLUE, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                opacity: !form.title || !form.sector ? .5 : 1 }}>
              {aiEnhancing ? '⏳ Génération...' : '🤖 Rédiger avec l\'IA'}
            </button>
          </div>
          {inp('description', 'Décrivez les missions, profil recherché, avantages...', true)}
        </div>

        <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Compétences requises</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ padding: '5px 12px', borderRadius: 20, background: BG,
                color: NAVY, fontSize: 12, fontWeight: 600, border: `1.5px solid ${BLUE}`,
                display: 'flex', alignItems: 'center', gap: 5 }}>
                {s}
                <button onClick={() => setSkills(p => p.filter((_, x) => x !== i))}
                  style={{ background: 'none', border: 'none', color: GR, cursor: 'pointer', fontSize: 12 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { setSkills(p => [...p, skillInput.trim()]); setSkillInput(''); }}}
              placeholder="Compétence requise..."
              style={{ flex: 1, padding: '10px 13px', borderRadius: 10, border: `2px solid ${BORDER}`,
                fontSize: 12, color: NAVY, background: BG, boxSizing: 'border-box' }}/>
            <button onClick={() => { if (skillInput.trim()) { setSkills(p => [...p, skillInput.trim()]); setSkillInput(''); }}}
              style={{ padding: '10px 16px', borderRadius: 10, background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                border: 'none', color: WH, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
          </div>
        </div>

        <button onClick={() => { setSaved(true); setTimeout(() => router.push('/coordinator'), 1200); }}
          style={{ padding: '16px', borderRadius: 13, border: 'none',
            background: saved ? GN : `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
            fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background .3s' }}>
          {saved ? '✅ Offre publiée !' : '🚀 Publier l\'offre'}
        </button>
      </div>
    </div>
  );
}
