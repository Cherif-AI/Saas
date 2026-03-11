import { useDashboard } from '@/hooks'
import { formatFCFA } from '@/utils'
import { PageLoader } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Package,
  AlertTriangle, Clock, CheckCircle
} from 'lucide-react'

const PIE_COLORS = ['#0F2D52','#E8A020','#1A7A4A','#7C3AED','#CC2200']

function StatCard({ label, value, icon: Icon, color = 'text-primary', sub, trend }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-label">{label}</div>
          <div className={`stat-value mt-1 ${color}`}>{value}</div>
          {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${color === 'text-success' ? 'bg-green-100' :
            color === 'text-danger' ? 'bg-red-100' : 'bg-primary/8'}`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold mt-2
          ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% vs mois dernier
        </div>
      )}
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
      <div className="mb-6">
        <h1 className="page-title">
          Bonjour, {user?.nom?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Recettes du mois"
          value={formatFCFA(d.recettesMois)}
          icon={TrendingUp}
          color="text-success"
        />
        <StatCard
          label="Dépenses du mois"
          value={formatFCFA(d.depensesMois)}
          icon={TrendingDown}
          color="text-danger"
        />
        <StatCard
          label="Bénéfice du mois"
          value={formatFCFA(d.beneficeMois)}
          icon={TrendingUp}
          color={Number(d.beneficeMois) >= 0 ? 'text-success' : 'text-danger'}
        />
        <StatCard
          label="Recettes annuelles"
          value={formatFCFA(d.recettesAnnee)}
          icon={TrendingUp}
          color="text-primary"
        />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`card flex items-center gap-4 ${d.facturesEnRetard > 0 ? 'border-danger/40 bg-red-50' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Clock size={18} className="text-yellow-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wide">Factures en attente</div>
            <div className="text-xl font-bold text-primary font-mono">{d.facturesEnAttente || 0}</div>
            <div className="text-xs text-ink-muted">{formatFCFA(d.montantEnAttente)}</div>
          </div>
        </div>

        <div className={`card flex items-center gap-4 ${d.facturesEnRetard > 0 ? 'border-danger/40 bg-red-50' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wide">Factures en retard</div>
            <div className="text-xl font-bold text-danger font-mono">{d.facturesEnRetard || 0}</div>
            <div className="text-xs text-ink-muted">À relancer</div>
          </div>
        </div>

        <div className={`card flex items-center gap-4 ${d.produitsStockBas > 0 ? 'border-accent/40 bg-yellow-50' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Package size={18} className="text-accent" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wide">Stock bas</div>
            <div className="text-xl font-bold text-accent font-mono">{d.produitsStockBas || 0}</div>
            <div className="text-xs text-ink-muted">Produits à réapprovisionner</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Évolution 6 mois */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-primary mb-4">Évolution sur 6 mois</h3>
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
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#7A7060' }} />
                <YAxis tick={{ fontSize: 10, fill: '#7A7060' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Recettes" stroke="#1A7A4A" strokeWidth={2} fill="url(#recettes)" />
                <Area type="monotone" dataKey="Dépenses" stroke="#CC2200" strokeWidth={2} fill="url(#depenses)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-ink-faint text-sm">
              Pas encore de données
            </div>
          )}
        </div>

        {/* Top dépenses */}
        <div className="card">
          <h3 className="font-bold text-primary mb-4">Top dépenses du mois</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                       paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatFCFA(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-ink-muted truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-ink">{formatFCFA(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-ink-faint text-sm">
              Pas encore de données
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
