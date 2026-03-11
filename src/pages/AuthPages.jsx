import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, TrendingUp, ArrowRight, BarChart2, Users, ShieldCheck, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

import { authService } from '@/services'
import { useAuthStore } from '@/store/authStore'

/* ─── Spinner inline ──────────────────────────────────────── */
function Spinner() {
  return <span className="spinner w-4 h-4 inline-block" />
}

/* ─── Illustration / panneau gauche ──────────────────────── */
function AuthPanel({ mode }) {
  const features = [
    { icon: BarChart2, label: 'Tableau de bord en temps réel' },
    { icon: TrendingUp, label: 'Suivi des ventes & factures' },
    { icon: Users,      label: 'Gestion d\'équipe simplifiée' },
    { icon: ShieldCheck,label: 'Données sécurisées & fiables' },
  ]

  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0F2D52 0%, #1A4A7A 55%, #E8A020 150%)' }}>

      {/* Cercles décoratifs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-10 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-40 h-40 rounded-full bg-accent/20 pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <TrendingUp size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-2xl leading-none tracking-tight">DIMBA</div>
          <div className="text-[10px] text-white/50 font-mono uppercase tracking-widest mt-0.5">
            Business Manager
          </div>
        </div>
      </div>

      {/* Texte central */}
      <div className="relative z-10 my-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 mb-6 border border-white/15">
          <Zap size={12} className="text-accent" />
          Gestion d'entreprise nouvelle génération
        </div>
        <h2 className="text-4xl font-bold leading-tight mb-4">
          {mode === 'login'
            ? <>Bon retour<br /><span className="text-accent">parmi nous !</span></>
            : <>Démarrez<br /><span className="text-accent">votre aventure.</span></>
          }
        </h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
          Gérez vos factures, votre stock, votre équipe et votre comptabilité depuis une seule plateforme.
        </p>

        {/* Feature list */}
        <ul className="mt-8 flex flex-col gap-3">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-sm text-white/70">
              <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                <Icon size={14} className="text-accent" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <p className="text-white/30 text-xs relative z-10">
        © {new Date().getFullYear()} Dimba · Tous droits réservés
      </p>
    </div>
  )
}

/* ─── Page de Connexion ───────────────────────────────────── */
export function LoginPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore(s => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data)
      toast.success(`Content de vous revoir, ${data.user?.nom?.split(' ')[0] || ''} 👋`)
      navigate('/dashboard')
    },
    onError: (e) => {
      const msg = e.response?.data?.errors?.[0]?.message || 'Identifiants incorrects'
      toast.error(msg)
    },
  })

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-6 py-12 sm:px-10 xl:px-16 bg-surface">
        <div className="max-w-md w-full mx-auto">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-primary text-xl tracking-tight">DIMBA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Connexion</h1>
            <p className="text-sm text-ink-muted">Accédez à votre espace de gestion.</p>
          </div>

          <form onSubmit={handleSubmit(d => mutate(d))} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="label">Adresse e-mail</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email requis',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' }
                })}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Mot de passe requis' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full justify-center mt-1 py-3 text-base"
            >
              {isPending ? <Spinner /> : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-ink-muted mt-8">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-2">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Panneau illustratif */}
      <div className="hidden lg:block lg:w-7/12">
        <AuthPanel mode="login" />
      </div>
    </div>
  )
}

/* ─── Page d'Inscription ──────────────────────────────────── */
export function RegisterPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore(s => s.setAuth)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const pwd = watch('password')

  const { mutate, isPending } = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data)
      toast.success('Compte créé avec succès ! Bienvenue 🎉')
      navigate('/dashboard')
    },
    onError: (e) => {
      const msg = e.response?.data?.errors?.[0]?.message || 'Erreur lors de l\'inscription'
      toast.error(msg)
    },
  })

  const onSubmit = ({ confirmPassword, ...rest }) => mutate(rest)

  return (
    <div className="min-h-screen flex">
      {/* Panneau illustratif */}
      <div className="hidden lg:block lg:w-7/12">
        <AuthPanel mode="register" />
      </div>

      <div className="w-full lg:w-5/12 flex flex-col justify-center px-6 py-12 sm:px-10 xl:px-16 bg-surface overflow-y-auto">
        <div className="max-w-md w-full mx-auto">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-primary text-xl tracking-tight">DIMBA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Créer un compte</h1>
            <p className="text-sm text-ink-muted">Démarrez gratuitement en quelques secondes.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Nom complet */}
            <div>
              <label className="label">Nom complet</label>
              <input
                className={`input ${errors.nom ? 'input-error' : ''}`}
                placeholder="Mamadou Diallo"
                {...register('nom', {
                  required: 'Nom requis',
                  minLength: { value: 2, message: 'Min. 2 caractères' }
                })}
              />
              {errors.nom && <p className="text-xs text-danger mt-1">{errors.nom.message}</p>}
            </div>

            {/* Nom de l'entreprise */}
            <div>
              <label className="label">Nom de votre entreprise</label>
              <input
                className={`input ${errors.tenantNom ? 'input-error' : ''}`}
                placeholder="Diallo & Co."
                {...register('tenantNom', {
                  required: 'Nom de l\'entreprise requis',
                  minLength: { value: 2, message: 'Min. 2 caractères' }
                })}
              />
              {errors.tenantNom && <p className="text-xs text-danger mt-1">{errors.tenantNom.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Adresse e-mail</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email requis',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' }
                })}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 caractères"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', {
                    required: 'Mot de passe requis',
                    minLength: { value: 8, message: 'Min. 8 caractères' }
                  })}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirmation */}
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`input pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Confirmation requise',
                    validate: v => v === pwd || 'Les mots de passe ne correspondent pas'
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full justify-center mt-1 py-3 text-base"
            >
              {isPending ? <Spinner /> : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-ink-muted mt-8">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

