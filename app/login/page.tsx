'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  coordinator: '/coordinator',
  candidate: '/candidate',
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = login(idNumber);

    if (!success) {
      setError('ID not recognized. Please check and try again.');
      setIsLoading(false);
      return;
    }

    // Read the role back from localStorage to determine redirect
    try {
      const stored = localStorage.getItem('talentmap_user');
      if (stored) {
        const user = JSON.parse(stored);
        const route = ROLE_ROUTES[user.role as UserRole] ?? '/';
        router.push(route);
        return;
      }
    } catch {
      // fallback
    }

    setIsLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '0.25rem' }}>
          <Logo size="lg" showText variant="dark" />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              margin: '0 0 0.4rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#0a1f5c',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to TalentMap
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            Enter your ID number to access the platform
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* ID Number field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label
              htmlFor="idNumber"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0a1f5c',
              }}
            >
              ID Number
            </label>
            <input
              id="idNumber"
              type="text"
              value={idNumber}
              onChange={(e) => {
                setIdNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. ADMIN001"
              autoComplete="off"
              autoFocus
              style={{
                padding: '0.85rem 1rem',
                fontSize: '1.05rem',
                border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                color: '#0f172a',
                background: '#f8fafc',
                transition: 'border-color 0.15s',
                width: '100%',
                boxSizing: 'border-box',
                letterSpacing: '0.04em',
              }}
              onFocus={(e) => {
                if (!error) e.currentTarget.style.borderColor = '#2563eb';
              }}
              onBlur={(e) => {
                if (!error) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.65rem 0.9rem',
                fontSize: '0.875rem',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span aria-hidden>&#9888;</span>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || idNumber.trim() === ''}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              background:
                isLoading || idNumber.trim() === '' ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '10px',
              cursor:
                isLoading || idNumber.trim() === '' ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, transform 0.1s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && idNumber.trim() !== '')
                e.currentTarget.style.background = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              if (!isLoading && idNumber.trim() !== '')
                e.currentTarget.style.background = '#2563eb';
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo IDs */}
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#94a3b8',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Demo:&nbsp;
          <span style={{ color: '#0a1f5c', fontWeight: 600 }}>ADMIN001</span>
          &nbsp;&middot;&nbsp;
          <span style={{ color: '#0a1f5c', fontWeight: 600 }}>COORD001</span>
          &nbsp;&middot;&nbsp;
          <span style={{ color: '#0a1f5c', fontWeight: 600 }}>CAN001</span>
          &nbsp;&middot;&nbsp;
          <span style={{ color: '#0a1f5c', fontWeight: 600 }}>CAN002</span>
          &nbsp;&middot;&nbsp;
          <span style={{ color: '#0a1f5c', fontWeight: 600 }}>CAN003</span>
        </p>
      </div>
    </div>
  );
}
