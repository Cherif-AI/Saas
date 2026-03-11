import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAlertesStock } from '@/hooks'
import {
  LayoutDashboard, FileText, Package, Calculator,
  Users, Users2, LogOut, TrendingUp, Menu, X
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/factures',     icon: FileText,         label: 'Factures & Devis' },
  { to: '/clients',      icon: Users,            label: 'Clients' },
  { to: '/stock',        icon: Package,          label: 'Stock' },
  { to: '/comptabilite', icon: Calculator,       label: 'Comptabilité' },
  { to: '/equipe',       icon: Users2,           label: 'Équipe' },
]

function SidebarContent({ onNavigate, user, alertes, handleLogout }) {
  const nb = alertes?.length || 0
  return (
    <>
      <div className="p-5 border-b border-surface-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-primary text-lg leading-none">DIMBA</div>
            <div className="text-[10px] text-ink-faint font-mono uppercase tracking-widest">Gestion PME</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onNavigate}
            className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}>
            <span className="link-icon">
              <Icon size={17} />
            </span>
            <span className="flex-1">{label}</span>
            {label === 'Stock' && nb > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{nb}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-surface-dark">
        <NavLink to="/profil" onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white shadow-card hover:shadow-elevated transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">{user?.nom?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{user?.nom}</div>
            <div className="text-[10px] text-ink-faint font-mono truncate">{user?.role}</div>
          </div>
          <button onClick={(e) => { e.preventDefault(); handleLogout() }}
            className="text-ink-faint hover:text-danger transition-colors p-1" title="Se déconnecter">
            <LogOut size={15} />
          </button>
        </NavLink>
        {user?.tenantNom && (
          <p className="text-[10px] text-ink-faint text-center mt-2 font-mono truncate px-2">
            {user.tenantNom} · {user.plan}
          </p>
        )}
      </div>
    </>
  )
}

export default function AppLayout() {
  const { user, logout }            = useAuthStore()
  const navigate                    = useNavigate()
  const { data: alertes }           = useAlertesStock()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-surface-dark border-r border-surface-dark/80 flex-col">
        <SidebarContent user={user} alertes={alertes} handleLogout={handleLogout} onNavigate={null} />
      </aside>

      {/* SIDEBAR MOBILE DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 flex flex-col bg-surface-dark border-r border-surface-dark/80 shadow-elevated">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 btn-icon z-10">
              <X size={16} />
            </button>
            <SidebarContent user={user} alertes={alertes} handleLogout={handleLogout}
              onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-dark shadow-card flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="font-bold text-primary">DIMBA</span>
          </div>
          <button className="btn-icon" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
        </header>

        <main className="flex-1 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  )
}
