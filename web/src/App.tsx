import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
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

type Page = 'dashboard' | 'new-batch' | 'assessment' | 'history' | 'scenarios' | 'batches' | 'settings'

/* ── Loading ─────────────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-lg">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-body-md text-secondary">Memuat sesi...</p>
      </div>
    </div>
  )
}

/* ── Farmer shell — the full CircuLens analysis flow ─────────────────────── */
function FarmerShell() {
  const [page, setPage]                 = useState<Page>('dashboard')
  const [aiResult, setAiResult]         = useState<AIResult | null>(null)
  const [batchName, setBatchName]       = useState('')
  const [batchQuantity, setBatchQuantity] = useState('')
  const [currentBatchId, setCurrentBatchId] = useState('')
  const [savedToast, setSavedToast]     = useState(false)

  function handleNav(p: string) { setPage(p as Page) }

  function handleNewBatch() {
    setAiResult(null)
    setPage('new-batch')
  }

  function handleAnalysisComplete(result: AIResult, name: string, qty: string) {
    const id = `CHL-${Date.now().toString().slice(-6)}`
    setAiResult(result)
    setBatchName(name)
    setBatchQuantity(qty)
    setCurrentBatchId(id)
    setPage('assessment')
  }

  function handleViewScenarios() { setPage('scenarios') }

  function handleSelectPathway(label: string) {
    if (aiResult) {
      saveBatch({
        id:              currentBatchId || `CHL-${Date.now().toString().slice(-6)}`,
        name:            batchName || 'Batch Baru',
        date:            new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        condition:       aiResult.condition,
        risk:            riskLevelFromScore(aiResult.riskScore),
        pathway:         pathwayFromLabel(label),
        quantity:        batchQuantity,
        lossExposure:    aiResult.lossExposure,
        riskScore:       aiResult.riskScore,
        selectedPathway: label,
      })
    }
    setPage('history')
  }

  function handleSaveBatch(pathway: string) {
    if (!aiResult) return
    saveBatch({
      id:              currentBatchId || `CHL-${Date.now().toString().slice(-6)}`,
      name:            batchName || 'Batch Baru',
      date:            new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      condition:       aiResult.condition,
      risk:            riskLevelFromScore(aiResult.riskScore),
      pathway:         pathwayFromLabel(pathway),
      quantity:        batchQuantity,
      lossExposure:    aiResult.lossExposure,
      riskScore:       aiResult.riskScore,
      selectedPathway: pathway,
    })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  const sidebarActivePage =
    page === 'new-batch'  ? 'new-batch'
    : page === 'assessment' ? 'new-batch'
    : page === 'history'    ? 'history'
    : page === 'scenarios'  ? 'scenarios'
    : page === 'batches'    ? 'batches'
    : page === 'settings'   ? 'settings'
    : 'dashboard'

  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      <Sidebar activePage={sidebarActivePage} onNavigate={handleNav} />

      <div className="flex-1 flex flex-col md:ml-[280px] w-full overflow-hidden">
        <Topbar onNewBatch={handleNewBatch} onMenuToggle={() => {}} />

        {savedToast && (
          <div className="fixed top-4 right-4 z-50 bg-primary text-on-primary px-lg py-sm rounded-DEFAULT shadow-lg flex items-center gap-sm animate-pulse">
            <span className="material-symbols-outlined fill">check_circle</span>
            Batch berhasil disimpan ke Riwayat!
          </div>
        )}

        {page === 'dashboard' && (
          <Dashboard
            onNewBatch={handleNewBatch}
            onViewBatch={(id) => { setCurrentBatchId(id); setPage('assessment') }}
          />
        )}

        {page === 'new-batch' && (
          <NewBatch onComplete={handleAnalysisComplete} />
        )}

        {page === 'assessment' && aiResult ? (
          <AssessmentResult
            result={aiResult}
            batchName={batchName}
            batchId={currentBatchId}
            quantity={batchQuantity}
            onBack={() => setPage('new-batch')}
            onViewScenarios={handleViewScenarios}
            onSaveBatch={handleSaveBatch}
          />
        ) : page === 'assessment' ? (
          <NewBatch onComplete={handleAnalysisComplete} />
        ) : null}

        {page === 'history' && <History onViewBatch={() => {}} />}

        {page === 'scenarios' && (
          <Scenarios
            result={aiResult}
            batchName={batchName}
            onBack={() => setPage(aiResult ? 'assessment' : 'dashboard')}
            onSelectPathway={handleSelectPathway}
            onSaveBatch={handleSaveBatch}
          />
        )}

        {(page === 'batches' || page === 'settings') && (
          <main className="flex-1 p-md md:p-xl flex items-center justify-center">
            <div className="text-center text-secondary">
              <span className="material-symbols-outlined text-5xl mb-md block">construction</span>
              <p className="text-headline-sm font-semibold text-on-surface">Segera Hadir</p>
              <p className="text-body-md mt-xs">Fitur ini sedang dalam pengembangan.</p>
            </div>
          </main>
        )}

        <Footer />
      </div>
    </div>
  )
}

/* ── Kepala Desa shell ────────────────────────────────────────────────────── */
function VillageHeadShell() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex antialiased">
      {/* Simplified sidebar for village head */}
      <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm flex flex-col py-xl px-md z-40 hidden md:flex">
        <div className="flex items-center gap-sm mb-xl">
          <span className="material-symbols-outlined fill text-primary text-3xl">psychology</span>
          <div>
            <h1 className="text-headline-md font-bold text-primary tracking-tight">CircuLens</h1>
            <p className="text-label-md text-on-surface-variant">Kepala Desa</p>
          </div>
        </div>
        <ul className="flex flex-col gap-sm flex-1 list-none m-0 p-0">
          {[
            { icon: 'dashboard',    label: 'Overview' },
            { icon: 'inventory_2',  label: 'Semua Batch' },
            { icon: 'analytics',    label: 'Laporan' },
            { icon: 'settings',     label: 'Pengaturan' },
          ].map(item => (
            <li key={item.label}>
              <button className="w-full flex items-center gap-md px-md py-sm rounded-lg text-secondary hover:bg-surface-container-low transition-colors text-left">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-body-md">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <div className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold text-center">
            ⚗️ Prototype AI — Demo Mode
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:ml-[280px] w-full overflow-hidden">
        <Topbar onNewBatch={() => {}} onMenuToggle={() => {}} />
        <VillageHeadDashboard />
        <Footer />
      </div>
    </div>
  )
}

/* ── Auth gate — role comes from public.profiles (DB), never from frontend ── */
function AuthGate() {
  const { session, profile, loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  // If already authenticated when app boots, skip splash immediately
  useEffect(() => {
    if (!loading && session) setSplashDone(true)
  }, [loading, session])

  // 1. Supabase still resolving session
  if (loading) return <LoadingScreen />

  // 2. Authenticated → skip splash, go straight to dashboard
  if (session) {
    if (!profile) return <LoadingScreen />
    if (profile.role === 'village_head') return <VillageHeadShell />
    return <FarmerShell />
  }

  // 3. Unauthenticated → show splash then role selection + login
  if (!splashDone) {
    return <CircuLensSplash onComplete={() => setSplashDone(true)} />
  }

  return <LoginPage />
}

/* ── Root ────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
