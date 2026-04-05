import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <AlertTriangle size={24} style={{ color: '#EF4444' }} />
        </div>
        <p className="font-bold text-base mb-1" style={{ color: '#0A0F1E' }}>
          {this.props.title || 'Something went wrong'}
        </p>
        <p className="text-sm mb-5" style={{ color: '#94A3B8' }}>
          {this.state.error?.message || 'An unexpected error occurred in this panel.'}
        </p>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#5B5FFF,#7C3AED)' }}>
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }
}
