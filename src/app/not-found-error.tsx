// This is a simple server component for the 404 page
export default function NotFoundError() {
  return (
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </head>
      <body style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        color: '#212529'
      }}>
        <div style={{
          maxWidth: '600px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: '0 0 1rem',
            color: '#0d6efd'
          }}>404</h1>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: '0 0 1.5rem',
            color: '#212529'
          }}>Page Not Found</h2>
          <p style={{
            fontSize: '1.1rem',
            margin: '0 0 2rem',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              backgroundColor: '#0d6efd',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: '1.5',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0b5ed7')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0d6efd')}
            onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#0a58ca')}
            onMouseUp={(e) => (e.currentTarget.style.backgroundColor = '#0b5ed7')}
          >
            Go back home
          </a>
        </div>
      </body>
    </html>
  );
}
