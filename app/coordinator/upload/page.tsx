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
const BORDER = '#dde4f0';

interface AnalyzedCV {
  name: string; sector: string; skills: string[];
  experience: string; score: number; summary: string; filename: string;
}

const SKILL_SUGGESTIONS = ['JavaScript','React','Python','SQL','Excel','Communication','Leadership','Marketing','AutoCAD','Gestion de projet'];

export default function CoordinatorUpload() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'upload' | 'manual'>('upload');
  const [files, setFiles] = useState<{ name: string; analyzing: boolean; result?: AnalyzedCV }[]>([]);
  const [manForm, setManForm] = useState({ name: '', email: '', phone: '', sector: '', region: '', experience: '', education: '', notes: '' });
  const [manSkills, setManSkills] = useState<string[]>([]);
  const [manSkillInput, setManSkillInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'coordinator')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  async function analyzeCV(filename: string, content: string): Promise<AnalyzedCV> {
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Analyse ce CV et extrais les informations clés:\n${content}\nFichier: ${filename}` }],
          system: `Tu es un expert RH marocain. Extrait ces données et retourne UNIQUEMENT ce JSON:
{"name":"nom complet","sector":"secteur principal","skills":["comp1","comp2","comp3"],"experience":"X ans","score":75,"summary":"résumé 1 phrase"}
Score de 0-100 basé sur complétude et pertinence du profil.`,
          task: 'json',
        }),
      });
      const d = await r.json();
      const text = d.content?.[0]?.text || '{}';
      const m = text.match(/\{[\s\S]*\}/);
      const parsed = m ? JSON.parse(m[0]) : {};
      return {
        name: parsed.name || filename.replace(/\.[^.]+$/, ''),
        sector: parsed.sector || 'Non précisé',
        skills: parsed.skills || [],
        experience: parsed.experience || 'Non précisé',
        score: parsed.score || 60,
        summary: parsed.summary || 'Profil en attente d\'analyse.',
        filename,
      };
    } catch {
      return { name: filename, sector: 'Analyse échouée', skills: [], experience: '-', score: 0, summary: 'Impossible d\'analyser ce fichier.', filename };
    }
  }

  async function handleFiles(fileList: FileList) {
    const newFiles = Array.from(fileList).map(f => ({ name: f.name, analyzing: true }));
    setFiles(p => [...p, ...newFiles]);
    for (const file of Array.from(fileList)) {
      const reader = new FileReader();
      reader.onload = async ev => {
        const content = (ev.target?.result as string || '').slice(0, 1500);
        const result = await analyzeCV(file.name, content);
        setFiles(p => p.map(f => f.name === file.name ? { ...f, analyzing: false, result } : f));
      };
      if (file.type === 'text/plain') reader.readAsText(file);
      else reader.readAsDataURL(file); // For binary files, pass filename context
    }
  }

  const inp = (field: keyof typeof manForm, placeholder: string, multi?: boolean) => {
    const style: React.CSSProperties = {
      width: '100%', padding: '11px 14px', borderRadius: 11,
      border: `2px solid ${manForm[field] ? BLUE : BORDER}`,
      background: manForm[field] ? '#f0f6ff' : WH,
      fontSize: 13, color: NAVY, resize: multi ? 'vertical' : undefined,
      minHeight: multi ? 80 : undefined, boxSizing: 'border-box',
    };
    if (multi) return <textarea value={manForm[field]} placeholder={placeholder}
      onChange={e => setManForm(p => ({ ...p, [field]: e.target.value }))} style={style} rows={3}/>;
    return <input value={manForm[field]} placeholder={placeholder}
      onChange={e => setManForm(p => ({ ...p, [field]: e.target.value }))} style={style}/>;
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Poppins',sans-serif" }}>
      <div style={{ background: NAVY, height: 58, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200,
        boxShadow: '0 2px 16px rgba(10,31,92,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,.1)',
            border: 'none', color: WH, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>← Retour</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: WH }}>Importer des CVs</span>
        </div>
        <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 8,
          border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
          color: 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>Déconnexion</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 18px 80px' }}>
        <div style={{ background: WH, borderRadius: 14, padding: 6, display: 'flex', gap: 4, marginBottom: 20, border: `1px solid ${BORDER}` }}>
          {[{ id: 'upload', label: '📁 Importer des fichiers' }, { id: 'manual', label: '✏️ Saisie manuelle' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t.id ? `linear-gradient(135deg,${BLUE},${NAVY})` : 'transparent',
              color: tab === t.id ? WH : GR, fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'upload' && (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: '40px 24px', borderRadius: 16, border: `2px dashed ${BLUE}`,
              background: WH, cursor: 'pointer', marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>📂</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                  Glissez des CVs ici (ou cliquez)
                </div>
                <div style={{ fontSize: 12, color: GR }}>PDF, Word, JPG, PNG, TXT — plusieurs fichiers acceptés</div>
              </div>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" multiple style={{ display: 'none' }}
                onChange={e => e.target.files && handleFiles(e.target.files)}/>
            </label>

            {files.length > 0 && (
              <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                  <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{files.length} CV(s) traité(s)</span>
                </div>
                {files.map((f, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 13, marginBottom: 10,
                    background: f.analyzing ? '#f9fafb' : BG, border: `1px solid ${f.analyzing ? BORDER : BLUE + '33'}` }}>
                    {f.analyzing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%',
                            background: BLUE, animation: `bounce 1s ease ${j*.2}s infinite` }}/>)}
                        </div>
                        <span style={{ fontSize: 12, color: GR }}>🤖 L'IA analyse {f.name}...</span>
                      </div>
                    ) : f.result && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: WH }}>
                            {f.result.name[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{f.result.name}</div>
                            <div style={{ fontSize: 11, color: GR }}>{f.result.sector} · {f.result.experience}</div>
                          </div>
                          <div style={{ width: 46, height: 46, borderRadius: '50%',
                            background: f.result.score >= 70 ? GN : BLUE,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                            flexShrink: 0 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: WH, lineHeight: 1 }}>{f.result.score}</span>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,.7)' }}>SCORE</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: GR, marginBottom: 8, fontStyle: 'italic' }}>{f.result.summary}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {f.result.skills.map((s, j) => (
                            <span key={j} style={{ padding: '3px 10px', borderRadius: 14, background: WH,
                              color: NAVY, fontSize: 10, fontWeight: 600, border: `1.5px solid ${BLUE}` }}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Informations candidat</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { f: 'name' as const, p: 'Prénom et Nom' }, { f: 'email' as const, p: 'Email' },
                  { f: 'phone' as const, p: 'Téléphone' }, { f: 'sector' as const, p: 'Secteur d\'activité' },
                  { f: 'region' as const, p: 'Région' }, { f: 'experience' as const, p: 'Années d\'expérience' },
                  { f: 'education' as const, p: 'Formation' },
                ].map(x => (
                  <div key={x.f} style={{ gridColumn: x.f === 'education' ? '1/-1' : undefined }}>
                    <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
                      textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>{x.p}</label>
                    {inp(x.f, x.p)}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: GR,
                  textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>Notes coordinateur</label>
                {inp('notes', 'Observations, recommandations...', true)}
              </div>
            </div>

            <div style={{ background: WH, borderRadius: 16, padding: '20px 22px', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 20, background: BLUE, borderRadius: 2 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Compétences</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {manSkills.map((s, i) => (
                  <span key={i} style={{ padding: '5px 12px', borderRadius: 20, background: BG,
                    color: NAVY, fontSize: 12, fontWeight: 600, border: `1.5px solid ${BLUE}`,
                    display: 'flex', alignItems: 'center', gap: 5 }}>
                    {s}
                    <button onClick={() => setManSkills(p => p.filter((_, x) => x !== i))}
                      style={{ background: 'none', border: 'none', color: GR, cursor: 'pointer', fontSize: 12 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={manSkillInput} onChange={e => setManSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && manSkillInput.trim()) { setManSkills(p => [...p, manSkillInput.trim()]); setManSkillInput(''); }}}
                  placeholder="Ajouter une compétence..."
                  style={{ flex: 1, padding: '10px 13px', borderRadius: 10, border: `2px solid ${BORDER}`,
                    fontSize: 12, color: NAVY, background: BG, boxSizing: 'border-box' }}/>
                <button onClick={() => { if (manSkillInput.trim()) { setManSkills(p => [...p, manSkillInput.trim()]); setManSkillInput(''); }}}
                  style={{ padding: '10px 16px', borderRadius: 10, background: `linear-gradient(135deg,${BLUE},${NAVY})`,
                    border: 'none', color: WH, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {SKILL_SUGGESTIONS.filter(s => !manSkills.includes(s)).map((s, i) => (
                  <button key={i} onClick={() => setManSkills(p => [...p, s])}
                    style={{ padding: '3px 10px', borderRadius: 14, border: `1px dashed ${BORDER}`,
                      background: WH, color: GR, fontSize: 10, cursor: 'pointer' }}>+ {s}</button>
                ))}
              </div>
            </div>

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
              style={{ padding: '16px', borderRadius: 13, border: 'none',
                background: saved ? GN : `linear-gradient(135deg,${BLUE},${NAVY})`, color: WH,
                fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background .3s' }}>
              {saved ? '✅ Candidat enregistré !' : '💾 Enregistrer le candidat'}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
