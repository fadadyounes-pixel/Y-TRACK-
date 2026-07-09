'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

const NAVY = '#0a1f5c';
const BLUE = '#2563eb';
const SKY  = '#38bdf8';
const WH   = '#ffffff';
const BG   = '#f0f4ff';
const GR   = '#6b7280';
const GN   = '#22c55e';
const RE   = '#ef4444';
const BORDER = '#dde4f0';

const SKILL_SUGGESTIONS = [
  'JavaScript','React','Node.js','Python','SQL','Git','HTML/CSS','PHP',
  'Gestion de projet','Marketing digital','Excel','Communication',
  'Leadership','Vente','Service client','Comptabilité',
  'AutoCAD','Maçonnerie','Plomberie','Électricité',
  'Couture','Design','Artisanat','Broderie',
];

export default function CandidateUpload() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'upload' | 'template'>('template');
  const [uploading, setUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', summary: '',
    sector: '', region: '',
    exp1Title: '', exp1Company: '', exp1Duration: '', exp1Desc: '',
    exp2Title: '', exp2Company: '', exp2Duration: '', exp2Desc: '',
    education: '', eduYear: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(['Arabe']);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'candidate')) router.push('/login');
    if (user) {
      setForm(p => ({ ...p, name: user.name, email: user.email, phone: user.phone ?? '' }));
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  function addSkill(s: string) {
    const v = s.trim();
    if (v && !skills.includes(v)) setSkills(p => [...p, v]);
    setSkillInput('');
  }

  function generateCVHtml(): string {
    return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>CV — ${form.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f8faff}
.container{max-width:820px;margin:0 auto;background:#fff;box-shadow:0 0 40px rgba(0,0,0,.1)}
.header{background:linear-gradient(135deg,#0a1f5c,#2563eb);padding:36px 40px;color:#fff;display:flex;gap:20px;align-items:center}
.avatar{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;flex-shrink:0}
.name{font-size:24px;font-weight:800;margin-bottom:4px}
.contact{font-size:12px;opacity:.75;margin-top:4px}
.body{display:grid;grid-template-columns:1fr 260px}
.main{padding:32px 36px}
.sidebar{background:#f0f4ff;padding:28px 22px;border-left:3px solid #2563eb}
h2{font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 12px;padding-bottom:6px;border-bottom:2px solid #dde4ff}
.bio{font-size:13px;line-height:1.75;color:#555;margin-bottom:24px}
.exp{padding-left:12px;border-left:3px solid #2563eb;margin-bottom:14px}
.exp-title{font-size:14px;font-weight:700;color:#0a1f5c}
.exp-meta{font-size:11px;color:#6b7280;margin-bottom:4px}
.exp-desc{font-size:12px;line-height:1.6;color:#555}
.pill{display:inline-block;padding:4px 12px;border-radius:20px;background:#dde4ff;color:#0a1f5c;font-size:11px;font-weight:600;margin:2px}
.lang{font-size:12px;color:#444;margin-bottom:5px}
@media print{body{background:#fff}.container{box-shadow:none}}
</style></head><body>
<div class="container">
<div class="header">
  <div class="avatar">${(form.name || 'C')[0]}</div>
  <div>
    <div class="name">${form.name}</div>
    <div style="font-size:13px;opacity:.8;margin-bottom:6px">${form.sector}</div>
    <div class="contact">📧 ${form.email} · 📞 ${form.phone} · 📍 ${form.address || form.region}</div>
  </div>
</div>
<div class="body">
  <div class="main">
    ${form.summary ? `<h2>Profil</h2><p class="bio">${form.summary}</p>` : ''}
    ${form.exp1Title ? `<h2>Expérience Professionnelle</h2>
    <div class="exp">
      <div class="exp-title">${form.exp1Title}</div>
      <div class="exp-meta">${form.exp1Company} · ${form.exp1Duration}</div>
      <div class="exp-desc">${form.exp1Desc}</div>
    </div>` : ''}
    ${form.exp2Title ? `<div class="exp">
      <div class="exp-title">${form.exp2Title}</div>
      <div class="exp-meta">${form.exp2Company} · ${form.exp2Duration}</div>
      <div class="exp-desc">${form.exp2Desc}</div>
    </div>` : ''}
    ${form.education ? `<h2>Formation</h2>
    <div class="exp">
      <div class="exp-title">${form.education}</div>
      <div class="exp-meta">${form.eduYear}</div>
    </div>` : ''}
  </div>
  <div class="sidebar">
    ${skills.length > 0 ? `<h2>Compétences</h2><div style="margin-bottom:20px">
      ${skills.map(s => `<span class="pill">${s}</span>`).join('')}
    </div>` : ''}
    ${languages.length > 0 ? `<h2>Langues</h2>
      ${languages.map(l => `<div class="lang">• ${l}</div>`).join('')}` : ''}
    <div style="margin-top:20px">
      <h2>Infos</h2>
      ${form.region ? `<div class="lang">📍 ${form.region}</div>` : ''}
      ${form.sector ? `<div class="lang">🏭 ${form.sector}</div>` : ''}
    </div>
  </div>
</div>
</div></body></html>`;
  }

  function downloadCV() {
    const html = generateCVHtml();
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })),
      download: `CV_${(form.name || user.name).replace(/\s+/g,'_')}.html`,
    });
    a.click();
  }

  async function analyzeWithAI(content: string) {
    setAnalyzing(true);
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Analyse ce CV et donne 3 points forts et 3 suggestions d'amélioration concrètes:\n\n${content}` }],
          system: 'Tu es un expert RH marocain. Analyse les CVs en français. Sois concis et pratique. Format: ✅ Forces: [3 points] · 💡 Améliorations: [3 points]',
          task: 'dialogue',
        }),
      });
      const d = await r.json();
      setAiAnalysis(d.content?.[0]?.text || null);
    } catch {
      setAiAnalysis('Analyse IA temporairement indisponible.');
    }
    setAnalyzing(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // Read text content for AI analysis
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      setUploading(false);
      analyzeWithAI(content.slice(0, 2000));
    };
    reader.onerror = () => setUploading(false);
    if (file.type === 'text/plain') reader.readAsText(file);
    else {
      // For PDF/Word — just use filename as context for now
      setUploading(false);
      analyzeWithAI(`CV de ${user.name} - Fichier: ${file.name} - Secteur: ${user.sector || 'non précisé'}`);
    }
  }

  const inp = (field: keyof typeof form, placeholder: string, multiline?: boolean) => {
    const style: React.CSSProperties = {
      width: '100%', padding: '11px 14px', borderRadius: 11,
      border: `2px solid ${form[field] ? BLUE : BORDER}`,
      background: form[field] ? '#f0f6ff' : WH,
      fontSize: 13, color: NAVY, resize: multiline ? 'vertical' : undefined,
      minHeight: multiline ? 80 : undefined, transition: 'all .18s', boxSizing: 'border-box',
    };
    if (multiline) return <textarea value={form[field]} placeholder={placeholder}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
      style={style} rows={3}/>;
    return <input value={form[field]} placeholder={placeholder}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={style}/>;
  };

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
      textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>{text}</label>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Poppins',sans-serif" }}>
      {/* Header */}
      <div style={{ background: NAVY, height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(10,31,92,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,.1)',
            border: 'none', color: WH, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
            ← Retour
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: WH }}>Mettre à jour mon CV</span>
        </div>
        <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
          color: 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 18px 80px' }}>
        {/* Tab switcher */}
        <div style={{ background: WH, borderRadius: 14, padding: 6, display: 'flex', gap: 4,
          marginBottom: 20, border: `1px solid ${BORDER}` }}>
          {[{ id: 'template', label: '✏️ Remplir le template' }, { id: 'upload', label: '📁 Importer un fichier' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t.id ? `linear-gradient(135deg,${BLUE},${NAVY})` : 'transparent',
              color: tab === t.id ? WH : GR, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'upload' && (
          <div style={{ background: WH, borderRadius: 16, padding: '28px 24px',
            border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: '48px 24px', borderRadius: 14, border: `2px dashed ${BLUE}`,
              background: BG, cursor: 'pointer' }}>
              <span style={{ fontSize: 48 }}>{uploading ? '⏳' : '📄'}</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                  {uploading ? 'Chargement...' : 'Glissez votre CV ici'}
                </div>
                <div style={{ fontSize: 12, color: GR }}>PDF, Word (.docx), JPG, PNG ou TXT</div>
              </div>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" style={{ display: 'none' }}
                onChange={handleFileUpload} disabled={uploading}/>
            </label>

            {analyzing && (
              <div style={{ marginTop: 20, padding: '16px 18px', background: BG, borderRadius: 12,
                border: `1px solid ${BLUE}33`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%',
                    background: BLUE, animation: `bounce 1s ease ${i*.2}s infinite` }}/>)}
                </div>
                <span style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>L'IA analyse votre CV...</span>
              </div>
            )}

            {aiAnalysis && !analyzing && (
              <div style={{ marginTop: 20, padding: '18px 20px', background: BG, borderRadius: 14,
                border: `2px solid ${BLUE}33` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase',
                  letterSpacing: .8, marginBottom: 10 }}>🤖 Analyse IA de votre CV</div>
                <p style={{ fontSize: 13, color: NAVY, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{aiAnalysis}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'template' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Personal info */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Informations personnelles</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>{label('Prénom et Nom')}{inp('name', 'Mohammed Ait Aissa')}</div>
                <div>{label('Email')}{inp('email', 'vous@email.com')}</div>
                <div>{label('Téléphone')}{inp('phone', '+212 6 XX XX XX XX')}</div>
                <div>{label('Secteur cible')}{inp('sector', 'Numérique/TIC')}</div>
                <div>{label('Région')}{inp('region', 'Casablanca-Settat')}</div>
                <div>{label('Adresse')}{inp('address', 'Quartier, Ville')}</div>
              </div>
              <div style={{ marginTop: 10 }}>{label('Résumé / Profil')}{inp('summary', 'Décrivez votre profil professionnel en 3-4 lignes...', true)}</div>
            </div>

            {/* Experience */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Expérience professionnelle</span>
              </div>
              <div style={{ marginBottom: 14, padding: '14px 16px', background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 10 }}>Expérience 1</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                  <div>{label('Poste')}{inp('exp1Title', 'Ex: Développeur Web')}</div>
                  <div>{label('Entreprise')}{inp('exp1Company', 'Ex: TechMaroc SARL')}</div>
                  <div style={{ gridColumn: '1/-1' }}>{label('Durée')}{inp('exp1Duration', 'Ex: 2023–2026 (3 ans)')}</div>
                </div>
                {inp('exp1Desc', 'Décrivez vos missions principales...', true)}
              </div>
              <div style={{ padding: '14px 16px', background: BG, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 10 }}>Expérience 2 (optionnel)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                  <div>{label('Poste')}{inp('exp2Title', 'Ex: Stagiaire IT')}</div>
                  <div>{label('Entreprise')}{inp('exp2Company', 'Ex: StartupMaroc')}</div>
                </div>
                {inp('exp2Desc', 'Description...', true)}
              </div>
            </div>

            {/* Education */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Formation</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div>{label('Diplôme / Établissement')}{inp('education', 'Ex: Bac+3 Informatique — ENSAM Casablanca')}</div>
                <div>{label('Année')}{inp('eduYear', 'Ex: 2023')}</div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Compétences</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ padding: '6px 12px', borderRadius: 20, background: BG,
                    color: NAVY, fontSize: 12, fontWeight: 600, border: `1.5px solid ${BLUE}`,
                    display: 'flex', alignItems: 'center', gap: 5 }}>
                    {s}
                    <button onClick={() => setSkills(p => p.filter((_, x) => x !== i))}
                      style={{ background: 'none', border: 'none', color: GR, cursor: 'pointer', fontSize: 12, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                  placeholder="Ajouter une compétence..."
                  style={{ flex: 1, padding: '10px 13px', borderRadius: 10, border: `2px solid ${BORDER}`,
                    fontSize: 12, color: NAVY, background: BG, boxSizing: 'border-box' }}/>
                <button onClick={() => addSkill(skillInput)} style={{ padding: '10px 16px', borderRadius: 10,
                  background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
                  color: WH, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map((s, i) => (
                  <button key={i} onClick={() => addSkill(s)} style={{ padding: '4px 10px', borderRadius: 14,
                    border: `1px dashed ${BORDER}`, background: WH, color: GR,
                    fontSize: 10, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(10,31,92,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Langues</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Arabe', 'Français', 'Anglais', 'Espagnol', 'Tamazight'].map(l => (
                  <button key={l} onClick={() => setLanguages(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l])}
                    style={{ padding: '7px 14px', borderRadius: 20,
                      background: languages.includes(l) ? `linear-gradient(135deg,${BLUE},${NAVY})` : BG,
                      color: languages.includes(l) ? WH : NAVY,
                      border: `1.5px solid ${languages.includes(l) ? BLUE : BORDER}`,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={downloadCV} style={{
              padding: '16px', borderRadius: 13, border: 'none',
              background: `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>⬇ Générer et Télécharger mon CV</button>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
