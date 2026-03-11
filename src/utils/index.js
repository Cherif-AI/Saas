import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// ── Formatage FCFA ────────────────────────────────────────────
export const formatFCFA = (amount) => {
  if (amount === null || amount === undefined) return '0 FCFA'
  return new Intl.NumberFormat('fr-SN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount)) + ' FCFA'
}

// ── Formatage dates ───────────────────────────────────────────
export const formatDate = (date, fmt = 'dd/MM/yyyy') => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt, { locale: fr })
  } catch { return '—' }
}

export const formatDatetime = (date) => formatDate(date, 'dd/MM/yyyy HH:mm')

// ── Statut facture ────────────────────────────────────────────
export const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente',  badge: 'badge-yellow' },
  PAYEE:      { label: 'Payée',       badge: 'badge-green'  },
  EN_RETARD:  { label: 'En retard',   badge: 'badge-red'    },
  BROUILLON:  { label: 'Brouillon',   badge: 'badge-gray'   },
  ANNULEE:    { label: 'Annulée',     badge: 'badge-gray'   },
}

export const TYPE_CONFIG = {
  FACTURE: { label: 'Facture', badge: 'badge-blue' },
  DEVIS:   { label: 'Devis',   badge: 'badge-gray' },
}

export const MOUVEMENT_CONFIG = {
  ENTREE:      { label: 'Entrée',      color: 'text-success', icon: '+' },
  SORTIE:      { label: 'Sortie',      color: 'text-danger',  icon: '-' },
  AJUSTEMENT:  { label: 'Ajustement',  color: 'text-primary', icon: '~' },
}

export const MODE_PAIEMENT_LABELS = {
  ESPECES:      'Espèces',
  WAVE:         'Wave',
  ORANGE_MONEY: 'Orange Money',
  VIREMENT:     'Virement',
  CHEQUE:       'Chèque',
  AUTRE:        'Autre',
}

// ── Classes CSS utiles ────────────────────────────────────────
export const cn = (...classes) => classes.filter(Boolean).join(' ')
