interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const dims = { sm: 32, md: 40, lg: 56 };
  const fontSizes = { sm: '1rem', md: '1.3rem', lg: '1.85rem' };
  const d = dims[size];
  const textColor = variant === 'light' ? '#ffffff' : '#0a1f5c';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
      <svg width={d} height={d} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background rounded square */}
        <rect width="56" height="56" rx="13" fill="#0a1f5c" />

        {/* Path road — two converging lines (perspective) */}
        <path d="M10 46 L28 16 L46 46" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dashed centre line of the path */}
        <line x1="28" y1="44" x2="28" y2="34" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
        <line x1="28" y1="29" x2="28" y2="22" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />

        {/* Yellow star / destination at top of path */}
        <circle cx="28" cy="13" r="4" fill="#facc15" />
        <path d="M28 10 L29 12 L31 12 L29.5 13.5 L30.2 15.5 L28 14.2 L25.8 15.5 L26.5 13.5 L25 12 L27 12 Z"
              fill="#0a1f5c" />

        {/* Steps / milestones on path */}
        <circle cx="21" cy="38" r="2.5" fill="white" />
        <circle cx="28" cy="30" r="2.5" fill="#38bdf8" />
        <circle cx="35" cy="38" r="2.5" fill="white" />

        {/* Ground bar */}
        <rect x="8" y="46" width="40" height="3.5" rx="1.75" fill="#facc15" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{
            fontSize: fontSizes[size],
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.025em',
          }}>
            Career <span style={{ color: '#38bdf8' }}>Pathway</span>
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: variant === 'light' ? 'rgba(255,255,255,0.55)' : '#9ca3af',
              letterSpacing: '0.12em',
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
