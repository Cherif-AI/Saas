import { X, AlertTriangle, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils'

// ── Spinner ───────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return <div className={cn('spinner', sizes[size], className)} />
}

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <Spinner size="lg" />
    <span className="text-xs text-ink-faint font-mono uppercase tracking-widest">Chargement...</span>
  </div>
)

// ── Badge statut ──────────────────────────────────────────────
export const StatutBadge = ({ statut, config }) => {
  const c = config[statut]
  if (!c) return null
  return <span className={c.badge}>{c.label}</span>
}

// ── Empty state ───────────────────────────────────────────────
export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-3xl bg-surface-dark/60 flex items-center justify-center mb-5 shadow-sm">
      <Icon size={32} className="text-ink-faint/60" />
    </div>
    <h3 className="font-bold text-ink text-base mb-1.5">{title}</h3>
    {description && <p className="text-sm text-ink-muted mb-6 max-w-xs leading-relaxed">{description}</p>}
    {action}
  </div>
)

// ── Confirm Dialog ────────────────────────────────────────────
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-danger" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">{title}</h3>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">
          <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><Spinner size="sm" /> Suppression...</> : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal wrapper ─────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={cn('modal-box w-full', sizes[size])} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="font-bold text-lg text-ink tracking-tight">{title}</h3>
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-faint hover:text-ink hover:bg-surface-dark transition-all"
            onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Form field wrapper ────────────────────────────────────────
export const Field = ({ label, error, children, required }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="label">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-danger flex items-center gap-1 mt-0.5">
        <span className="w-1 h-1 rounded-full bg-danger flex-shrink-0 inline-block" />
        {error}
      </p>
    )}
  </div>
)

// ── Pagination ────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-2 justify-end mt-5">
      <button
        className="btn-icon w-8 h-8 rounded-xl disabled:opacity-30"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        title="Page précédente"
      >
        <ChevronLeft size={15} />
      </button>
      <span className="text-sm text-ink-muted font-mono bg-surface-dark/60 px-3 py-1.5 rounded-xl">
        <span className="font-bold text-ink">{page + 1}</span>
        <span className="text-ink-faint mx-1">/</span>
        {totalPages}
      </span>
      <button
        className="btn-icon w-8 h-8 rounded-xl disabled:opacity-30"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        title="Page suivante"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
