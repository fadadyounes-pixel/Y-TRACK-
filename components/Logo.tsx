interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const dims = { sm: 26, md: 34, lg: 46 };
  const heights = { sm: 32, md: 43, lg: 58 };
  const fontSizes = { sm: '0.95rem', md: '1.25rem', lg: '1.75rem' };
  const w = dims[size];
  const h = heights[size];
  const textColor = variant === 'light' ? '#ffffff' : '#0f172a';
  const subColor = variant === 'light' ? 'rgba(255,255,255,0.5)' : '#94a3b8';
  const mapColor = variant === 'light' ? '#93c5fd' : '#2563eb';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg width={w} height={h} viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Map pin outer shape */}
        <path
          d="M20 2C11.16 2 4 9.16 4 18C4 27.78 12.89 36.08 20 48C27.11 36.08 36 27.78 36 18C36 9.16 28.84 2 20 2Z"
          fill="#2563eb"
        />
        {/* White inner circle */}
        <circle cx="20" cy="18" r="11" fill="white" />
        {/* Trending up chart line */}
        <polyline
          points="11,24 15,19 19.5,22 27,13"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Arrow head */}
        <polyline
          points="23.5,13 27,13 27,16.5"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{
            fontSize: fontSizes[size],
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.02em',
          }}>
            Talent<span style={{ color: mapColor }}>Map</span>
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: subColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Recruitment Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
