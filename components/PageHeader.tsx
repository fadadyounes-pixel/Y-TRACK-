'use client';

import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
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
          <div>
            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0', lineHeight: 1.2 }}>
                {subtitle}
              </p>
            )}
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
