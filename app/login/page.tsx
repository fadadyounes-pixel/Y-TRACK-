'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const NAVY = '#0a1f5c';
const BLUE = '#2563eb';
const SKY  = '#38bdf8';
const WH   = '#ffffff';
const GR   = '#6b7280';
const RE   = '#ef4444';

const roleColors: Record<string, string> = {
  admin: '#9B59B6',
  coordinator: '#22c55e',
  candidate: BLUE,
};
const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  coordinator: 'Coordinateur',
  candidate: 'Candidat',
};

function detectRole(id: string): string | null {
  const v = id.trim().toUpperCase();
  if (v.startsWith('ADMIN')) return 'admin';
  if (v.startsWith('COORD')) return 'coordinator';
  if (v.startsWith('CAN')) return 'candidate';
  return null;
}

export default function LoginPage() {
  const [id, setId] = useState('');
  const [err, setErr] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const liveRole = id.trim() ? detectRole(id) : null;
  const borderColor = liveRole ? (roleColors[liveRole] ?? RE) : 'rgba(255,255,255,.15)';

  function handleLogin() {
    const ok = login(id);
    if (!ok) { setErr(true); return; }
    const role = detectRole(id);
    if (role === 'admin') router.push('/admin');
    else if (role === 'coordinator') router.push('/coordinator');
    else router.push('/candidate');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg,${NAVY} 0%,#1a3a8f 60%,#0e2d6b 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
      fontFamily: "'Poppins',sans-serif",
    }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', left: -100, bottom: -100, width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(37,99,235,.18)', filter: 'blur(80px)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: -80, top: -80, width: 350, height: 350,
        borderRadius: '50%', background: 'rgba(56,189,248,.12)', filter: 'blur(80px)', pointerEvents: 'none' }}/>

      <div style={{
        background: 'rgba(10,31,92,.95)', borderRadius: 24,
        padding: '40px 32px', width: '100%', maxWidth: 420,
        border: '1px solid rgba(56,189,248,.2)', boxShadow: '0 0 80px rgba(0,0,0,.5)',
        position: 'relative', zIndex: 5,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `linear-gradient(135deg,${BLUE},${SKY})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: WH, boxShadow: '0 4px 16px rgba(37,99,235,.4)',
            }}>T</div>
            <span style={{ fontSize: 28, fontWeight: 900, color: WH, letterSpacing: '-.5px' }}>TalentMap</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: 12, marginBottom: 32 }}>
          Plateforme intelligente de gestion des talents
        </p>

        <label style={{ display: 'block', fontSize: 9, fontWeight: 700,
          color: 'rgba(255,255,255,.4)', marginBottom: 7, letterSpacing: 1, textTransform: 'uppercase' }}>
          Votre identifiant
        </label>

        <input
          value={id}
          onChange={e => { setId(e.target.value.toUpperCase()); setErr(false); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="ADMIN001 · COORD001 · CAN001"
          maxLength={20}
          autoFocus
          style={{
            width: '100%', padding: '14px 16px',
            background: 'rgba(255,255,255,.05)',
            border: `2px solid ${err ? RE : borderColor}`,
            borderRadius: 12, fontSize: 15, fontFamily: 'monospace',
            color: WH, marginBottom: liveRole ? 8 : 14,
            transition: 'border-color .2s', letterSpacing: 1, boxSizing: 'border-box',
          }}/>

        {liveRole && !err && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
            padding: '6px 12px', borderRadius: 8,
            background: roleColors[liveRole] + '18',
            border: `1px solid ${roleColors[liveRole]}30` }}>
            <span style={{ fontSize: 14 }}>
              {liveRole === 'admin' ? '⚙️' : liveRole === 'coordinator' ? '👔' : '🎓'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: roleColors[liveRole] }}>
              {roleLabels[liveRole]}
            </span>
          </div>
        )}

        {err && <p style={{ color: RE, fontSize: 12, marginBottom: 12 }}>Identifiant non reconnu. Vérifiez votre code d'accès.</p>}

        <button onClick={handleLogin} disabled={!id.trim()} style={{
          width: '100%', padding: 16,
          background: liveRole && !err
            ? `linear-gradient(135deg,${roleColors[liveRole]},${roleColors[liveRole]}cc)`
            : `linear-gradient(135deg,${BLUE},${NAVY})`,
          color: WH, border: 'none', borderRadius: 12,
          fontSize: 15, fontWeight: 800, cursor: 'pointer',
          opacity: !id.trim() ? .5 : 1, transition: 'all .18s',
          boxSizing: 'border-box',
        }}>
          Accéder →
        </button>

        {/* Demo IDs */}
        <div style={{ marginTop: 28, padding: '14px 16px', background: 'rgba(255,255,255,.04)',
          borderRadius: 12, border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Identifiants de démonstration</div>
          {[
            { id: 'ADMIN001', role: 'Admin', color: '#9B59B6' },
            { id: 'COORD001', role: 'Coordinateur', color: '#22c55e' },
            { id: 'CAN001 · CAN002 · CAN003', role: 'Candidat', color: BLUE },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,.6)', letterSpacing: .5 }}>{x.id}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: x.color }}>{x.role}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
        fontSize: 11, color: 'rgba(255,255,255,.2)', fontFamily: "'Poppins',sans-serif" }}>
        © 2026 TalentMap — Y-TRACK
      </p>
    </div>
  );
}
