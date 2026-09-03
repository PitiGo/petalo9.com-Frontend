import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#e2e8f0'
          }}
        >
          <h2 style={{ color: '#fca5a5', marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p style={{ maxWidth: '480px', marginBottom: '1.5rem', color: '#cbd5e1' }}>
            An unexpected error occurred while loading this page. You can try again or return home.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #64ffda',
                background: 'transparent',
                color: '#64ffda',
                cursor: 'pointer'
              }}
            >
              Reload page
            </button>
            <Link
              to="/"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: '#64ffda',
                color: '#0a192f',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
