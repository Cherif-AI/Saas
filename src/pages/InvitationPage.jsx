import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { equipeService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { Field, Spinner } from '@/components/ui'
import { TrendingUp, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvitationPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)

  const { data: info, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => equipeService.getInvitationInfo(token),
    retry: false,
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: info?.email || '' }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => equipeService.accepterInvitation(token, data),
    onSuccess: (data) => {
      toast.success(`Bienvenue dans ${data.tenantNom} !`)
      // Rediriger vers login (pas d'auto-auth pour des raisons de sécurité)
      navigate('/login')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })

  const ROLE_LABELS = { GERANT: 'Gérant', COMPTABLE: 'Comptable', CAISSIER: 'Caissier' }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-primary text-2xl leading-none">DIMBA</div>
            <div className="text-[10px] text-ink-faint font-mono uppercase tracking-widest">
              Gérez votre business
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="card text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-danger" />
            </div>
            <h2 className="font-bold text-xl text-primary mb-2">Invitation invalide</h2>
            <p className="text-sm text-ink-muted">
              Ce lien est expiré, invalide ou a déjà été utilisé.
            </p>
            <button className="btn-primary mt-4 mx-auto" onClick={() => navigate('/login')}>
              Aller à la connexion
            </button>
          </div>
        ) : (
          <div className="card">
            {/* Info invitation */}
            <div className="bg-primary/5 rounded-xl p-4 mb-6 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <CheckCircle size={15} />
                Vous avez été invité par {info.invitePar}
              </div>
              <p className="text-xs text-ink-muted">
                Rejoignez <strong>{info.tenantNom}</strong> en tant que{' '}
                <strong>{ROLE_LABELS[info.role]}</strong>.
              </p>
            </div>

            <h1 className="text-xl font-bold text-primary mb-1">Créer votre compte</h1>
            <p className="text-sm text-ink-muted mb-5">
              Renseignez vos informations pour rejoindre l'équipe.
            </p>

            <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-4">
              <Field label="Email" required>
                <input type="email" className="input bg-surface" readOnly
                  defaultValue={info.email}
                  {...register('email')} />
              </Field>
              <Field label="Votre nom complet" error={errors.nom?.message} required>
                <input className={`input ${errors.nom ? 'input-error' : ''}`}
                  placeholder="Fatou Diagne"
                  {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min 2 car.' } })} />
              </Field>
              <Field label="Mot de passe" error={errors.password?.message} required>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Min. 8 caractères"
                    {...register('password', {
                      required: 'Mot de passe requis',
                      minLength: { value: 8, message: 'Min 8 caractères' }
                    })} />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                    onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={isPending}>
                {isPending ? <Spinner size="sm" /> : 'Rejoindre l\'équipe'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
