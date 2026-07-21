'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function CandidateDashboard() {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();
  const [info, setInfo] = useState<Record<string, any> | null>(null);
  const [cvData, setCvData] = useState<Record<string, any> | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, initialized, router]);

  useEffect(() => {
    if (!user) return;
    try {
      const s = localStorage.getItem(`tm_info_${user.idNumber}`);
      if (s) setInfo(JSON.parse(s));
    } catch {}
    try {
      const c = localStorage.getItem(`tm_cv_${user.idNumber}`);
      if (c) setCvData(JSON.parse(c));
    } catch {}
  }, [user]);

  if (!initialized || !user || user.role !== 'candidate') return null;

  const firstName = info?.firstName || user.name.split(' ')[0] || 'Candidat';
  const skills: string[] = cvData?.skills || info?.skills || [];
  const hasProfile = !!info?.phone || !!info?.city;
  const hasCV = !!(cvData?.skills?.length || cvData?.summary);
  const completionSteps = [hasProfile, hasCV, false];
  const completedCount = completionSteps.filter(Boolean).length;

  const TOOLS = [
    {
      id: 'email',
      icon: '✉️',
      title: 'Écrire une Lettre de Candidature',
      sub: 'Outil IA · Guidé étape par étape',
      desc: "Répondez à 4 questions simples. L'IA rédige pour vous une lettre professionnelle prête à envoyer en quelques secondes.",
      href: '/candidate/email',
      accent: '#7c3aed',
      light: '#f5f3ff',
      badge: 'Nouveau',
      badgeColor: '#7c3aed',
      cta: 'Créer ma lettre →',
      featured: true,
    },
    {
      id: 'cv',
      icon: '📄',
      title: 'Mon CV',
      sub: 'Créer · Améliorer · Télécharger',
      desc: "Importez votre CV ou créez-en un depuis zéro. L'IA l'améliore automatiquement et l'adapte à chaque offre d'emploi.",
      href: '/candidate/upload',
      accent: '#2563eb',
      light: '#eff6ff',
      badge: hasCV ? '✓ CV créé' : null,
      badgeColor: '#059669',
      cta: hasCV ? 'Mettre à jour mon CV →' : 'Créer mon CV →',
      featured: false,
    },
    {
      id: 'jobs',
      icon: '🎯',
      title: 'Offres d\'Emploi',
      sub: 'Compatibilité · Matching IA',
      desc: 'Consultez les postes disponibles et découvrez votre score de compatibilité avec chaque offre grâce à l\'IA.',
      href: '/candidate/upload',
      accent: '#059669',
      light: '#ecfdf5',
      badge: null,
      badgeColor: null,
      cta: 'Voir les offres →',
      featured: false,
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        background: '#0a1f5c',
        height: 60,
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 16px rgba(10,31,92,.45)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>🗺️</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>TalentMap</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(255,255,255,.1)',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 9999,
            padding: '0.3rem 0.75rem 0.3rem 0.4rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: '#fff',
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <span style={{ color: 'rgba(255,255,255,.9)', fontSize: '0.82rem', fontWeight: 600 }}>{firstName}</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,.55)',
              border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 8,
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color .15s',
            }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>

        {/* ── Hero banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 55%, #2563eb 100%)',
          borderRadius: 20,
          padding: '2.25rem 2.5rem',
          marginBottom: '2rem',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(124,58,237,.28)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 100, width: 120, height: 120, borderRadius: '50%', background: 'rgba(37,99,235,.35)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: '0.4rem' }}>
              Espace Candidat
            </p>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
              Bonjour, {firstName} 👋
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,.75)', marginBottom: '1.75rem', maxWidth: 460, lineHeight: 1.6 }}>
              Vos outils IA pour trouver un emploi — simples, guidés, et adaptés à votre profil.
            </p>
            {/* Progress pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['👤','Profil', hasProfile], ['📄','CV', hasCV], ['✉️','Lettre', false]].map(([icon, label, done], i) => (
                <div key={i as number} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.75rem', borderRadius: 9999,
                  background: done ? 'rgba(16,185,129,.25)' : 'rgba(255,255,255,.1)',
                  border: `1px solid ${done ? 'rgba(16,185,129,.5)' : 'rgba(255,255,255,.15)'}`,
                }}>
                  <span style={{ fontSize: '0.75rem' }}>{icon as string}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: done ? '#6ee7b7' : 'rgba(255,255,255,.65)' }}>{label as string}</span>
                  {done && <span style={{ fontSize: '0.65rem', color: '#6ee7b7' }}>✓</span>}
                </div>
              ))}
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.4)', marginLeft: 'auto' }}>
                {completedCount}/3 complété{completedCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── AI Tools heading ── */}
        <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.9rem' }}>
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
                  ? `linear-gradient(145deg, ${tool.accent}14, ${tool.accent}06)`
                  : '#fff',
                border: `2px solid ${hovered === tool.id || tool.featured ? tool.accent + '35' : '#e5e7eb'}`,
                boxShadow: hovered === tool.id
                  ? `0 10px 36px ${tool.accent}22`
                  : tool.featured
                  ? `0 4px 24px ${tool.accent}18`
                  : '0 1px 6px rgba(0,0,0,.06)',
                transition: 'all .2s ease',
                transform: hovered === tool.id ? 'translateY(-4px)' : 'none',
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
                    background: `${tool.accent}12`,
                    pointerEvents: 'none',
                  }} />
                )}
                {/* Icon + badge row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: tool.featured ? tool.accent : tool.light,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                    boxShadow: tool.featured ? `0 4px 16px ${tool.accent}40` : 'none',
                  }}>
                    {tool.icon}
                  </div>
                  {tool.badge && (
                    <span style={{
                      padding: '0.18rem 0.6rem',
                      borderRadius: 9999,
                      background: `${tool.badgeColor}18`,
                      color: tool.badgeColor!,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.08em',
                      border: `1px solid ${tool.badgeColor}30`,
                    }}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: tool.accent, marginBottom: '0.65rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                  {tool.sub}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  {tool.desc}
                </p>
                {/* CTA */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 9,
                  background: tool.featured ? tool.accent : `${tool.accent}12`,
                  color: tool.featured ? '#fff' : tool.accent,
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
          background: '#fff',
          borderRadius: 16,
          padding: '1.35rem 1.5rem',
          border: '1.5px solid #e5e7eb',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: '1 1 200px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0a1f5c,#2563eb)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0,
            }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', lineHeight: 1.3 }}>{user.name}</p>
              <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{user.email}</p>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.1rem' }}>CIN: {user.idNumber}</p>
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ flex: '2 1 200px' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                Compétences
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {skills.slice(0, 7).map((s: string) => (
                  <span key={s} style={{
                    padding: '0.2rem 0.65rem', borderRadius: 9999,
                    background: '#eff6ff', color: '#1d4ed8',
                    fontSize: '0.75rem', fontWeight: 600,
                  }}>{s}</span>
                ))}
                {skills.length > 7 && (
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: 9999, background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>
                    +{skills.length - 7}
                  </span>
                )}
              </div>
            </div>
          )}

          <Link href="/candidate/info" style={{
            padding: '0.55rem 1rem',
            borderRadius: 9,
            background: '#f3f4f6',
            color: '#374151',
            fontSize: '0.82rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
            border: '1.5px solid #e5e7eb',
            whiteSpace: 'nowrap' as const,
          }}>
            👤 Mon Profil
          </Link>
        </div>
      </div>
    </main>
  );
}
