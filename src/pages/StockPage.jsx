import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  useProduits, useAlertesStock,
  useCreateProduit, useUpdateProduit, useAddMouvement
} from '@/hooks'
import { formatFCFA } from '@/utils'
import { PageLoader, EmptyState, Modal, Field, Pagination } from '@/components/ui'
import { Package, Plus, Pencil, ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, AlertTriangle } from 'lucide-react'

// ── Formulaire produit ────────────────────────────────────────
function ProduitForm({ initial, onSubmit, isPending, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Nom" error={errors.nom?.message} required>
        <input className={`input ${errors.nom ? 'input-error' : ''}`}
          placeholder="Riz 50kg"
          {...register('nom', { required: 'Nom requis' })} />
      </Field>
      <Field label="Description">
        <textarea className="input resize-none" rows={2}
          {...register('description')} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix unitaire (FCFA)" required>
          <input type="number" step="1" className="input"
            {...register('prixUnitaire', { required: 'Prix requis', min: 0 })} />
        </Field>
        <Field label="Unité">
          <input className="input" placeholder="kg, unité, L..."
            {...register('unite')} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stock actuel">
          <input type="number" className="input" {...register('stockActuel', { min: 0 })} />
        </Field>
        <Field label="Seuil d'alerte">
          <input type="number" className="input" {...register('stockMinimum', { min: 0 })} />
        </Field>
      </div>
      <Field label="Catégorie">
        <input className="input" placeholder="Alimentation, Électronique..."
          {...register('categorie')} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Enregistrement...' : initial ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

// ── Formulaire mouvement ──────────────────────────────────────
function MouvementForm({ produit, onClose }) {
  const { mutate, isPending } = useAddMouvement()
  const { register, handleSubmit, watch } = useForm({ defaultValues: { type: 'ENTREE', quantite: 1 } })
  const type = watch('type')

  return (
    <div>
      <div className="bg-surface rounded-xl p-3 mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{produit.nom}</div>
          <div className="text-xs text-ink-muted">Stock actuel : <span className={`font-bold font-mono ${produit.stockBas ? 'text-danger' : 'text-success'}`}>{produit.stockActuel} {produit.unite}</span></div>
        </div>
        {produit.stockBas && (
          <div className="flex items-center gap-1 text-xs text-accent font-semibold">
            <AlertTriangle size={13} /> Stock bas
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(d => mutate({ id: produit.id, data: { ...d, quantite: Number(d.quantite) } }, { onSuccess: onClose }))}
        className="flex flex-col gap-4">
        <Field label="Type de mouvement" required>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: 'ENTREE', label: 'Entrée', icon: ArrowUpCircle, color: 'text-success' },
              { v: 'SORTIE', label: 'Sortie', icon: ArrowDownCircle, color: 'text-danger' },
              { v: 'AJUSTEMENT', label: 'Ajustement', icon: SlidersHorizontal, color: 'text-primary' },
            ].map(({ v, label, icon: Icon, color }) => (
              <label key={v} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all
                ${type === v ? 'border-primary bg-primary/5' : 'border-surface-dark hover:border-ink-faint'}`}>
                <input type="radio" value={v} className="sr-only" {...register('type')} />
                <Icon size={18} className={type === v ? 'text-primary' : color} />
                <span className="text-xs font-semibold text-ink">{label}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={type === 'AJUSTEMENT' ? 'Nouveau stock total' : 'Quantité'} required>
          <input type="number" step="1" min="1" className="input"
            {...register('quantite', { required: true, min: 1 })} />
        </Field>
        <Field label="Motif">
          <input className="input" placeholder="Livraison fournisseur, vente..."
            {...register('motif')} />
        </Field>
        <Field label="Référence">
          <input className="input" placeholder="BL-001, CMD-123..."
            {...register('reference')} />
        </Field>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Enregistrement...' : 'Valider le mouvement'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Page stock ────────────────────────────────────────────────
export default function StockPage() {
  const [page, setPage]           = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [editProduit, setEdit]    = useState(null)
  const [mouvProduit, setMouv]    = useState(null)
  const [showAlertes, setShowAlertes] = useState(false)

  const { data, isLoading }       = useProduits({ page, size: 20 })
  const { data: alertes }         = useAlertesStock()
  const { mutate: create, isPending: creating } = useCreateProduit()
  const { mutate: update, isPending: updating } = useUpdateProduit()

  const produits  = data?.content || []
  const nbAlertes = alertes?.length || 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock</h1>
          <p className="text-sm text-ink-muted mt-1">{data?.totalElements || 0} produit(s)</p>
        </div>
        <div className="flex gap-2">
          {nbAlertes > 0 && (
            <button className="btn-accent btn-sm" onClick={() => setShowAlertes(true)}>
              <AlertTriangle size={14} /> {nbAlertes} alerte{nbAlertes > 1 ? 's' : ''}
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nouveau produit
          </button>
        </div>
      </div>

      {isLoading ? <PageLoader /> : produits.length === 0 ? (
        <EmptyState icon={Package} title="Aucun produit"
          description="Ajoutez vos produits pour gérer votre stock"
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Ajouter un produit
          </button>} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-base">
              <thead>
                <tr>
                  {['Produit', 'Catégorie', 'Prix unitaire', 'Stock', 'Seuil alerte', 'État', 'Actions'].map(h =>
                    <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {produits.map(p => (
                  <tr key={p.id} className="tr-hover">
                    <td className="td">
                      <div className="font-semibold text-sm">{p.nom}</div>
                      {p.description && <div className="text-xs text-ink-faint truncate max-w-[200px]">{p.description}</div>}
                    </td>
                    <td className="td text-sm text-ink-muted">{p.categorie || '—'}</td>
                    <td className="td font-mono font-semibold text-sm">{formatFCFA(p.prixUnitaire)}</td>
                    <td className="td">
                      <span className={`font-mono font-bold text-lg ${p.stockBas ? 'text-danger' : 'text-success'}`}>
                        {p.stockActuel}
                      </span>
                      <span className="text-xs text-ink-faint ml-1">{p.unite}</span>
                    </td>
                    <td className="td font-mono text-sm text-ink-muted">{p.stockMinimum} {p.unite}</td>
                    <td className="td">
                      {p.stockBas
                        ? <span className="badge badge-red"><AlertTriangle size={10} /> Stock bas</span>
                        : <span className="badge badge-green">OK</span>}
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button className="btn-icon" title="Mouvement de stock" onClick={() => setMouv(p)}>
                          <ArrowUpCircle size={14} />
                        </button>
                        <button className="btn-icon" title="Modifier" onClick={() => setEdit(p)}>
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data?.totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau produit">
        <ProduitForm onClose={() => setShowCreate(false)} isPending={creating}
          onSubmit={d => create(d, { onSuccess: () => setShowCreate(false) })} />
      </Modal>

      <Modal open={!!editProduit} onClose={() => setEdit(null)} title="Modifier le produit">
        <ProduitForm initial={editProduit} onClose={() => setEdit(null)} isPending={updating}
          onSubmit={d => update({ id: editProduit.id, data: d }, { onSuccess: () => setEdit(null) })} />
      </Modal>

      <Modal open={!!mouvProduit} onClose={() => setMouv(null)} title="Mouvement de stock">
        {mouvProduit && <MouvementForm produit={mouvProduit} onClose={() => setMouv(null)} />}
      </Modal>

      {/* Modal alertes */}
      <Modal open={showAlertes} onClose={() => setShowAlertes(false)} title={`Alertes stock (${nbAlertes})`}>
        <div className="flex flex-col gap-3">
          {(alertes || []).map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
              <div>
                <div className="font-semibold text-sm">{p.nom}</div>
                <div className="text-xs text-ink-muted">Seuil : {p.stockMinimum} {p.unite}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-danger font-mono text-lg">{p.stockActuel}</div>
                <div className="text-xs text-ink-faint">{p.unite} restant{p.stockActuel > 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
