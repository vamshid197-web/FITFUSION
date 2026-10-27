import React from 'react';

/**
 * Universal Error Boundary to prevent blank white screens
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[FitFusion ErrorBoundary Caught]:', error, errorInfo);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'fitfusion_last_runtime_error',
          JSON.stringify({
            name: error?.name || 'Error',
            message: error?.message || String(error),
            stack: error?.stack || '',
            componentStack: errorInfo?.componentStack || '',
            time: new Date().toISOString()
          })
        );
      }
    } catch {
      // ignore
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-brand-dark max-w-2xl mx-auto shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0">
              ⚠️
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-extrabold text-base text-amber-950">
                {this.props.title || 'Component Temporarily Unavailable'}
              </h3>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                {this.props.message || 'A minor display error occurred while rendering this section. Your order and selections remain completely safe.'}
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg text-left overflow-auto max-h-60">
                  <p className="font-mono font-bold text-xs text-red-900 mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <pre className="font-mono text-[10px] text-red-800 whitespace-pre-wrap break-all leading-tight">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition"
                >
                  Retry Section
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100/50 transition"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
