import Logo from './Logo';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 100%)',
      padding: '1.5rem 0',
      marginBottom: '0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Logo size="md" variant="light" />
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
