interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', showText = true, variant = 'dark' }: LogoProps) {
  const dims = { sm: 32, md: 42, lg: 58 };
  const fontSizes = { sm: '1.1rem', md: '1.4rem', lg: '2rem' };
  const d = dims[size];
  const textColor = variant === 'light' ? '#ffffff' : '#0a1f5c';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* New logo: bold T letterform with Moroccan star accent */}
      <svg width={d} height={d} viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background rounded square */}
        <rect width="58" height="58" rx="14" fill="#0a1f5c" />

        {/* Bold "T" shape */}
        <rect x="10" y="12" width="38" height="7" rx="3.5" fill="#38bdf8" />
        <rect x="24" y="12" width="10" height="30" rx="3.5" fill="white" />

        {/* Yellow underline / ground line */}
        <rect x="10" y="42" width="38" height="4" rx="2" fill="#facc15" />

        {/* Small Moroccan star dots */}
        <circle cx="18" cy="34" r="2.5" fill="#facc15" />
        <circle cx="40" cy="34" r="2.5" fill="#38bdf8" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{
            fontSize: fontSizes[size],
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.03em',
          }}>
            T3mel
          </span>
          {size !== 'sm' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: variant === 'light' ? 'rgba(255,255,255,0.6)' : '#6b7280',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Recruitment · المغرب
            </span>
          )}
        </div>
      )}
    </div>
  );
}
