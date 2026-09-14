'use client';

import Logo from './Logo';
import Icon, { type IconName } from './Icon';
import { useAuth } from '../contexts/AuthContext';

interface PageHeaderProps {
  // Portal label shown next to the logo (e.g. "Admin Portal") — the logo
  // itself already renders the "TalentMap" wordmark, so this must never
  // repeat it.
  label: string;
  icon?: IconName;
}

export default function PageHeader({ label, icon }: PageHeaderProps) {
  const { logout } = useAuth();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
      padding: '1.1rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Logo size="md" variant="light" />
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {icon && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={icon} size={17} color="#93c5fd" />
              </div>
            )}
            <span style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}>
              {label}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1.1rem',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
