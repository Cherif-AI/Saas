import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipeService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/utils'
import { PageLoader, EmptyState, Modal, Field, ConfirmModal } from '@/components/ui'
import { Users, Plus, UserX, Shield, Clock, CheckCircle, XCircle, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_LABELS = { GERANT: 'Gérant', COMPTABLE: 'Comptable', CAISSIER: 'Caissier' }
const ROLE_COLORS = { GERANT: 'badge-blue', COMPTABLE: 'badge-yellow', CAISSIER: 'badge-gray' }

function InviterForm({ onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'CAISSIER' } })

  const { mutate, isPending, data: result } = useMutation({
    mutationFn: equipeService.inviter,
    onSuccess: () => qc.invalidateQueries(['equipe']),
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  if (result) {
    const link = `${window.location.origin}/register/invitation/${result.token}`
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
            <CheckCircle size={16} />
            Invitation créée pour {result.email}
          </div>
          <p className="text-xs text-green-600">
            Partagez ce lien avec votre collaborateur. Il expirera dans 7 jours.
          </p>
        </div>
        <div>
          <label className="label">Lien d'invitation</label>
          <div className="flex gap-2">
            <input className="input font-mono text-xs flex-1" value={link} readOnly />
            <button className="btn-primary btn-sm" onClick={() => {
              navigator.clipboard.writeText(link)
              toast.success('Lien copié !')
            }}>
              <Copy size={13} /> Copier
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="btn-ghost" onClick={onClose}>Fermer</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">
      <Field label="Email du collaborateur" error={errors.email?.message} required>
        <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
          placeholder="comptable@email.sn"
          {...register('email', {
            required: 'Email requis',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' }
          })} />
      </Field>
      <Field label="Rôle" required>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ROLE_LABELS).map(([v, label]) => {
            const descs = {
              GERANT: 'Accès complet',
              COMPTABLE: 'Factures + compta',
              CAISSIER: 'Factures + stock'
            }
            return (
              <label key={v} className="flex flex-col gap-1 p-3 rounded-xl border-2 border-surface-dark hover:border-primary cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" value={v} className="sr-only" {...register('role')} />
                <span className="font-bold text-sm text-ink">{label}</span>
                <span className="text-xs text-ink-muted">{descs[v]}</span>
              </label>
            )
          })}
        </div>
      </Field>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Envoi...' : 'Créer l\'invitation'}
        </button>
      </div>
    </form>
  )
}

export default function EquipePage() {
  const { user: currentUser } = useAuthStore()
  const isGerant = currentUser?.role === 'GERANT'

  const [showInviter, setShowInviter] = useState(false)
  const [desactiverUser, setDesactiver] = useState(null)

  const qc = useQueryClient()
  const { data: membres = [], isLoading: loadM } = useQuery({
    queryKey: ['equipe', 'membres'],
    queryFn: equipeService.findMembres,
  })
  const { data: invitations = [], isLoading: loadI } = useQuery({
    queryKey: ['equipe', 'invitations'],
    queryFn: equipeService.findInvitations,
    enabled: isGerant,
  })

  const { mutate: desactiver, isPending: desactivating } = useMutation({
    mutationFn: equipeService.desactiver,
    onSuccess: () => {
      qc.invalidateQueries(['equipe'])
      setDesactiver(null)
      toast.success('Membre désactivé')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  const { mutate: annuler } = useMutation({
    mutationFn: equipeService.annulerInvitation,
    onSuccess: () => { qc.invalidateQueries(['equipe']); toast.success('Invitation annulée') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  if (loadM) return <PageLoader />

  const pendingInvitations = invitations.filter(i => i.enAttente)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Équipe</h1>
          <p className="text-sm text-ink-muted mt-1">{membres.length} membre(s)</p>
        </div>
        {isGerant && (
          <button className="btn-primary" onClick={() => setShowInviter(true)}>
            <Plus size={16} /> Inviter un membre
          </button>
        )}
      </div>

      {/* Membres */}
      <div className="card mb-6">
        <h2 className="font-bold text-primary mb-4">Membres actifs</h2>
        <div className="flex flex-col divide-y divide-surface-dark">
          {membres.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  ${m.actif ? 'bg-primary/10 text-primary' : 'bg-surface-dark text-ink-faint'}`}>
                  {m.nom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{m.nom}</span>
                    {m.email === currentUser?.email && (
                      <span className="text-[10px] text-ink-faint font-mono">(vous)</span>
                    )}
                    {!m.actif && <span className="badge badge-gray text-[10px]">Désactivé</span>}
                  </div>
                  <div className="text-xs text-ink-muted">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${ROLE_COLORS[m.role]}`}>
                  {ROLE_LABELS[m.role] || m.role}
                </span>
                {isGerant && m.email !== currentUser?.email && m.actif && (
                  <button className="btn-icon hover:bg-red-50 hover:text-danger"
                    title="Désactiver" onClick={() => setDesactiver(m)}>
                    <UserX size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invitations en attente */}
      {isGerant && (
        <div className="card">
          <h2 className="font-bold text-primary mb-4">
            Invitations en attente
            {pendingInvitations.length > 0 && (
              <span className="ml-2 badge badge-yellow">{pendingInvitations.length}</span>
            )}
          </h2>

          {loadI ? null : pendingInvitations.length === 0 ? (
            <p className="text-sm text-ink-faint italic">Aucune invitation en attente</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingInvitations.map(inv => {
                const link = `${window.location.origin}/register/invitation/${inv.token}`
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-surface-dark">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock size={14} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{inv.email}</div>
                        <div className="text-xs text-ink-muted">
                          Rôle : {ROLE_LABELS[inv.role]} · Expire le {formatDate(inv.expiresAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-ghost btn-sm" onClick={() => {
                        navigator.clipboard.writeText(link)
                        toast.success('Lien copié !')
                      }}>
                        <Copy size={12} /> Copier lien
                      </button>
                      <button className="btn-icon hover:bg-red-50 hover:text-danger"
                        onClick={() => annuler(inv.id)} title="Annuler">
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Modal open={showInviter} onClose={() => setShowInviter(false)} title="Inviter un collaborateur">
        <InviterForm onClose={() => setShowInviter(false)} />
      </Modal>

      <ConfirmModal
        open={!!desactiverUser}
        onClose={() => setDesactiver(null)}
        onConfirm={() => desactiver(desactiverUser.id)}
        loading={desactivating}
        title="Désactiver le membre"
        message={`${desactiverUser?.nom} ne pourra plus se connecter à Dimba.`}
      />
    </div>
  )
}
