interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const scale = {
    sm: { icon: 28, titleSize: '1.1rem', subSize: '0.55rem', gap: '0.5rem' },
    md: { icon: 36, titleSize: '1.4rem', subSize: '0.6rem', gap: '0.65rem' },
    lg: { icon: 48, titleSize: '1.75rem', subSize: '0.65rem', gap: '0.85rem' },
  }[size];

  const isDark = variant === 'dark';
  const circleFill = isDark ? '#ffffff' : 'rgba(255,255,255,0.15)';
  const titleColor = isDark ? '#111827' : '#ffffff';
  const accentColor = isDark ? '#2563eb' : '#93c5fd';
  const subColor = isDark ? '#6b7280' : 'rgba(255,255,255,0.6)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: scale.gap }}>
      <svg width={scale.icon} height={scale.icon} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <path d="M16 2C9.4 2 4 7.4 4 14c0 9 12 16 12 16s12-7 12-16c0-6.6-5.4-12-12-12z" fill="#2563eb" />
        <circle cx="16" cy="14" r="7.5" fill={circleFill} />
        <polyline points="10.5,16.5 14,12.5 16.5,14.8 20.5,9.5" stroke="#2563eb" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17.2,9.5 20.5,9.5 20.5,12.8" stroke="#2563eb" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontSize: scale.titleSize, fontWeight: 800, color: titleColor, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            Talent<span style={{ color: accentColor }}>Map</span>
          </span>
          <span style={{ fontSize: scale.subSize, fontWeight: 600, color: subColor, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
            Recruitment Platform
          </span>
        </div>
      )}
    </div>
  );
}
