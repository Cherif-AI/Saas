import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTransactions, useCreateTransaction } from '@/hooks'
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from '@/utils'
import { PageLoader, EmptyState, Modal, Field, Pagination } from '@/components/ui'
import { Calculator, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const CATEGORIES_RECETTE = ['Ventes', 'Prestations', 'Remboursement', 'Autre recette']
const CATEGORIES_DEPENSE = ['Achat stock', 'Loyer', 'Transport', 'Salaires', 'Téléphone', 'Eau/Électricité', 'Marketing', 'Autre dépense']

function TransactionForm({ onClose }) {
  const { mutate, isPending } = useCreateTransaction()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'RECETTE', modePaiement: 'ESPECES', dateTransaction: new Date().toISOString().split('T')[0] }
  })
  const type = watch('type')
  const categories = type === 'RECETTE' ? CATEGORIES_RECETTE : CATEGORIES_DEPENSE

  return (
    <form onSubmit={handleSubmit(d => mutate({ ...d, montant: Number(d.montant) }, { onSuccess: onClose }))}
      className="flex flex-col gap-4">
      <Field label="Type de transaction" required>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: 'RECETTE', label: 'Recette', icon: ArrowUpRight,   desc: 'Argent entrant',  cls: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { v: 'DEPENSE', label: 'Dépense', icon: ArrowDownRight, desc: 'Argent sortant',   cls: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200' },
          ].map(({ v, label, icon: Icon, desc, cls, bg }) => (
            <label key={v} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
              ${type === v ? 'border-primary bg-primary/5 shadow-sm' : 'border-surface-dark hover:border-ink-faint bg-white'}`}>
              <input type="radio" value={v} className="sr-only" {...register('type')} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${type === v ? 'bg-primary/10' : bg}`}>
                <Icon size={18} className={type === v ? 'text-primary' : cls} />
              </div>
              <div>
                <div className={`font-semibold text-sm ${type === v ? 'text-primary' : 'text-ink'}`}>{label}</div>
                <div className="text-xs text-ink-faint">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Catégorie" required>
          <select className="select" {...register('categorie', { required: 'Catégorie requise' })}>
            <option value="">Choisir...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Montant (FCFA)" error={errors.montant?.message} required>
          <input type="number" step="1" min="1" className={`input ${errors.montant ? 'input-error' : ''}`}
            placeholder="25 000"
            {...register('montant', { required: 'Montant requis', min: { value: 1, message: 'Montant > 0' } })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mode de paiement">
          <select className="select" {...register('modePaiement')}>
            {Object.entries(MODE_PAIEMENT_LABELS).map(([k, v]) =>
              <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className="input" {...register('dateTransaction')} />
        </Field>
      </div>

      <Field label="Description">
        <textarea className="input resize-none" rows={2}
          placeholder="Détails de la transaction..."
          {...register('description')} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}

export default function ComptabilitePage() {
  const [page, setPage]             = useState(0)
  const [type, setType]             = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const params = { page, size: 20, ...(type && { type }) }
  const { data, isLoading } = useTransactions(params)
  const transactions = data?.content || []

  const totalRecettes = transactions.filter(t => t.type === 'RECETTE').reduce((s, t) => s + Number(t.montant), 0)
  const totalDepenses = transactions.filter(t => t.type === 'DEPENSE').reduce((s, t) => s + Number(t.montant), 0)
  const solde = totalRecettes - totalDepenses

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Comptabilité</h1>
          <p className="text-sm text-ink-faint mt-1">{data?.totalElements || 0} transaction(s)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Nouvelle transaction
        </button>
      </div>

      {/* Mini KPIs */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Recettes</div>
              <div className="font-mono font-bold text-success text-lg leading-none">{formatFCFA(totalRecettes)}</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <TrendingDown size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Dépenses</div>
              <div className="font-mono font-bold text-danger text-lg leading-none">{formatFCFA(totalDepenses)}</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0
              ${solde >= 0 ? 'bg-gradient-to-br from-primary to-primary-light' : 'bg-gradient-to-br from-rose-500 to-rose-600'}`}>
              <Calculator size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-0.5">Solde page</div>
              <div className={`font-mono font-bold text-lg leading-none ${solde >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatFCFA(solde)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtre */}
      <div className="flex gap-3 mb-6">
        <select className="select w-auto text-sm" value={type} onChange={e => { setType(e.target.value); setPage(0) }}>
          <option value="">Toutes les transactions</option>
          <option value="RECETTE">Recettes uniquement</option>
          <option value="DEPENSE">Dépenses uniquement</option>
        </select>
      </div>

      {isLoading ? <PageLoader /> : transactions.length === 0 ? (
        <EmptyState icon={Calculator} title="Aucune transaction"
          description="Enregistrez vos recettes et dépenses pour suivre votre comptabilité"
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Ajouter une transaction
          </button>} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-base">
              <thead>
                <tr>
                  {['Date', 'Type', 'Catégorie', 'Description', 'Mode', 'Montant'].map(h =>
                    <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="tr-hover">
                    <td className="td text-sm font-mono text-ink-muted">{formatDate(t.dateTransaction)}</td>
                    <td className="td">
                      {t.type === 'RECETTE'
                        ? <span className="badge badge-green"><ArrowUpRight size={10} /> Recette</span>
                        : <span className="badge badge-red"><ArrowDownRight size={10} /> Dépense</span>}
                    </td>
                    <td className="td font-semibold text-sm">{t.categorie}</td>
                    <td className="td text-sm text-ink-muted max-w-[200px] truncate">{t.description || <span className="text-ink-faint text-xs">—</span>}</td>
                    <td className="td">
                      <span className="badge badge-gray text-xs">{MODE_PAIEMENT_LABELS[t.modePaiement] || t.modePaiement}</span>
                    </td>
                    <td className={`td font-mono font-bold text-sm ${t.type === 'RECETTE' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'RECETTE' ? '+' : '−'}{formatFCFA(t.montant)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data?.totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle transaction">
        <TransactionForm onClose={() => setShowCreate(false)} />
      </Modal>
    </div>
  )
}
