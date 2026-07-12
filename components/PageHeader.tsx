import Logo from './Logo';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
      padding: '1.5rem',
      minHeight: '64px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
        <Logo size="md" variant="light" />
        <div style={{ marginLeft: '1.25rem', paddingLeft: '1.25rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
