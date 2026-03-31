import React from 'react';
import { logClientError } from '../utils/errorLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[UI_ERROR_BOUNDARY]', error, errorInfo);
    logClientError({
      message: error?.message || 'React render error',
      stack: `${String(error?.stack || '')}\n${String(errorInfo?.componentStack || '')}`,
      source: 'error-boundary'
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrap" role="alert">
          <div className="error-boundary-card">
            <h1 className="error-boundary-title">Something went wrong</h1>
            <p className="error-boundary-text">
              We hit an unexpected error while rendering this page.
            </p>
            <div className="error-boundary-actions">
              <button type="button" className="btn-primary" onClick={this.handleReload}>
                Reload
              </button>
              <button type="button" className="btn-secondary" onClick={this.handleGoHome}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
