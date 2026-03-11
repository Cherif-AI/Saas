# Dimba Frontend — React 18 + Vite

Projet **séparé** du backend. Lance-le depuis WebStorm pendant que le backend tourne sur IntelliJ.

---

## Prérequis
- Node.js 20+
- npm 10+ (ou pnpm)
- Le backend Dimba lancé sur **IntelliJ → port 8080**

---

## Lancement dans WebStorm

### 1. Ouvrir le projet
```
WebStorm → File → Open → sélectionner le dossier dimba-frontend/
```

### 2. Installer les dépendances
```bash
# Dans le terminal WebStorm (Alt+F12) :
npm install
```

### 3. Créer la configuration de lancement
```
Run → Edit Configurations → + → npm
  Name : Dimba Dev
  Command : run
  Scripts : dev
→ OK → Run (Shift+F10)
```

### 4. Ouvrir dans le navigateur
```
http://localhost:5173
```

> Le proxy Vite redirige automatiquement `/api/*` → `http://localhost:8080`
> Donc pas de CORS, pas de configuration supplémentaire.

---

## Architecture du projet

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx      ← Sidebar + navigation
│   │   └── ProtectedRoute.jsx ← Guard JWT
│   └── ui/
│       └── index.jsx          ← Button, Modal, Badge, Spinner...
├── hooks/
│   └── index.js               ← React Query hooks (useFactures, useClients...)
├── pages/
│   ├── AuthPages.jsx          ← Login + Register
│   ├── DashboardPage.jsx      ← KPIs + graphiques
│   ├── FacturesPage.jsx       ← Liste + création + PDF
│   ├── ClientsPage.jsx        ← CRUD clients
│   ├── StockPage.jsx          ← Produits + mouvements
│   └── ComptabilitePage.jsx   ← Transactions
├── services/
│   ├── api.js                 ← Axios + intercepteurs JWT + refresh auto
│   └── index.js               ← Services métier (clientService, factureService...)
├── store/
│   └── authStore.js           ← Zustand (token + user persisté en localStorage)
├── utils/
│   └── index.js               ← formatFCFA, formatDate, badges config
├── App.jsx                    ← Router + QueryClient + Toaster
├── main.jsx
└── index.css                  ← Tailwind + classes custom
```

---

## Variables d'environnement (optionnel)

Créer `.env.local` si le backend tourne sur un autre port :
```env
VITE_API_URL=http://localhost:8080
```
Et adapter `vite.config.js` → `proxy.target`.

---

## Commandes utiles

```bash
npm run dev      # Démarrage développement (port 5173)
npm run build    # Build production
npm run preview  # Prévisualiser le build
```

---

## Communication avec le backend

| Frontend | Backend (IntelliJ) |
|---|---|
| `http://localhost:5173` | `http://localhost:8080` |
| `/api/v1/auth/login` → proxy → | `http://localhost:8080/api/v1/auth/login` |
| JWT stocké dans localStorage | Validé par Spring Security à chaque requête |
| Refresh auto si token expiré | `/api/v1/auth/refresh` |

---

## Prochaine étape — Sprint 4
- Tests E2E (Cypress ou Playwright)
- Notifications relances factures en retard
- Mode offline PWA
- Intégration Wave / Orange Money
