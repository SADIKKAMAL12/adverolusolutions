import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
          padding: 24,
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
              The app encountered an error. Please refresh the page or check your console for details.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#E8192C',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
