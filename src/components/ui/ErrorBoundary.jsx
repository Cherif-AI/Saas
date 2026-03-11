import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

// ── Error Boundary (erreurs JS non catchées) ──────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Dimba ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-danger" />
          </div>
          <h1 className="text-xl font-bold text-primary mb-2">Une erreur est survenue</h1>
          <p className="text-sm text-ink-muted mb-6">
            L'application a rencontré un problème inattendu.
            {this.state.error?.message && (
              <span className="block mt-1 font-mono text-xs text-ink-faint">
                {this.state.error.message}
              </span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="btn-ghost"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={14} /> Recharger
            </button>
            <Link to="/dashboard" className="btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}>
              <Home size={14} /> Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

// ── Page 404 ──────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-black text-primary/10 font-mono mb-4">404</div>
        <h1 className="text-xl font-bold text-primary mb-2">Page introuvable</h1>
        <p className="text-sm text-ink-muted mb-6">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home size={14} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
