import api from './api'

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  login:    (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  refresh:  (data) => api.post('/auth/refresh', data).then(r => r.data),
}

// ── Clients ───────────────────────────────────────────────────
export const clientService = {
  findAll:  (params) => api.get('/clients', { params }).then(r => r.data),
  findById: (id)     => api.get(`/clients/${id}`).then(r => r.data),
  create:   (data)   => api.post('/clients', data).then(r => r.data),
  update:   (id, d)  => api.put(`/clients/${id}`, d).then(r => r.data),
  delete:   (id)     => api.delete(`/clients/${id}`),
}

// ── Factures ──────────────────────────────────────────────────
export const factureService = {
  findAll:      (params) => api.get('/factures', { params }).then(r => r.data),
  findById:     (id)     => api.get(`/factures/${id}`).then(r => r.data),
  create:       (data)   => api.post('/factures', data).then(r => r.data),
  update:       (id, d)  => api.put(`/factures/${id}`, d).then(r => r.data),
  updateStatut: (id, d)  => api.patch(`/factures/${id}/statut`, d).then(r => r.data),
  convertir:    (id)     => api.post(`/factures/${id}/convertir`).then(r => r.data),
  delete:       (id)     => api.delete(`/factures/${id}`),
  getPdfUrl:    (id)     => `/api/v1/factures/${id}/pdf`,
}

// ── Produits & Stock ──────────────────────────────────────────
export const produitService = {
  findAll:          (params) => api.get('/produits', { params }).then(r => r.data),
  findById:         (id)     => api.get(`/produits/${id}`).then(r => r.data),
  alertes:          ()       => api.get('/produits/alertes').then(r => r.data),
  create:           (data)   => api.post('/produits', data).then(r => r.data),
  update:           (id, d)  => api.put(`/produits/${id}`, d).then(r => r.data),
  delete:           (id)     => api.delete(`/produits/${id}`),
  addMouvement:     (id, d)  => api.post(`/produits/${id}/mouvements`, d).then(r => r.data),
  getMouvements:    (id, p)  => api.get(`/produits/${id}/mouvements`, { params: p }).then(r => r.data),
  tousLesMouvements:(p)      => api.get('/produits/mouvements', { params: p }).then(r => r.data),
}

// ── Transactions ──────────────────────────────────────────────
export const transactionService = {
  findAll:  (params) => api.get('/transactions', { params }).then(r => r.data),
  findById: (id)     => api.get(`/transactions/${id}`).then(r => r.data),
  create:   (data)   => api.post('/transactions', data).then(r => r.data),
  delete:   (id)     => api.delete(`/transactions/${id}`),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardService = {
  get: () => api.get('/dashboard').then(r => r.data),
}

// ── Équipe ────────────────────────────────────────────────────
export const equipeService = {
  findMembres:        ()         => api.get('/equipe/membres').then(r => r.data),
  updateRole:         (id, d)    => api.patch(`/equipe/membres/${id}/role`, d).then(r => r.data),
  desactiver:         (id)       => api.delete(`/equipe/membres/${id}`),
  findInvitations:    ()         => api.get('/equipe/invitations').then(r => r.data),
  inviter:            (data)     => api.post('/equipe/invitations', data).then(r => r.data),
  annulerInvitation:  (id)       => api.delete(`/equipe/invitations/${id}`),
  getInvitationInfo:  (token)    => api.get(`/equipe/invitations/info/${token}`).then(r => r.data),
  accepterInvitation: (token, d) => api.post(`/equipe/invitations/accepter/${token}`, d).then(r => r.data),
}
