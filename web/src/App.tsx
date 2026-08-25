import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import NewBatch from './pages/NewBatch'
import AssessmentResult from './pages/AssessmentResult'
import History from './pages/History'
import Scenarios from './pages/Scenarios'
import type { AIResult } from './services/aiService'
import { saveBatch, riskLevelFromScore, pathwayFromLabel } from './data/storage'

type Page = 'dashboard' | 'new-batch' | 'assessment' | 'history' | 'scenarios' | 'batches' | 'settings'

export default function App() {
  const [page, setPage]         = useState<Page>('dashboard')
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [batchName, setBatchName]     = useState('')
  const [batchQuantity, setBatchQuantity] = useState('')
  const [currentBatchId, setCurrentBatchId] = useState('')
  const [savedToast, setSavedToast] = useState(false)

  function handleNav(p: string) {
    setPage(p as Page)
  }

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

  function handleViewScenarios() {
    setPage('scenarios')
  }

  function handleSelectPathway(label: string) {
    // Called from Scenarios "Pilih Jalur Ini" — save batch then go to history
    if (aiResult) {
      saveBatch({
        id:             currentBatchId || `CHL-${Date.now().toString().slice(-6)}`,
        name:           batchName || 'Batch Baru',
        date:           new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        condition:      aiResult.condition,
        risk:           riskLevelFromScore(aiResult.riskScore),
        pathway:        pathwayFromLabel(label),
        quantity:       batchQuantity,
        lossExposure:   aiResult.lossExposure,
        riskScore:      aiResult.riskScore,
        selectedPathway: label,
      })
    }
    setPage('history')
  }

  function handleSaveBatch(pathway: string) {
    if (!aiResult) return
    saveBatch({
      id:             currentBatchId || `CHL-${Date.now().toString().slice(-6)}`,
      name:           batchName || 'Batch Baru',
      date:           new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      condition:      aiResult.condition,
      risk:           riskLevelFromScore(aiResult.riskScore),
      pathway:        pathwayFromLabel(pathway),
      quantity:       batchQuantity,
      lossExposure:   aiResult.lossExposure,
      riskScore:      aiResult.riskScore,
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

        {/* Toast notification */}
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

        {page === 'history' && (
          <History onViewBatch={() => {}} />
        )}

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
