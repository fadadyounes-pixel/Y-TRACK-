'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload CVs' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/matches', label: 'Matches' },
  { href: '/candidates', label: 'Candidates' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Link href="/">
          <Logo size="md" />
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: pathname === link.href ? '#1d4ed8' : '#374151',
                background: pathname === link.href ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/upload" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
            + Upload CV
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '4px',
              padding: '6px',
              background: 'none',
            }}
            className="hamburger"
          >
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', borderRadius: 2 }} />
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', borderRadius: 2 }} />
            <span style={{ width: 22, height: 2, background: '#374151', display: 'block', borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          background: 'white',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: pathname === link.href ? '#1d4ed8' : '#374151',
                background: pathname === link.href ? '#eff6ff' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
