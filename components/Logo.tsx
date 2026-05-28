interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const dims = { sm: 28, md: 36, lg: 52 };
  const fontSizes = { sm: '1rem', md: '1.25rem', lg: '1.75rem' };
  const d = dims[size];
  const textColor = variant === 'light' ? '#ffffff' : '#1a3a8f';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <svg width={d} height={d} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="26" cy="26" r="26" fill="#1a3a8f" />

        {/* Bridge arch */}
        <path
          d="M8 34 Q26 12 44 34"
          stroke="#38bdf8"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Bridge deck */}
        <line x1="6" y1="34" x2="46" y2="34" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />

        {/* Bridge pillars */}
        <line x1="26" y1="22" x2="26" y2="34" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="17" y1="28" x2="17" y2="34" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="28" x2="35" y2="34" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

        {/* Sparkle / AI star top */}
        <circle cx="26" cy="18" r="2.5" fill="#facc15" />
        <line x1="26" y1="14" x2="26" y2="22" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="18" x2="30" y2="18" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23.2" y1="15.2" x2="28.8" y2="20.8" stroke="#facc15" strokeWidth="1" strokeLinecap="round" />
        <line x1="28.8" y1="15.2" x2="23.2" y2="20.8" stroke="#facc15" strokeWidth="1" strokeLinecap="round" />

        {/* People dots on bridge */}
        <circle cx="17" cy="31.5" r="2" fill="white" />
        <circle cx="26" cy="31.5" r="2" fill="white" />
        <circle cx="35" cy="31.5" r="2" fill="white" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{
            fontSize: fontSizes[size],
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.02em',
          }}>
            T3<span style={{ color: '#38bdf8' }}>mel</span>
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: variant === 'light' ? 'rgba(255,255,255,0.7)' : '#6b7280',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Recruitment
            </span>
          )}
        </div>
      )}
    </div>
  );
}
