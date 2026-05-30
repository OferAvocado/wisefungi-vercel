import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import './index.css'
import App from './App.jsx'
import './i18n';

// Global error handler to catch errors outside React scope (helps debug black screen)
window.addEventListener('error', (event) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#1a0000;color:#ff4444;padding:20px;font-family:monospace;font-size:14px;z-index:9999999;overflow:auto;direction:ltr;text-align:left;';
  errDiv.innerHTML = '<h2 style="color:#ff6666">Runtime Error (onerror)</h2><pre>' + 
    (event.error ? event.error.stack || event.error.message : event.message) + 
    '</pre><small>' + event.filename + ':' + event.lineno + ':' + event.colno + '</small>';
  document.body.appendChild(errDiv);
});

window.addEventListener('unhandledrejection', (event) => {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#001a1a;color:#44ffff;padding:20px;font-family:monospace;font-size:14px;z-index:9999999;overflow:auto;direction:ltr;text-align:left;';
  errDiv.innerHTML = '<h2 style="color:#66ffff">Unhandled Promise Rejection</h2><pre>' + 
    (event.reason ? (event.reason.stack || String(event.reason)) : 'Unknown rejection') + '</pre>';
  document.body.appendChild(errDiv);
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'white', background: 'red', minHeight: '100vh', textAlign: 'left', direction: 'ltr' }}>
          <h1>React ErrorBoundary</h1>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

