import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks'
import { formatDate } from '@/utils'
import { PageLoader, EmptyState, Modal, ConfirmModal, Field, Pagination } from '@/components/ui'
import { Users, Plus, Pencil, Trash2, Search, Phone, Mail, MapPin, X } from 'lucide-react'

function ClientForm({ initial, onSubmit, isPending, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: initial })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label="Nom du client" error={errors.nom?.message} required>
        <input className={`input ${errors.nom ? 'input-error' : ''}`}
          placeholder="Boutique Diallo"
          {...register('nom', { required: 'Nom requis', minLength: { value: 2, message: 'Min 2 caractères' } })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Téléphone">
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input className="input pl-9" placeholder="+221 77 000 00 00" {...register('telephone')} />
          </div>
        </Field>
        <Field label="Email">
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input type="email" className="input pl-9" placeholder="client@email.sn" {...register('email')} />
          </div>
        </Field>
      </div>
      <Field label="Adresse">
        <div className="relative">
          <MapPin size={14} className="absolute left-3 top-3 text-ink-faint" />
          <textarea className="input pl-9 resize-none" rows={2} placeholder="Dakar, Médina..." {...register('adresse')} />
        </div>
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Enregistrement...' : initial ? 'Modifier' : 'Créer le client'}
        </button>
      </div>
    </form>
  )
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-400 to-rose-500',
  'from-primary to-primary-light',
]

export default function ClientsPage() {
  const [page, setPage]     = useState(0)
  const [search, setSearch] = useState('')
  const [query, setQuery]   = useState('')
  const [editClient, setEdit]       = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId]     = useState(null)

  const params = { page, size: 20, ...(query && { search: query }) }
  const { data, isLoading } = useClients(params)
  const { mutate: create, isPending: creating } = useCreateClient()
  const { mutate: update, isPending: updating } = useUpdateClient()
  const { mutate: del,    isPending: deleting  } = useDeleteClient()
  const clients = data?.content || []

  const handleSearch = (e) => { e.preventDefault(); setQuery(search); setPage(0) }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Clients</h1>
          <p className="text-sm text-ink-muted mt-1">
            {data?.totalElements || 0} client{(data?.totalElements || 0) > 1 ? 's' : ''} enregistré{(data?.totalElements || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input className="input pl-10" placeholder="Nom, téléphone ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary btn-sm px-4">Chercher</button>
        {query && (
          <button type="button" className="btn-ghost btn-sm"
            onClick={() => { setSearch(''); setQuery(''); setPage(0) }}>
            <X size={13} /> Effacer
          </button>
        )}
      </form>

      {isLoading ? <PageLoader /> : clients.length === 0 ? (
        <EmptyState icon={Users} title="Aucun client"
          description="Ajoutez vos premiers clients pour les associer à vos factures"
          action={<button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Ajouter un client
          </button>} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-base">
              <thead>
                <tr>
                  {['Client', 'Téléphone', 'Email', 'Adresse', 'Ajouté le', 'Actions'].map(h =>
                    <th key={h} className="th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => (
                  <tr key={c.id} className="tr-hover">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white font-bold text-sm">{c.nom?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-semibold text-sm text-ink">{c.nom}</span>
                      </div>
                    </td>
                    <td className="td">
                      {c.telephone
                        ? <span className="font-mono text-sm text-ink-muted">{c.telephone}</span>
                        : <span className="text-ink-faint text-xs">—</span>}
                    </td>
                    <td className="td text-sm text-ink-muted">{c.email || <span className="text-ink-faint text-xs">—</span>}</td>
                    <td className="td text-sm text-ink-muted max-w-[180px] truncate">
                      {c.adresse || <span className="text-ink-faint text-xs">—</span>}
                    </td>
                    <td className="td text-xs text-ink-faint font-mono">{formatDate(c.createdAt)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1.5">
                        <button className="btn-icon" onClick={() => setEdit(c)} title="Modifier">
                          <Pencil size={14} />
                        </button>
                        <button className="btn-icon hover:bg-red-50 hover:text-danger hover:shadow-none"
                          onClick={() => setDeleteId(c.id)} title="Supprimer">
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau client">
        <ClientForm onClose={() => setShowCreate(false)} isPending={creating}
          onSubmit={(d) => create(d, { onSuccess: () => setShowCreate(false) })} />
      </Modal>

      <Modal open={!!editClient} onClose={() => setEdit(null)} title="Modifier le client">
        <ClientForm initial={editClient} onClose={() => setEdit(null)} isPending={updating}
          onSubmit={(d) => update({ id: editClient.id, data: d }, { onSuccess: () => setEdit(null) })} />
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => del(deleteId, { onSuccess: () => setDeleteId(null) })}
        loading={deleting} title="Supprimer le client"
        message="Ce client sera supprimé définitivement. Ses factures existantes ne seront pas affectées." />
    </div>
  )
}
