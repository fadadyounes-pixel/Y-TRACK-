'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';

const INK    = '#0B1629';
const COBALT = '#1B4FD8';
const BG     = '#F6F8FC';
const BORDER = '#E2E8F0';
const TEXT   = '#0F172A';
const MUTED  = '#64748B';
const FAINT  = '#94A3B8';
const LBLUE  = '#EFF6FF';
const WHITE  = '#ffffff';
const PURPLE = '#7C3AED';
const LPURP  = '#EDE9FE';
const GREEN  = '#059669';
const LGREEN = '#D1FAE5';

export default function CandidateDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();
  const [info, setInfo]       = useState<Record<string, any> | null>(null);
  const [cvData, setCvData]   = useState<Record<string, any> | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, initialized, router]);

  useEffect(() => {
    if (!user) return;
    let infoData: Record<string, any> | null = null;
    try { const s = localStorage.getItem(`tm_info_${user.idNumber}`); if (s) { infoData = JSON.parse(s); setInfo(infoData); } } catch {}
    try { const c = localStorage.getItem(`tm_cv_${user.idNumber}`);   if (c) setCvData(JSON.parse(c)); } catch {}
    if (!infoData || !infoData.firstName) { router.push('/candidate/info'); }
  }, [user]);

  if (!initialized || !user || user.role !== 'candidate') return null;

  const firstName      = info?.firstName || user.name.split(' ')[0] || 'Candidat';
  const skills: string[] = cvData?.skills || info?.skills || [];
  const hasProfile     = !!info?.phone || !!info?.city;
  const hasCV          = !!(cvData?.skills?.length || cvData?.summary);
  const completionSteps   = [hasProfile, hasCV, false];
  const completedCount    = completionSteps.filter(Boolean).length;

  const TOOLS = [
    {
      id: 'email',
      icon: '✉️',
      title: 'Lettre de Candidature',
      sub: 'Outil IA · Guidé étape par étape',
      desc: "Répondez à 4 questions simples. L'IA rédige pour vous une lettre professionnelle prête à envoyer.",
      href: '/candidate/email',
      accent: PURPLE,
      light: LPURP,
      badge: 'Nouveau',
      badgeColor: PURPLE,
      cta: 'Créer ma lettre →',
      featured: true,
    },
    {
      id: 'cv',
      icon: '📄',
      title: 'Mon CV',
      sub: 'Créer · Améliorer · Télécharger',
      desc: "Importez votre CV ou créez-en un depuis zéro. L'IA l'améliore et l'adapte à chaque offre.",
      href: '/candidate/upload',
      accent: COBALT,
      light: LBLUE,
      badge: hasCV ? '✓ CV créé' : null,
      badgeColor: GREEN,
      cta: hasCV ? 'Mettre à jour mon CV →' : 'Créer mon CV →',
      featured: false,
    },
    {
      id: 'jobs',
      icon: '🎯',
      title: "Offres d'Emploi",
      sub: 'Compatibilité · Matching IA',
      desc: "Consultez les postes disponibles et découvrez votre score de compatibilité grâce à l'IA.",
      href: '/candidate/upload',
      accent: GREEN,
      light: LGREEN,
      badge: null,
      badgeColor: null,
      cta: 'Voir les offres →',
      featured: false,
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: BG, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: INK,
        height: 60,
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,.06)',
        boxShadow: '0 2px 16px rgba(0,0,0,.35)',
      }}>
        <Logo size="md" variant="light" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 9999,
            padding: '0.3rem 0.9rem 0.3rem 0.45rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: `linear-gradient(135deg,${COBALT},${PURPLE})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: WHITE,
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <span style={{ color: 'rgba(255,255,255,.88)', fontSize: '0.82rem', fontWeight: 600 }}>{firstName}</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,.45)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 8,
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color .15s',
              fontFamily: 'inherit',
            }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${INK} 0%, #162347 55%, ${COBALT} 100%)`,
          borderRadius: 20,
          padding: '2.25rem 2.5rem',
          marginBottom: '2rem',
          color: WHITE,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `rgba(124,58,237,.22)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 100, width: 120, height: 120, borderRadius: '50%', background: `rgba(27,79,216,.28)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '0.4rem' }}>
              Espace Candidat
            </p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Bonjour, {firstName} 👋
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,.72)', marginBottom: '1.75rem', maxWidth: 460, lineHeight: 1.6 }}>
              Vos outils IA pour trouver un emploi — simples, guidés, et adaptés à votre profil.
            </p>
            {/* Progress pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {([['👤', 'Profil', hasProfile], ['📄', 'CV', hasCV], ['✉️', 'Lettre', false]] as [string, string, boolean][]).map(([icon, label, done], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.75rem', borderRadius: 9999,
                  background: done ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.08)',
                  border: `1px solid ${done ? 'rgba(16,185,129,.4)' : 'rgba(255,255,255,.12)'}`,
                }}>
                  <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: done ? '#6ee7b7' : 'rgba(255,255,255,.6)' }}>{label}</span>
                  {done && <span style={{ fontSize: '0.65rem', color: '#6ee7b7' }}>✓</span>}
                </div>
              ))}
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.35)', marginLeft: 'auto' }}>
                {completedCount}/3 complété{completedCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── Section heading ── */}
        <p style={{ fontSize: '0.72rem', fontWeight: 800, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.9rem' }}>
          Vos Outils IA
        </p>

        {/* ── Tool cards ── */}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginBottom: '2rem' }}>
          {TOOLS.map(tool => (
            <Link
              key={tool.id}
              href={tool.href}
              style={{ textDecoration: 'none', display: 'block' }}
              onMouseEnter={() => setHovered(tool.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                borderRadius: 16,
                padding: tool.featured ? '1.75rem' : '1.5rem',
                background: tool.featured
                  ? `linear-gradient(145deg, ${tool.accent}12, ${tool.accent}06)`
                  : WHITE,
                border: `1.5px solid ${hovered === tool.id || tool.featured ? tool.accent + '30' : BORDER}`,
                boxShadow: hovered === tool.id
                  ? `0 10px 36px ${tool.accent}1a`
                  : tool.featured
                  ? `0 4px 24px ${tool.accent}14`
                  : '0 1px 4px rgba(0,0,0,.05)',
                transition: 'all .2s ease',
                transform: hovered === tool.id ? 'translateY(-3px)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                cursor: 'pointer',
              }}>
                {/* Corner accent for featured */}
                {tool.featured && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 80, height: 80, borderRadius: '0 16px 0 80px',
                    background: `${tool.accent}10`,
                    pointerEvents: 'none',
                  }} />
                )}
                {/* Icon + badge row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: tool.featured ? tool.accent : tool.light,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, flexShrink: 0,
                    boxShadow: tool.featured ? `0 4px 14px ${tool.accent}38` : 'none',
                  }}>
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span style={{
                      padding: '0.18rem 0.6rem',
                      borderRadius: 9999,
                      background: `${tool.badgeColor}14`,
                      color: tool.badgeColor!,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.08em',
                      border: `1px solid ${tool.badgeColor}28`,
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: TEXT, marginBottom: '0.2rem', lineHeight: 1.3 }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: tool.accent, marginBottom: '0.65rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                  {tool.sub}
                </p>
                <p style={{ fontSize: '0.875rem', color: MUTED, lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  {tool.desc}
                </p>
                {/* CTA */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 9,
                  background: tool.featured ? tool.accent : `${tool.accent}10`,
                  color: tool.featured ? WHITE : tool.accent,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all .2s',
                }}>
                  {tool.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Profile summary strip ── */}
        <div style={{
          background: WHITE,
          borderRadius: 16,
          padding: '1.35rem 1.5rem',
          border: `1.5px solid ${BORDER}`,
          boxShadow: '0 1px 4px rgba(0,0,0,.04)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: '1 1 200px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `linear-gradient(135deg,${INK},${COBALT})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: WHITE, flexShrink: 0,
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: TEXT, fontSize: '0.95rem', lineHeight: 1.3 }}>{user.name}</p>
              <p style={{ fontSize: '0.78rem', color: MUTED }}>{user.email}</p>
              <p style={{ fontSize: '0.72rem', color: FAINT, marginTop: '0.1rem' }}>CIN: {user.idNumber}</p>
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ flex: '2 1 200px' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: FAINT, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                Compétences
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {skills.slice(0, 7).map((s: string) => (
                  <span key={s} style={{
                    padding: '0.2rem 0.65rem', borderRadius: 9999,
                    background: LBLUE, color: COBALT,
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>{s}</span>
                ))}
                {skills.length > 7 && (
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: 9999, background: '#F1F5F9', color: MUTED, fontSize: '0.75rem', fontWeight: 600 }}>
                    +{skills.length - 7}
                  </span>
                )}
              </div>
            </div>
          )}

          <Link href="/candidate/info" style={{
            padding: '0.55rem 1rem',
            borderRadius: 9,
            background: '#F8FAFC',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
            border: `1.5px solid ${BORDER}`,
            whiteSpace: 'nowrap' as const,
            transition: 'border-color .15s',
          }}>
            👤 Mon Profil
          </Link>
        </div>
      </div>
    </main>
  );
}
