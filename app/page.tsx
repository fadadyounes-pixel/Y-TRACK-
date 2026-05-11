export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#333' }}>
        Y-TRACK Admin Dashboard
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
        A multi-tenant Monitoring & Evaluation system for youth platforms
      </p>
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '1.5rem', 
        borderRadius: '8px',
        maxWidth: '600px'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#444' }}>
          API Status
        </h2>
        <p style={{ color: '#666' }}>
          The backend API is running at <code style={{ 
            backgroundColor: '#e0e0e0', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px' 
          }}>/api/v1</code>
        </p>
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Health check: <code style={{ 
            backgroundColor: '#e0e0e0', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px' 
          }}>/health</code>
        </p>
      </div>
    </main>
  );
}
