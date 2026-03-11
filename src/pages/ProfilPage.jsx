import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Field, PageLoader } from '@/components/ui'
import { Building2, Download, User, Mail, Phone, MapPin, FileSpreadsheet, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const profilService = {
  get:    () => api.get('/profil').then(r => r.data),
  update: (d) => api.put('/profil', d).then(r => r.data),
}

const PLAN_CONFIG = {
  STARTER:  { label: 'Starter',  price: '5 000 FCFA/mois',  color: 'text-ink-muted',  bg: 'bg-surface-dark' },
  BUSINESS: { label: 'Business', price: '15 000 FCFA/mois', color: 'text-primary',     bg: 'bg-primary/10'   },
  PRO:      { label: 'Pro',      price: '35 000 FCFA/mois', color: 'text-accent-dark', bg: 'bg-accent/10'    },
}

export default function ProfilPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isGerant = user?.role === 'GERANT'

  const { data, isLoading } = useQuery({ queryKey: ['profil'], queryFn: profilService.get })
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm()
  useEffect(() => { if (data) reset(data) }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: profilService.update,
    onSuccess: (updated) => { qc.setQueryData(['profil'], updated); toast.success('Profil mis à jour') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  if (isLoading) return <PageLoader />

  const plan = PLAN_CONFIG[data?.plan] || PLAN_CONFIG.STARTER

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Profil entreprise</h1>
        <p className="text-sm text-ink-muted mt-1">Ces informations apparaissent sur vos factures PDF.</p>
      </div>

      {/* Bannière plan */}
      <div className={`card mb-6 flex items-center gap-4 border-2 ${plan.bg} border-transparent`}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Plan actuel</div>
          <div className={`font-bold text-lg leading-none ${plan.color}`}>{plan.label}</div>
          <div className="text-xs text-ink-muted mt-0.5">{plan.price}</div>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-surface-dark rounded-xl px-3 py-1.5">
          <Shield size={12} className="text-success" />
          <span className="text-xs font-semibold text-success">Actif</span>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card">
        <h2 className="font-bold text-primary mb-5 flex items-center gap-2">
          <User size={16} /> Informations de l'entreprise
        </h2>

        <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-5">
          <Field label="Nom de l'entreprise" error={errors.nom?.message} required>
            <input className={`input ${errors.nom ? 'input-error' : ''} ${!isGerant ? 'bg-surface cursor-not-allowed' : ''}`}
              disabled={!isGerant}
              {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min 2 car.' } })} />
          </Field>

          <Field label="Email (identifiant de connexion)">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input className="input pl-9 bg-surface cursor-not-allowed" readOnly value={data?.email || ''} />
            </div>
            <p className="text-xs text-ink-faint mt-1">L'email ne peut pas être modifié.</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input className={`input pl-9 ${!isGerant ? 'bg-surface cursor-not-allowed' : ''}`}
                  placeholder="+221 33 000 00 00" disabled={!isGerant}
                  {...register('telephone')} />
              </div>
            </Field>
            <Field label="Adresse">
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input className={`input pl-9 ${!isGerant ? 'bg-surface cursor-not-allowed' : ''}`}
                  placeholder="Dakar, Point E" disabled={!isGerant}
                  {...register('adresse')} />
              </div>
            </Field>
          </div>

          {isGerant ? (
            <div className="flex justify-end pt-2 border-t border-surface-dark mt-2">
              <button type="submit" className="btn-primary" disabled={isPending || !isDirty}>
                {isPending ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-surface-dark text-xs text-ink-muted">
              <Shield size={13} className="text-ink-faint flex-shrink-0" />
              Seul le gérant peut modifier ces informations.
            </div>
          )}
        </form>
      </div>

      {/* Exports */}
      <div className="card mt-6">
        <h2 className="font-bold text-primary mb-2 flex items-center gap-2">
          <FileSpreadsheet size={16} /> Exporter mes données
        </h2>
        <p className="text-xs text-ink-muted mb-4">Compatible Excel et Google Sheets.</p>
        <div className="flex gap-3 flex-wrap">
          <a href="/api/v1/export/factures.csv" className="btn-ghost btn-sm" download>
            <Download size={14} /> Factures CSV
          </a>
          <a href="/api/v1/export/transactions.csv" className="btn-ghost btn-sm" download>
            <Download size={14} /> Transactions CSV
          </a>
        </div>
      </div>
    </div>
  )
}
