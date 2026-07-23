import Logo from './Logo';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      background: '#0B1629',
      padding: '0 1.5rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,.07)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Logo size="md" variant="light" />
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,.12)' }} />
          <div>
            <h1 style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,.45)', margin: '1px 0 0', lineHeight: 1 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
