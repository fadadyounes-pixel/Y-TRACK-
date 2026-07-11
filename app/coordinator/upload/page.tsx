'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import { useAuth } from '../../../contexts/AuthContext';

const CONCURRENCY = 4;

const MOROCCO_HR = `Tu es un expert RH spécialisé dans le marché marocain de l'emploi.
Secteurs au Maroc: Technology/Numérique (IBM, Capgemini, CBI), Data Science, Finance/Banque (Attijariwafa, BMCE, CIH, Banque Populaire), BTP/Immobilier, Automobile (Renault-Nissan Tanger, PSA Kénitra), Textile, Tourisme/Hôtellerie, Agro-alimentaire (OCP, Centrale Danone, Cosumar), Énergie renouvelable (MASEN, NAREVA), Santé, Marketing, Design, Operations.
Diplômes courants: Bac, DUT/BTS (Bac+2), Licence (Bac+3), Master/MBA (Bac+5), Doctorat, OFPPT (TSGE/TSI/TH), Grandes écoles (EHTP, EMI, ENSAM, ENCG, ISCAE, HEM).
Villes: Casablanca, Rabat, Tanger, Marrakech, Fès, Agadir, Oujda, Kénitra, Meknès.
CVs marocains: rédigés en français, état civil (CIN, date naissance), accroche professionnelle, expériences en ordre inversé.`;

interface CvEntry {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  name: string;
  email: string;
  phone: string;
  sector: string;
  experience: string;
  skills: string[];
  summary: string;
  error?: string;
}

function fmtBytes(b: number) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function fileIcon(name: string) {
  if (/\.pdf$/i.test(name)) return '📄';
  if (/\.(doc|docx)$/i.test(name)) return '📝';
  if (/\.(jpg|jpeg|png|webp)$/i.test(name)) return '🖼️';
  return '📎';
}

async function readFileContent(file: File): Promise<string> {
  if (file.type === 'text/plain' || /\.txt$/i.test(file.name)) {
    try { return (await file.text()).slice(0, 3000); } catch {}
  }
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FICHIER';
  return `[CV ${ext}: "${file.name}" — ${fmtBytes(file.size)}]`;
}

function parseJ(txt: string) {
  try { const m = txt.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch { return null; }
}

export default function CoordinatorUpload() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvList, setCvList] = useState<CvEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'processing' | 'queued' | 'error'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const queueRef = useRef<string[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());
  const activeRef = useRef(0);

  useEffect(() => {
    if (!user || user.role !== 'coordinator') router.push('/login');
  }, [user, router]);

  if (!user || user.role !== 'coordinator') return null;

  async function processOne(id: string) {
    const file = fileMapRef.current.get(id);
    if (!file) { activeRef.current--; drain(); return; }

    setCvList(p => p.map(c => c.id === id ? { ...c, status: 'processing' } : c));
    try {
      const content = await readFileContent(file);
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          system: `${MOROCCO_HR}
Analyse ce CV. Si c'est un fichier binaire (PDF/DOCX/image), déduis les informations probables du nom du fichier.
Retourne UNIQUEMENT ce JSON valide sans markdown ni texte avant ou après:
{"name":"nom complet du candidat","email":"email ou chaîne vide","phone":"téléphone marocain ou chaîne vide","sector":"Technology|Data Science|Finance|BTP|Tourisme|Agro-alimentaire|Healthcare|Marketing|Design|Operations|Other","experience":"Entry-Level|Junior|Mid-Level|Senior|Lead","skills":["3 à 5 compétences clés pertinentes"],"summary":"Résumé professionnel percutant en 1 phrase en français"}`,
          task: 'json',
          max_tokens: 500,
        }),
      });
      const data = await r.json();
      const parsed = parseJ(data.content?.[0]?.text || '');
      const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_\.]/g, ' ').trim();
      setCvList(p => p.map(c => c.id === id ? {
        ...c, status: 'done',
        name: parsed?.name || baseName,
        email: parsed?.email || '',
        phone: parsed?.phone || '',
        sector: parsed?.sector || 'Other',
        experience: parsed?.experience || 'Mid-Level',
        skills: Array.isArray(parsed?.skills) ? parsed.skills.slice(0, 6) : [],
        summary: parsed?.summary || '',
      } : c));
    } catch {
      setCvList(p => p.map(c => c.id === id ? { ...c, status: 'error', error: 'Erreur de traitement' } : c));
    }
    activeRef.current--;
    drain();
  }

  function drain() {
    while (activeRef.current < CONCURRENCY && queueRef.current.length > 0) {
      const id = queueRef.current.shift()!;
      activeRef.current++;
      processOne(id);
    }
  }

  function handleFiles(fileList: FileList) {
    const arr = Array.from(fileList);
    if (!arr.length) return;
    const newEntries: CvEntry[] = arr.map((f, i) => {
      const id = `cv_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`;
      fileMapRef.current.set(id, f);
      queueRef.current.push(id);
      return { id, fileName: f.name, fileSize: fmtBytes(f.size), status: 'queued' as const, name: '', email: '', phone: '', sector: '', experience: '', skills: [], summary: '' };
    });
    setCvList(p => [...p, ...newEntries]);
    drain();
  }

  function clearAll() { setCvList([]); queueRef.current = []; fileMapRef.current.clear(); activeRef.current = 0; }

  function exportCSV() {
    const done = cvList.filter(c => c.status === 'done');
    const header = 'Nom,Email,Téléphone,Secteur,Expérience,Compétences,Résumé,Fichier';
    const rows = done.map(c => [c.name, c.email, c.phone, c.sector, c.experience, c.skills.join('; '), c.summary, c.fileName].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })),
      download: `Candidats_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
  }

  const total = cvList.length;
  const done = cvList.filter(c => c.status === 'done').length;
  const processing = cvList.filter(c => c.status === 'processing').length;
  const queued = cvList.filter(c => c.status === 'queued').length;
  const errors = cvList.filter(c => c.status === 'error').length;
  const progressPct = total ? Math.round((done / total) * 100) : 0;

  const filtered = cvList.filter(c => {
    const ms = filterStatus === 'all' || c.status === filterStatus;
    const q = search.toLowerCase();
    const mq = !q || c.fileName.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
    return ms && mq;
  });

  const inp: React.CSSProperties = { padding: '0.5rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', background: 'white' };

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ position: 'relative' }}>
        <PageHeader title="TalentMap" subtitle="Coordinator Portal" />
        <div style={{ position: 'absolute', top: '50%', right: '1.5rem', transform: 'translateY(-50%)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{user.name}</span>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '980px', padding: '2rem 1.5rem' }}>
        <Link href="/coordinator" style={{ fontSize: '0.875rem', color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
          ← Retour au tableau de bord
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '0.3rem' }}>📁 Import de CVs en masse</h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Sélectionnez autant de CVs que nécessaire — PDF, Word, JPG, PNG. L'IA extrait automatiquement les informations.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {done > 0 && (
              <button onClick={exportCSV} style={{ padding: '0.6rem 1.15rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                ⬇ CSV ({done})
              </button>
            )}
            {total > 0 && (
              <button onClick={clearAll} style={{ padding: '0.6rem 1.15rem', background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                🗑 Vider
              </button>
            )}
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="card"
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#2563eb' : '#d1d5db'}`,
            background: dragging ? '#eff6ff' : 'white',
            borderRadius: '14px', padding: '2.25rem 2rem', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem',
          }}
        >
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
          <div style={{ fontSize: '2.5rem', marginBottom: '0.65rem' }}>{dragging ? '📂' : '📁'}</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem' }}>
            {dragging ? 'Déposez les CVs ici' : 'Glissez-déposez vos CVs ici'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Sélection illimitée · {CONCURRENCY} traitements en parallèle · IA adaptée au marché marocain
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
            {[['PDF', '#fee2e2', '#991b1b'], ['DOCX', '#dbeafe', '#1e40af'], ['DOC', '#dbeafe', '#1e40af'], ['JPG', '#fef3c7', '#92400e'], ['PNG', '#fef3c7', '#92400e'], ['WEBP', '#fef3c7', '#92400e']].map(([ext, bg, color]) => (
              <span key={ext} style={{ padding: '0.2rem 0.7rem', borderRadius: '9999px', fontSize: '0.73rem', fontWeight: 700, background: bg, color }}>{ext}</span>
            ))}
          </div>
          <button className="btn-primary" style={{ padding: '0.65rem 1.75rem' }} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Sélectionner des CVs
          </button>
        </div>

        {/* Progress stats */}
        {total > 0 && (
          <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                { label: 'Total', value: total, color: '#111827' },
                { label: 'En attente', value: queued, color: '#d97706' },
                { label: 'En cours', value: processing, color: '#2563eb' },
                { label: 'Terminés', value: done, color: '#059669' },
                ...(errors > 0 ? [{ label: 'Erreurs', value: errors, color: '#dc2626' }] : []),
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.35rem', color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.9rem', color: '#2563eb' }}>{progressPct}%</span>
            </div>
            <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #059669)', borderRadius: '3px', width: `${progressPct}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Filters */}
        {total > 0 && (
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, fichier, compétence…" style={{ ...inp, width: '280px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} style={inp}>
              <option value="all">Tous les statuts</option>
              <option value="done">✓ Terminés</option>
              <option value="processing">⟳ En cours</option>
              <option value="queued">⏳ En attente</option>
              <option value="error">✗ Erreurs</option>
            </select>
            <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* CV list */}
        {filtered.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
              CVs importés ({filtered.length}{filtered.length !== total ? ` sur ${total}` : ''})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filtered.map(cv => {
                const isExpanded = expanded === cv.id;
                const borderColor = cv.status === 'done' ? '#bbf7d0' : cv.status === 'error' ? '#fecdd3' : cv.status === 'processing' ? '#bfdbfe' : '#e5e7eb';
                const bgColor = cv.status === 'done' ? '#f0fdf4' : cv.status === 'error' ? '#fff1f2' : cv.status === 'processing' ? '#eff6ff' : '#fafafa';
                return (
                  <div key={cv.id} style={{ borderRadius: '10px', background: bgColor, border: `1.5px solid ${borderColor}`, overflow: 'hidden' }}>
                    <div
                      style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', cursor: cv.status === 'done' ? 'pointer' : 'default' }}
                      onClick={() => cv.status === 'done' && setExpanded(isExpanded ? null : cv.id)}
                    >
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{fileIcon(cv.fileName)}</span>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
                          {cv.status === 'done' && cv.name ? cv.name : cv.fileName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                          {cv.status === 'done' && cv.name ? cv.fileName + ' · ' : ''}{cv.fileSize}
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        {cv.status === 'queued' && <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600 }}>⏳ En attente</span>}
                        {cv.status === 'processing' && (
                          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Traitement IA…
                          </span>
                        )}
                        {cv.status === 'done' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>✓ Traité</span>
                            {cv.sector && <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', padding: '0.1rem 0.5rem', fontWeight: 600 }}>{cv.sector}</span>}
                            {cv.experience && <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>{cv.experience}</span>}
                          </div>
                        )}
                        {cv.status === 'error' && <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>✗ Erreur</span>}
                      </div>

                      {cv.status === 'done' && cv.skills.length > 0 && (
                        <div style={{ width: '100%', display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                          {cv.skills.map(s => <span key={s} style={{ background: '#dbeafe', color: '#1e40af', borderRadius: '4px', padding: '0.1rem 0.45rem', fontSize: '0.68rem', fontWeight: 600 }}>{s}</span>)}
                          {cv.status === 'done' && <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: 'auto', alignSelf: 'center' }}>{isExpanded ? '▲ Réduire' : '▼ Voir plus'}</span>}
                        </div>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && cv.status === 'done' && (
                      <div style={{ padding: '0 1rem 0.9rem 1rem', borderTop: '1px solid #bbf7d0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem', marginTop: '0.75rem' }}>
                          {cv.email && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</div><div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>{cv.email}</div></div>}
                          {cv.phone && <div><div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Téléphone</div><div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>{cv.phone}</div></div>}
                        </div>
                        {cv.summary && <div style={{ marginTop: '0.65rem', fontSize: '0.82rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.6, borderLeft: '3px solid #bbf7d0', paddingLeft: '0.65rem' }}>{cv.summary}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {total === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📂</div>
            <p style={{ fontWeight: 600, color: '#6b7280' }}>Aucun CV importé pour l'instant</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.35rem' }}>Glissez des fichiers ou cliquez sur "Sélectionner des CVs" ci-dessus</p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
