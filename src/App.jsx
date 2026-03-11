import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

import { ErrorBoundary, NotFoundPage } from '@/components/ui/ErrorBoundary'
import AppLayout      from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

import { LoginPage, RegisterPage } from '@/pages/AuthPages'
import InvitationPage   from '@/pages/InvitationPage'
import DashboardPage    from '@/pages/DashboardPage'
import FacturesPage     from '@/pages/FacturesPage'
import FactureDetailPage from '@/pages/FactureDetailPage'
import ClientsPage      from '@/pages/ClientsPage'
import StockPage        from '@/pages/StockPage'
import ComptabilitePage from '@/pages/ComptabilitePage'
import EquipePage       from '@/pages/EquipePage'
import ProfilPage       from '@/pages/ProfilPage'

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    }
  }
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/invitation/:token" element={<InvitationPage />} />

            {/* App protégée */}
            <Route element={
              <ProtectedRoute><AppLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/factures"      element={<FacturesPage />} />
              <Route path="/factures/:id"  element={<FactureDetailPage />} />
              <Route path="/clients"       element={<ClientsPage />} />
              <Route path="/stock"         element={<StockPage />} />
              <Route path="/comptabilite"  element={<ComptabilitePage />} />
              <Route path="/equipe"        element={<EquipePage />} />
              <Route path="/profil"        element={<ProfilPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Syne, sans-serif',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(15,45,82,0.14)',
            },
            success: { iconTheme: { primary: '#1A7A4A', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#CC2200', secondary: '#fff' } },
          }}
        />

        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
