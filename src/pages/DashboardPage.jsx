import { useDashboard } from '@/hooks'
import { formatFCFA } from '@/utils'
import { PageLoader } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, TrendingDown, Package,
  AlertTriangle, Clock, Wallet, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const PIE_COLORS = ['#0F2D52','#E8A020','#1A7A4A','#7C3AED','#CC2200']

function KpiCard({ label, value, icon: Icon, gradient, sub, trend }) {
  return (
    <div className="card flex flex-col gap-3 overflow-hidden relative">
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.06]" style={{ background: gradient }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-1">{label}</div>
          <div className="text-2xl font-bold text-ink font-mono tracking-tight">{value}</div>
          {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold
          ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% vs mois dernier
        </div>
      )}
    </div>
  )
}

function AlertCard({ icon: Icon, label, value, sub, colorClass, bgClass, borderClass }) {
  return (
    <div className={`card flex items-center gap-4 border ${borderClass} ${bgClass}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-[11px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-xl font-bold font-mono text-ink leading-none">{value}</div>
        {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-dark rounded-xl shadow-elevated p-3 text-xs">
      <div className="font-bold text-ink mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}</span>
          <span className="font-mono font-bold">{formatFCFA(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useDashboard()

  if (isLoading) return <PageLoader />

  const d = data || {}

  const chartData = (d.evolution || []).map(e => ({
    mois: e.mois?.substring(5) + '/' + e.mois?.substring(0, 4),
    Recettes: Number(e.recettes || 0),
    Dépenses: Number(e.depenses || 0),
  }))

  const pieData = (d.topDepenses || []).map(t => ({
    name: t.categorie,
    value: Number(t.total || 0),
  }))

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-white font-bold text-base">{user?.nom?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight leading-none">
              Bonjour, {user?.nom?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-ink-muted mt-0.5">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Recettes du mois" value={formatFCFA(d.recettesMois)}
          icon={ArrowUpRight} gradient="linear-gradient(135deg,#1A7A4A,#22C55E)" />
        <KpiCard label="Dépenses du mois" value={formatFCFA(d.depensesMois)}
          icon={ArrowDownRight} gradient="linear-gradient(135deg,#CC2200,#F87171)" />
        <KpiCard label="Bénéfice net" value={formatFCFA(d.beneficeMois)}
          icon={Wallet}
          gradient={Number(d.beneficeMois) >= 0
            ? "linear-gradient(135deg,#0F2D52,#1A4A7A)"
            : "linear-gradient(135deg,#CC2200,#F87171)"} />
        <KpiCard label="Recettes annuelles" value={formatFCFA(d.recettesAnnee)}
          icon={TrendingUp} gradient="linear-gradient(135deg,#E8A020,#F0B840)" />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AlertCard icon={Clock} label="Factures en attente"
          value={d.facturesEnAttente || 0}
          sub={formatFCFA(d.montantEnAttente)}
          colorClass="bg-gradient-to-br from-amber-400 to-amber-500"
          bgClass={d.facturesEnAttente > 0 ? 'bg-amber-50/50' : ''}
          borderClass={d.facturesEnAttente > 0 ? 'border-amber-200' : 'border-white/80'} />
        <AlertCard icon={AlertTriangle} label="Factures en retard"
          value={d.facturesEnRetard || 0}
          sub="À relancer"
          colorClass="bg-gradient-to-br from-danger to-danger/80"
          bgClass={d.facturesEnRetard > 0 ? 'bg-red-50/50' : ''}
          borderClass={d.facturesEnRetard > 0 ? 'border-danger/20' : 'border-white/80'} />
        <AlertCard icon={Package} label="Produits stock bas"
          value={d.produitsStockBas || 0}
          sub="À réapprovisionner"
          colorClass="bg-gradient-to-br from-accent to-accent-light"
          bgClass={d.produitsStockBas > 0 ? 'bg-amber-50/50' : ''}
          borderClass={d.produitsStockBas > 0 ? 'border-accent/20' : 'border-white/80'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-primary">Évolution sur 6 mois</h3>
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block"/>Recettes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger inline-block"/>Dépenses</span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="recettes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1A7A4A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#CC2200" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#CC2200" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#A8A098' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A098' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Recettes" stroke="#1A7A4A" strokeWidth={2.5} fill="url(#recettes)" dot={false} />
                <Area type="monotone" dataKey="Dépenses" stroke="#CC2200" strokeWidth={2.5} fill="url(#depenses)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-ink-faint text-sm gap-2">
              <TrendingUp size={28} className="text-ink-faint/30" />
              Pas encore de données
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-bold text-primary mb-4">Top dépenses du mois</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={65}
                       paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatFCFA(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-ink-muted truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-ink">{formatFCFA(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-ink-faint text-sm gap-2">
              <Package size={24} className="text-ink-faint/30" />
              Pas encore de données
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
