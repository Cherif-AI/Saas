import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAlertesStock } from '@/hooks'
import {
  LayoutDashboard, FileText, Package, Calculator,
  Users, Users2, LogOut, TrendingUp, Menu, X,
  ChevronRight, Bell
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord', color: 'from-blue-400 to-blue-600' },
  { to: '/factures',     icon: FileText,         label: 'Factures & Devis', color: 'from-violet-400 to-violet-600' },
  { to: '/clients',      icon: Users,            label: 'Clients', color: 'from-emerald-400 to-emerald-600' },
  { to: '/stock',        icon: Package,          label: 'Stock', color: 'from-orange-400 to-orange-600' },
  { to: '/comptabilite', icon: Calculator,       label: 'Comptabilité', color: 'from-pink-400 to-pink-600' },
  { to: '/equipe',       icon: Users2,           label: 'Équipe', color: 'from-cyan-400 to-cyan-600' },
]

function SidebarContent({ onNavigate, user, alertes, handleLogout }) {
  const nb = alertes?.length || 0

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0F2D52 0%, #081C35 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-xl leading-none tracking-tight">DIMBA</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Business Manager</div>
          </div>
        </div>
      </div>

      {/* Alerte stock */}
      {nb > 0 && (
        <div className="mx-3 mt-3 flex items-center gap-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2.5">
          <Bell size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-300 font-semibold flex-1">{nb} alerte{nb > 1 ? 's' : ''} stock</span>
          <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{nb}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-2">Navigation</div>
        {NAV.map(({ to, icon: Icon, label, color }) => (
          <NavLink key={to} to={to} onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              }`
            }>
            {({ isActive }) => (
              <>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                  ${isActive ? `bg-gradient-to-br ${color} shadow-md` : 'bg-white/8 group-hover:bg-white/12'}`}>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'} />
                </span>
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-white/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-3 border-t border-white/10">
        <NavLink to="/profil" onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/8 transition-all group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-sm">{user?.nom?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white/90 truncate">{user?.nom}</div>
            <div className="text-[10px] text-white/40 truncate">{user?.tenantNom || user?.role}</div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); handleLogout() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Se déconnecter">
            <LogOut size={14} />
          </button>
        </NavLink>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user, logout }            = useAuthStore()
  const navigate                    = useNavigate()
  const { data: alertes }           = useAlertesStock()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0EEE9' }}>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col shadow-2xl">
        <SidebarContent user={user} alertes={alertes} handleLogout={handleLogout} onNavigate={null} />
      </aside>

      {/* SIDEBAR MOBILE */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <X size={15} />
            </button>
            <SidebarContent user={user} alertes={alertes} handleLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-dark shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="font-bold text-primary tracking-tight">DIMBA</span>
          </div>
          <button className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-ink-muted hover:bg-surface-dark transition-all"
            onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
