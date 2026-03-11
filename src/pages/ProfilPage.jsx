import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Field, PageLoader } from '@/components/ui'
import { Building2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const profilService = {
  get:    () => api.get('/profil').then(r => r.data),
  update: (d) => api.put('/profil', d).then(r => r.data),
}

const PLAN_LABELS = { STARTER: 'Starter — 5 000 FCFA/mois', BUSINESS: 'Business — 15 000 FCFA/mois', PRO: 'Pro — 35 000 FCFA/mois' }

export default function ProfilPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isGerant = user?.role === 'GERANT'

  const { data, isLoading } = useQuery({ queryKey: ['profil'], queryFn: profilService.get })

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm()

  useEffect(() => { if (data) reset(data) }, [data, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: profilService.update,
    onSuccess: (updated) => {
      qc.setQueryData(['profil'], updated)
      toast.success('Profil mis à jour')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil entreprise</h1>
          <p className="text-sm text-ink-muted mt-1">Ces informations apparaissent sur vos PDFs.</p>
        </div>
      </div>

      {/* Plan actuel */}
      <div className="card mb-6 flex items-center gap-4 bg-primary/5 border-primary/20">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-primary" />
        </div>
        <div>
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wide">Plan actuel</div>
          <div className="font-bold text-primary">{PLAN_LABELS[data?.plan] || data?.plan}</div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card">
        <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-5">
          <Field label="Nom de l'entreprise" error={errors.nom?.message} required>
            <input className={`input ${errors.nom ? 'input-error' : ''}`}
              disabled={!isGerant}
              {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min 2 car.' } })} />
          </Field>

          <Field label="Email (identifiant de connexion)">
            <input className="input bg-surface cursor-not-allowed" readOnly value={data?.email || ''} />
            <p className="text-xs text-ink-faint mt-1">L'email ne peut pas être modifié.</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone">
              <input className="input" placeholder="+221 33 000 00 00"
                disabled={!isGerant}
                {...register('telephone')} />
            </Field>
            <Field label="Adresse">
              <input className="input" placeholder="Dakar, Point E"
                disabled={!isGerant}
                {...register('adresse')} />
            </Field>
          </div>

          {isGerant && (
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={isPending || !isDirty}>
                {isPending ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          )}
          {!isGerant && (
            <p className="text-xs text-ink-faint italic">Seul le gérant peut modifier ces informations.</p>
          )}
        </form>
      </div>

      {/* Exports */}
      <div className="card mt-6">
        <h2 className="font-bold text-primary mb-4">Exporter mes données</h2>
        <div className="flex gap-3 flex-wrap">
          <a href="/api/v1/export/factures.csv" className="btn-ghost btn-sm" download>
            <Download size={14} /> Factures CSV
          </a>
          <a href="/api/v1/export/transactions.csv" className="btn-ghost btn-sm" download>
            <Download size={14} /> Transactions CSV
          </a>
        </div>
        <p className="text-xs text-ink-faint mt-3">
          Les exports incluent toutes vos données. Compatible Excel et Google Sheets.
        </p>
      </div>
    </div>
  )
}
