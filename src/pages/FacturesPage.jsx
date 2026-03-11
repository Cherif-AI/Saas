import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  useFactures, useCreateFacture, useUpdateStatutFacture,
  useDeleteFacture, useClients, useProduits
} from '@/hooks'
import { factureService } from '@/services'
import { formatFCFA, formatDate, STATUT_CONFIG, TYPE_CONFIG } from '@/utils'
import {
  PageLoader, EmptyState, Modal, ConfirmModal,
  Field, Pagination, StatutBadge
} from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Trash2, Download, Eye, X } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Formulaire nouvelle facture ───────────────────────────────
function FactureForm({ onSuccess }) {
  const { data: clientsData } = useClients({ size: 100 })
  const { data: produitsData } = useProduits({ size: 100 })
  const { mutate } = useCreateFacture()

  const clients  = clientsData?.content || []
  const produits = produitsData?.content || []

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      type: 'FACTURE',
      tauxTva: 18,
      lignes: [{ designation: '', quantite: 1, prixUnitaire: 0, remisePct: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const lignes = watch('lignes')

  const total = lignes.reduce((sum, l) => {
    const ht = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
    const remise = ht * (Number(l.remisePct) || 0) / 100
    return sum + (ht - remise)
  }, 0)

  const tva = watch('tauxTva')
  const ttc = total + total * Number(tva) / 100

  const onSubmit = (data) => {
    mutate({
      ...data,
      tauxTva: Number(data.tauxTva),
      lignes: data.lignes.map(l => ({
        ...l,
        quantite: Number(l.quantite),
        prixUnitaire: Number(l.prixUnitaire),
        remisePct: Number(l.remisePct || 0),
      }))
    }, {
      onSuccess: () => { toast.success('Facture créée !'); onSuccess?.() }
    })
  }

  const handleProduitChange = (index, produitId) => {
    const p = produits.find(p => p.id === produitId)
    if (p) {
      setValue(`lignes.${index}.designation`, p.nom)
      setValue(`lignes.${index}.prixUnitaire`, p.prixUnitaire)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Type + Client */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type" required>
          <select className="select" {...register('type')}>
            <option value="FACTURE">Facture</option>
            <option value="DEVIS">Devis</option>
          </select>
        </Field>
        <Field label="Client">
          <select className="select" {...register('clientId')}>
            <option value="">Client occasionnel</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="TVA (%)">
          <input type="number" step="0.01" className="input" {...register('tauxTva')} />
        </Field>
        <Field label="Échéance">
          <input type="date" className="input" {...register('dateEcheance')} />
        </Field>
        <Field label="Notes">
          <input className="input" placeholder="Remarques..." {...register('notes')} />
        </Field>
      </div>

      {/* Lignes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Lignes *</label>
          <button type="button" className="btn-ghost btn-sm"
            onClick={() => append({ designation: '', quantite: 1, prixUnitaire: 0, remisePct: 0 })}>
            <Plus size={14} /> Ajouter ligne
          </button>
        </div>

        <div className="border border-surface-dark rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 bg-surface px-3 py-2 text-xs font-bold text-ink-muted uppercase tracking-wide">
            <div className="col-span-4">Désignation</div>
            <div className="col-span-2">Produit</div>
            <div className="col-span-2">Qté</div>
            <div className="col-span-2">Prix unit.</div>
            <div className="col-span-1">Remise%</div>
            <div className="col-span-1"></div>
          </div>

          {fields.map((field, i) => (
            <div key={field.id}
              className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-surface-dark items-center">
              <div className="col-span-4">
                <input className="input text-xs" placeholder="Description..."
                  {...register(`lignes.${i}.designation`, { required: true })} />
              </div>
              <div className="col-span-2">
                <select className="select text-xs"
                  onChange={e => handleProduitChange(i, e.target.value)}>
                  <option value="">Libre</option>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <input type="number" step="0.001" className="input text-xs"
                  {...register(`lignes.${i}.quantite`, { min: 0.001 })} />
              </div>
              <div className="col-span-2">
                <input type="number" step="1" className="input text-xs"
                  {...register(`lignes.${i}.prixUnitaire`, { min: 0 })} />
              </div>
              <div className="col-span-1">
                <input type="number" step="0.01" className="input text-xs"
                  {...register(`lignes.${i}.remisePct`)} />
              </div>
              <div className="col-span-1 flex justify-end">
                {fields.length > 1 && (
                  <button type="button" className="btn-icon w-7 h-7" onClick={() => remove(i)}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="bg-surface rounded-xl p-4 min-w-[220px] flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-ink-muted">
            <span>Montant HT</span>
            <span className="font-mono">{formatFCFA(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-muted">
            <span>TVA ({tva}%)</span>
            <span className="font-mono">{formatFCFA(total * Number(tva) / 100)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary border-t border-surface-dark pt-1.5 mt-1">
            <span>Total TTC</span>
            <span className="font-mono">{formatFCFA(ttc)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Création...' : 'Créer la facture'}
        </button>
      </div>
    </form>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function FacturesPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [statut, setStatut] = useState('')
  const [type, setType] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const params = { page, size: 20, ...(statut && { statut }), ...(type && { type }) }
  const { data, isLoading } = useFactures(params)
  const { mutate: updateStatut } = useUpdateStatutFacture()
  const { mutate: deleteFacture, isPending: deleting } = useDeleteFacture()

  const factures = data?.content || []

  const handleStatutChange = (id, newStatut) => {
    updateStatut({ id, data: { statut: newStatut } })
  }

  const handleDelete = () => {
    deleteFacture(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Factures & Devis</h1>
          <p className="text-sm text-ink-muted mt-1">{data?.totalElements || 0} document(s)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <select className="select w-auto" value={type} onChange={e => { setType(e.target.value); setPage(0) }}>
          <option value="">Tous les types</option>
          <option value="FACTURE">Factures</option>
          <option value="DEVIS">Devis</option>
        </select>
        <select className="select w-auto" value={statut} onChange={e => { setStatut(e.target.value); setPage(0) }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? <PageLoader /> : factures.length === 0 ? (
        <EmptyState icon={FileText} title="Aucune facture"
          description="Créez votre première facture ou devis"
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Créer une facture
          </button>} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-base">
              <thead>
                <tr>
                  {['N°', 'Type', 'Client', 'Montant TTC', 'Émission', 'Échéance', 'Statut', 'Actions']
                    .map(h => <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {factures.map(f => (
                  <tr key={f.id} className="tr-hover">
                    <td className="td font-mono font-bold text-primary text-xs">{f.numero}</td>
                    <td className="td">
                      <StatutBadge statut={f.type} config={TYPE_CONFIG} />
                    </td>
                    <td className="td text-sm">{f.clientNom || <span className="text-ink-faint italic">Occasionnel</span>}</td>
                    <td className="td font-mono font-semibold">{formatFCFA(f.montantTtc)}</td>
                    <td className="td text-sm text-ink-muted">{formatDate(f.dateEmission)}</td>
                    <td className="td text-sm text-ink-muted">{formatDate(f.dateEcheance)}</td>
                    <td className="td">
                      <select
                        className="text-xs border border-surface-dark rounded-lg px-2 py-1 bg-white font-sans"
                        value={f.statut}
                        onChange={e => handleStatutChange(f.id, e.target.value)}
                      >
                        {Object.keys(STATUT_CONFIG).map(k => (
                          <option key={k} value={k}>{STATUT_CONFIG[k].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button className="btn-icon" title="Voir le détail"
                          onClick={() => navigate(`/factures/${f.id}`)}
                        ><Eye size={14} /></button>
                        <a
                          href={factureService.getPdfUrl(f.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-icon"
                          title="Télécharger PDF"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteId(f.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
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

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}
        title="Nouvelle facture" size="xl">
        <FactureForm
          onClose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Supprimer la facture"
        message="Cette action est irréversible. La facture sera définitivement supprimée."
      />
    </div>
  )
}
