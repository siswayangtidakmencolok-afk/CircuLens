import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Topbar from './components/Topbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import NewBatch from './pages/NewBatch'
import AssessmentResult from './pages/AssessmentResult'
import History from './pages/History'
import Scenarios from './pages/Scenarios'
import LoginPage from './pages/LoginPage'
import VillageHeadDashboard from './pages/VillageHeadDashboard'
import CircuLensSplash from './components/CircuLensSplash'
import type { AIResult } from './services/aiService'
import { saveBatch, riskLevelFromScore, pathwayFromLabel } from './data/storage'

// ===== NEW: import halaman admin (Price/Farmers/Risk) =====
import { PriceIntelligencePage } from './pages/admin/PriceIntelligencePage'
import { FarmersDirectoryPage } from './pages/admin/FarmersDirectoryPage'
import { HarvestRiskPage } from './pages/admin/HarvestRiskPage'
import { AdminLayout } from './components/admin/shared/AdminLayout'
import type { AdminMenuItem } from './components/admin/shared/AdminSidebar'

// ===== NEW: import halaman settings + riwayat + AI =====
import { SettingsPage } from './pages/settings/SettingsPage'
import { RiwayatBatchPage } from './pages/settings/RiwayatBatchPage'
import { UploadAIPage } from './pages/settings/UploadAIPage'

// ===== PHASE 10.1 + 10.2 + 10.3: distributor & pengepul =====
import { DistributorLayout } from './components/distributor/DistributorLayout'
import { CollectorLayout } from './components/collector/CollectorLayout'
import { DistributorDashboard } from './pages/distributor/DistributorDashboard'
import { CollectorDashboard } from './pages/collector/CollectorDashboard'
import { MarketplacePage } from './pages/distributor/MarketplacePage'
import { OrdersPage } from './pages/distributor/OrdersPage'
import { PickupPage } from './pages/collector/PickupPage'
import { getDefaultPageForRole } from './lib/roleRedirect'

type AdminMenu =
  | 'overview'
  | 'price-intelligence'
  | 'farmers'
  | 'risk'
  | 'riwayat'
  | 'analisis-ai'
  | 'pengaturan'

const PAGE_META: Record<AdminMenu, { title: string; breadcrumb: string }> = {
  overview: { title: 'CircuLens', breadcrumb: 'Overview' },
  'price-intelligence': { title: 'CircuLens', breadcrumb: 'Harga Cabai' },
  farmers: { title: 'CircuLens', breadcrumb: 'Data Petani' },
  risk: { title: 'CircuLens', breadcrumb: 'Analisis Panen' },
  riwayat: { title: 'CircuLens', breadcrumb: 'Riwayat Batch' },
  'analisis-ai': { title: 'CircuLens', breadcrumb: 'Analisis AI' },
  pengaturan: { title: 'CircuLens', breadcrumb: 'Pengaturan' },
}

// ===========================================================
// FarmerShell — placeholder minimal
// Kalau di file lama kamu FarmerShell lengkap, hapus ini dan
// paste FarmerShell lama di tempat ini.
// ===========================================================
function FarmerShell() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary mb-4">
          Selamat Datang, Petani
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Dashboard petani. Lihat Riwayat Batch di menu Analytics.
        </p>
      </div>
    </div>
  )
}

function VillageHeadShell() {
  const [page, setPage] = useState<AdminMenu>('overview')
  const navigate = (id: string) => setPage(id as AdminMenu)

  const activeMenuForLayout: AdminMenuItem =
    page === 'overview' ||
    page === 'price-intelligence' ||
    page === 'farmers' ||
    page === 'risk'
      ? page
      : 'overview'

  return (
    <AdminLayout
      activeMenu={activeMenuForLayout}
      pageTitle={PAGE_META[page].title}
      breadcrumb={PAGE_META[page].breadcrumb}
      onNavChange={navigate}
      onLogout={() => {
        // TODO: integrate with auth.signOut()
      }}
    >
      {page === 'overview' && <VillageHeadDashboard onNavigate={navigate} />}
      {page === 'price-intelligence' && (
        <PriceIntelligencePage onNavigate={navigate} />
      )}
      {page === 'farmers' && <FarmersDirectoryPage onNavigate={navigate} />}
      {page === 'risk' && <HarvestRiskPage onNavigate={navigate} />}
      {page === 'riwayat' && <RiwayatBatchPage />}
      {page === 'analisis-ai' && <UploadAIPage />}
      {page === 'pengaturan' && <SettingsPage />}
    </AdminLayout>
  )
}

// ===========================================================
// DistributorShell & CollectorShell (PHASE 10.1 + 10.2 + 10.3)
// ===========================================================

function DistributorShell() {
  const [page, setPage] = useState<string>(() =>
    getDefaultPageForRole('distributor')
  )
  const navigate = (id: string) => setPage(id)

  const breadcrumb =
    page === 'distributor-home'
      ? 'Dashboard'
      : page === 'marketplace'
      ? 'Marketplace'
      : page === 'my-orders'
      ? 'Pesanan Saya'
      : page === 'favorites'
      ? 'Petani Favorit'
      : page === 'analytics'
      ? 'Analisis Pembelian'
      : page === 'settings'
      ? 'Pengaturan'
      : 'Dashboard'

  return (
    <DistributorLayout
      activeMenu={page}
      pageTitle="CircuLens"
      breadcrumb={breadcrumb}
      onNavChange={navigate}
      onLogout={() => {
        // TODO: integrate with auth.signOut()
      }}
    >
      {page === 'distributor-home' && <DistributorDashboard onNavigate={navigate} />}
      {page === 'marketplace' && <MarketplacePage onNavigate={navigate} />}
      {page === 'my-orders' && <OrdersPage onNavigate={navigate} />}
      {(page === 'favorites' ||
        page === 'analytics' ||
        page === 'settings') && (
        <ComingSoonPlaceholder
          title="Segera Hadir"
          message="Menu ini akan aktif di iterasi berikutnya."
          icon="hourglass_empty"
        />
      )}
    </DistributorLayout>
  )
}

function CollectorShell() {
  const [page, setPage] = useState<string>(() =>
    getDefaultPageForRole('pengepul')
  )
  const navigate = (id: string) => setPage(id)

  const breadcrumb =
    page === 'collector-home'
      ? 'Dashboard'
      : page === 'today-route'
      ? 'Rute Pickup'
      : page === 'pickup-history'
      ? 'Riwayat Pickup'
      : page === 'inventory'
      ? 'Inventory'
      : page === 'earnings'
      ? 'Pendapatan'
      : page === 'settings'
      ? 'Pengaturan'
      : 'Dashboard'

  return (
    <CollectorLayout
      activeMenu={page}
      pageTitle="CircuLens"
      breadcrumb={breadcrumb}
      onNavChange={navigate}
      onLogout={() => {
        // TODO: integrate with auth.signOut()
      }}
    >
      {page === 'collector-home' && <CollectorDashboard onNavigate={navigate} />}
      {(page === 'today-route' || page === 'pickup-history') && (
        <PickupPage onNavigate={navigate} />
      )}
      {(page === 'inventory' ||
        page === 'earnings' ||
        page === 'settings') && (
        <ComingSoonPlaceholder
          title="Segera Hadir"
          message="Menu ini akan aktif di iterasi berikutnya."
          icon="hourglass_empty"
        />
      )}
    </CollectorLayout>
  )
}

function ComingSoonPlaceholder({
  title,
  message,
  icon,
}: {
  title: string
  message: string
  icon: string
}) {
  return (
    <div className="p-10 max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container mx-auto mb-6 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
          {icon}
        </span>
      </div>
      <h2 className="font-headline-md text-headline-md font-bold text-primary mb-3">
        {title}
      </h2>
      <p className="text-body-lg text-on-surface-variant">{message}</p>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-body-md text-on-surface-variant">Memuat…</p>
      </div>
    </div>
  )
}

function AuthGate() {
  const { session, profile, loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    if (!loading && session) setSplashDone(true)
  }, [loading, session])

  if (loading) return <LoadingScreen />
  if (session) {
    if (!profile) return <LoadingScreen />
    // === Multi-role routing (Phase 9 + 10.1 + 10.2) ===
    if (profile.role === 'village_head') return <VillageHeadShell />
    if (profile.role === 'distributor') return <DistributorShell />
    if (profile.role === 'pengepul') return <CollectorShell />
    // Default fallback: petani
    return <FarmerShell />
  }

  if (!splashDone) {
    return <CircuLensSplash onComplete={() => setSplashDone(true)} />
  }

  return <LoginPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  )
}
