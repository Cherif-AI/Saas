import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  useFacture, useUpdateFacture, useUpdateStatutFacture,
  useDeleteFacture, useConvertirDevis, useClients, useProduits
} from '@/hooks'
import { factureService } from '@/services'
import { formatFCFA, formatDate, STATUT_CONFIG, TYPE_CONFIG, MODE_PAIEMENT_LABELS } from '@/utils'
import { PageLoader, Modal, ConfirmModal, Field, StatutBadge } from '@/components/ui'
import {
  ArrowLeft, Download, Pencil, Trash2, RefreshCw,
  CheckCircle, X, Plus, FileText, User, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Formulaire édition ────────────────────────────────────────
function EditForm({ facture, onClose }) {
  const { data: clientsData } = useClients({ size: 100 })
  const { data: produitsData } = useProduits({ size: 100 })
  const { mutate, isPending } = useUpdateFacture()

  const clients  = clientsData?.content || []
  const produits = produitsData?.content || []

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: {
      type:         facture.type,
      clientId:     facture.client?.id || '',
      tauxTva:      facture.tauxTva,
      notes:        facture.notes || '',
      dateEcheance: facture.dateEcheance || '',
      lignes: facture.lignes.map(l => ({
        produitId:    l.produitId || '',
        designation:  l.designation,
        quantite:     l.quantite,
        prixUnitaire: l.prixUnitaire,
        remisePct:    l.remisePct || 0,
      }))
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })
  const lignes = watch('lignes')
  const tva    = watch('tauxTva')

  const total = lignes.reduce((s, l) => {
    const ht = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0)
    return s + ht - ht * (Number(l.remisePct) || 0) / 100
  }, 0)
  const ttc = total + total * Number(tva) / 100

  const handleProduitChange = (i, pid) => {
    const p = produits.find(p => p.id === pid)
    if (p) {
      setValue(`lignes.${i}.designation`, p.nom)
      setValue(`lignes.${i}.prixUnitaire`, p.prixUnitaire)
    }
  }

  const onSubmit = (data) => {
    mutate({ id: facture.id, data: {
      ...data,
      tauxTva: Number(data.tauxTva),
      clientId: data.clientId || null,
      lignes: data.lignes.map(l => ({
        ...l,
        produitId:    l.produitId || null,
        quantite:     Number(l.quantite),
        prixUnitaire: Number(l.prixUnitaire),
        remisePct:    Number(l.remisePct || 0),
      }))
    }}, { onSuccess: onClose })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client">
          <select className="select" {...register('clientId')}>
            <option value="">Client occasionnel</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </Field>
        <Field label="TVA (%)">
          <input type="number" step="0.01" className="input" {...register('tauxTva')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Échéance">
          <input type="date" className="input" {...register('dateEcheance')} />
        </Field>
        <Field label="Notes">
          <input className="input" {...register('notes')} />
        </Field>
      </div>

      {/* Lignes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="label mb-0">Lignes</label>
          <button type="button" className="btn-ghost btn-sm"
            onClick={() => append({ designation: '', quantite: 1, prixUnitaire: 0, remisePct: 0 })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="border border-surface-dark rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 bg-surface px-3 py-2 text-xs font-bold text-ink-muted uppercase">
            <div className="col-span-4">Désignation</div>
            <div className="col-span-2">Produit</div>
            <div className="col-span-2">Qté</div>
            <div className="col-span-2">Prix unit.</div>
            <div className="col-span-1">Remise%</div>
            <div className="col-span-1"></div>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-surface-dark items-center">
              <div className="col-span-4">
                <input className="input text-xs" {...register(`lignes.${i}.designation`, { required: true })} />
              </div>
              <div className="col-span-2">
                <select className="select text-xs" onChange={e => handleProduitChange(i, e.target.value)}>
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
            <span>HT</span><span className="font-mono">{formatFCFA(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-muted">
            <span>TVA ({tva}%)</span><span className="font-mono">{formatFCFA(total * Number(tva) / 100)}</span>
          </div>
          <div className="flex justify-between font-bold text-primary border-t border-surface-dark pt-1.5 mt-1">
            <span>TTC</span><span className="font-mono">{formatFCFA(ttc)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  )
}

// ── Modal changement statut ───────────────────────────────────
function StatutModal({ facture, open, onClose }) {
  const { mutate, isPending } = useUpdateStatutFacture()
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { statut: facture.statut, modePaiement: 'ESPECES' }
  })
  const statut = watch('statut')

  const onSubmit = (data) => {
    mutate({ id: facture.id, data }, { onSuccess: onClose })
  }

  return (
    <Modal open={open} onClose={onClose} title="Changer le statut" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Nouveau statut">
          <select className="select" {...register('statut')}>
            {Object.entries(STATUT_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </Field>

        {statut === 'PAYEE' && (
          <>
            <Field label="Date de paiement">
              <input type="date" className="input"
                defaultValue={new Date().toISOString().split('T')[0]}
                {...register('datePaiement')} />
            </Field>
            <Field label="Mode de paiement">
              <select className="select" {...register('modePaiement')}>
                {Object.entries(MODE_PAIEMENT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex gap-2">
              <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>Une transaction de <strong>{formatFCFA(facture.montantTtc)}</strong> sera créée automatiquement et le stock sera mis à jour.</span>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Mise à jour...' : 'Confirmer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function FactureDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: facture, isLoading } = useFacture(id)
  const { mutate: deleteFacture, isPending: deleting } = useDeleteFacture()
  const { mutate: convertir, isPending: converting } = useConvertirDevis()

  const [showEdit, setShowEdit]     = useState(false)
  const [showStatut, setShowStatut] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) return <PageLoader />
  if (!facture)  return null

  const isDevis   = facture.type === 'DEVIS'
  const canEdit   = !['PAYEE', 'ANNULEE'].includes(facture.statut)
  const canDelete = facture.statut !== 'PAYEE'

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="btn-icon" onClick={() => navigate('/factures')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title mb-0">{facture.numero}</h1>
              <StatutBadge statut={facture.type} config={TYPE_CONFIG} />
              <StatutBadge statut={facture.statut} config={STATUT_CONFIG} />
            </div>
            <p className="text-sm text-ink-muted mt-0.5">
              Émis le {formatDate(facture.dateEmission)}
              {facture.dateEcheance && ` · Échéance ${formatDate(facture.dateEcheance)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDevis && canEdit && (
            <button className="btn-accent btn-sm" onClick={() => convertir(facture.id)}
              disabled={converting}>
              <RefreshCw size={14} />
              {converting ? 'Conversion...' : 'Convertir en facture'}
            </button>
          )}
          <button className="btn-ghost btn-sm" onClick={() => setShowStatut(true)}>
            Changer statut
          </button>
          {canEdit && (
            <button className="btn-icon" onClick={() => setShowEdit(true)} title="Modifier">
              <Pencil size={15} />
            </button>
          )}
          <a href={factureService.getPdfUrl(facture.id)} target="_blank" rel="noreferrer"
            className="btn-icon" title="PDF">
            <Download size={15} />
          </a>
          {canDelete && (
            <button className="btn-icon hover:bg-red-50 hover:text-danger"
              onClick={() => setShowDelete(true)} title="Supprimer">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Colonne principale */}
        <div className="col-span-2 flex flex-col gap-5">

          {/* Lignes */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-dark">
              <h2 className="font-bold text-primary text-sm">Lignes</h2>
            </div>
            <table className="table-base">
              <thead>
                <tr>
                  {['Désignation', 'Qté', 'Prix unit.', 'Remise', 'Montant HT'].map(h =>
                    <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {facture.lignes.map((l, i) => (
                  <tr key={l.id} className={i % 2 === 0 ? '' : 'bg-surface/40'}>
                    <td className="td font-medium">{l.designation}</td>
                    <td className="td font-mono text-sm">{l.quantite}</td>
                    <td className="td font-mono text-sm">{formatFCFA(l.prixUnitaire)}</td>
                    <td className="td text-sm text-ink-muted">
                      {Number(l.remisePct) > 0 ? `${l.remisePct}%` : '—'}
                    </td>
                    <td className="td font-mono font-semibold">{formatFCFA(l.montantHt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {facture.notes && (
            <div className="card">
              <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-ink">{facture.notes}</p>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-4">

          {/* Client */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-ink-muted" />
              <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wide">Client</h3>
            </div>
            {facture.client ? (
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{facture.client.nom}</div>
                {facture.client.telephone && <div className="text-sm text-ink-muted font-mono">{facture.client.telephone}</div>}
                {facture.client.email    && <div className="text-sm text-ink-muted">{facture.client.email}</div>}
                {facture.client.adresse  && <div className="text-xs text-ink-faint">{facture.client.adresse}</div>}
              </div>
            ) : (
              <p className="text-sm text-ink-faint italic">Client occasionnel</p>
            )}
          </div>

          {/* Totaux */}
          <div className="card">
            <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wide mb-3">Montants</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Montant HT</span>
                <span className="font-mono">{formatFCFA(facture.montantHt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">TVA ({facture.tauxTva}%)</span>
                <span className="font-mono">{formatFCFA(facture.montantTva)}</span>
              </div>
              <div className="flex justify-between font-bold text-primary border-t border-surface-dark pt-2 mt-1">
                <span>Total TTC</span>
                <span className="font-mono text-lg">{formatFCFA(facture.montantTtc)}</span>
              </div>
              {facture.datePaiement && (
                <div className="text-xs text-success font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Payée le {formatDate(facture.datePaiement)}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-ink-muted" />
              <h3 className="font-bold text-sm text-ink-muted uppercase tracking-wide">Dates</h3>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Émission</span>
                <span>{formatDate(facture.dateEmission)}</span>
              </div>
              {facture.dateEcheance && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Échéance</span>
                  <span>{formatDate(facture.dateEcheance)}</span>
                </div>
              )}
              {facture.datePaiement && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Paiement</span>
                  <span className="text-success font-semibold">{formatDate(facture.datePaiement)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted">Créée le</span>
                <span className="text-ink-faint">{formatDate(facture.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)}
        title="Modifier la facture" size="xl">
        <EditForm facture={facture} onClose={() => setShowEdit(false)} />
      </Modal>

      <StatutModal facture={facture} open={showStatut} onClose={() => setShowStatut(false)} />

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteFacture(facture.id, { onSuccess: () => navigate('/factures') })}
        loading={deleting}
        title="Supprimer la facture"
        message={`La facture ${facture.numero} sera définitivement supprimée.`}
      />
    </div>
  )
}
