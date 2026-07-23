interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const scale = {
    sm: { icon: 26, titleSize: '1rem',   subSize: '0.5rem',  gap: '0.45rem' },
    md: { icon: 32, titleSize: '1.25rem', subSize: '0.55rem', gap: '0.6rem' },
    lg: { icon: 42, titleSize: '1.6rem',  subSize: '0.6rem',  gap: '0.75rem' },
  }[size];

  const isDark = variant === 'dark';
  const titleColor  = isDark ? '#0B1629' : '#FFFFFF';
  const accentColor = isDark ? '#1B4FD8' : '#93C5FD';
  const subColor    = isDark ? '#64748B' : 'rgba(255,255,255,0.55)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: scale.gap }}>
      {/* Map-pin icon with upward chart */}
      <svg width={scale.icon} height={scale.icon} viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
        {/* Pin body */}
        <path
          d="M18 3C11.9 3 7 7.9 7 14c0 8.5 11 18.5 11 18.5S29 22.5 29 14c0-6.1-4.9-11-11-11z"
          fill={isDark ? '#1B4FD8' : '#3B82F6'}
        />
        {/* Inner white circle */}
        <circle cx="18" cy="14" r="7" fill={isDark ? '#FFFFFF' : 'rgba(255,255,255,0.92)'} />
        {/* Upward trend line */}
        <polyline
          points="11.5,17 15,12.5 17.5,15 22.5,9.5"
          stroke={isDark ? '#1B4FD8' : '#2563EB'}
          strokeWidth="1.9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arrow head top-right */}
        <polyline
          points="19.5,9.5 22.5,9.5 22.5,12.5"
          stroke={isDark ? '#1B4FD8' : '#2563EB'}
          strokeWidth="1.9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: scale.titleSize,
            fontWeight: 800,
            color: titleColor,
            letterSpacing: '-0.03em',
            whiteSpace: 'nowrap',
          }}>
            Talent<span style={{ color: accentColor }}>Map</span>
          </span>
          <span style={{
            fontSize: scale.subSize,
            fontWeight: 600,
            color: subColor,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '1px',
          }}>
            Recruitment
          </span>
        </div>
      )}
    </div>
  );
}
