import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  clientService, factureService,
  produitService, transactionService, dashboardService
} from '@/services'
import toast from 'react-hot-toast'

// ── CLIENTS ───────────────────────────────────────────────────
export const useClients = (params) => useQuery({
  queryKey: ['clients', params],
  queryFn:  () => clientService.findAll(params),
  staleTime: 2 * 60 * 1000,
})

export const useClient = (id) => useQuery({
  queryKey: ['clients', id],
  queryFn:  () => clientService.findById(id),
  enabled: !!id,
})

export const useCreateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientService.create,
    onSuccess: () => { qc.invalidateQueries(['clients']); toast.success('Client créé') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useUpdateClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => clientService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['clients']); toast.success('Client modifié') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useDeleteClient = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: clientService.delete,
    onSuccess: () => { qc.invalidateQueries(['clients']); toast.success('Client supprimé') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

// ── FACTURES ──────────────────────────────────────────────────
export const useFactures = (params) => useQuery({
  queryKey: ['factures', params],
  queryFn:  () => factureService.findAll(params),
  staleTime: 60 * 1000,
})

export const useFacture = (id) => useQuery({
  queryKey: ['factures', id],
  queryFn:  () => factureService.findById(id),
  enabled: !!id,
})

export const useCreateFacture = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: factureService.create,
    onSuccess: () => { qc.invalidateQueries(['factures']); qc.invalidateQueries(['dashboard']) },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useUpdateFacture = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => factureService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries(['factures'])
      qc.invalidateQueries(['factures', id])
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useUpdateStatutFacture = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => factureService.updateStatut(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['factures'])
      qc.invalidateQueries(['dashboard'])
      toast.success('Statut mis à jour')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useDeleteFacture = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: factureService.delete,
    onSuccess: () => { qc.invalidateQueries(['factures']); toast.success('Facture supprimée') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

// ── PRODUITS ──────────────────────────────────────────────────
export const useProduits = (params) => useQuery({
  queryKey: ['produits', params],
  queryFn:  () => produitService.findAll(params),
  staleTime: 2 * 60 * 1000,
})

export const useAlertesStock = () => useQuery({
  queryKey: ['produits', 'alertes'],
  queryFn:  produitService.alertes,
  refetchInterval: 5 * 60 * 1000,
})

export const useCreateProduit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: produitService.create,
    onSuccess: () => { qc.invalidateQueries(['produits']); toast.success('Produit créé') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useUpdateProduit = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => produitService.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['produits']); toast.success('Produit modifié') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useAddMouvement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => produitService.addMouvement(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['produits'])
      qc.invalidateQueries(['dashboard'])
      toast.success('Mouvement enregistré')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

// ── TRANSACTIONS ──────────────────────────────────────────────
export const useTransactions = (params) => useQuery({
  queryKey: ['transactions', params],
  queryFn:  () => transactionService.findAll(params),
  staleTime: 60 * 1000,
})

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      qc.invalidateQueries(['transactions'])
      qc.invalidateQueries(['dashboard'])
      toast.success('Transaction enregistrée')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

// ── DASHBOARD ─────────────────────────────────────────────────
export const useDashboard = () => useQuery({
  queryKey: ['dashboard'],
  queryFn:  dashboardService.get,
  staleTime: 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
})

// ── ÉQUIPE ────────────────────────────────────────────────────
import { equipeService } from '@/services'

export const useMembres = () => useQuery({
  queryKey: ['equipe', 'membres'],
  queryFn: equipeService.findMembres,
})

export const useInvitations = () => useQuery({
  queryKey: ['equipe', 'invitations'],
  queryFn: equipeService.findInvitations,
})

export const useInviter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: equipeService.inviter,
    onSuccess: () => { qc.invalidateQueries(['equipe']); toast.success('Invitation envoyée !') },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}

export const useConvertirDevis = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: factureService.convertir,
    onSuccess: () => {
      qc.invalidateQueries(['factures'])
      toast.success('Devis converti en facture !')
    },
    onError: (e) => toast.error(e.response?.data?.errors?.[0]?.message || 'Erreur'),
  })
}
