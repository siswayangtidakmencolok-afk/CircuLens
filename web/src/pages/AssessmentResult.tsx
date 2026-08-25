import type { AIResult } from '../services/aiService'

interface AssessmentResultProps {
  result: AIResult
  batchName: string
  batchId: string
  quantity: string
  onBack: () => void
  onViewScenarios: () => void
  onSaveBatch: (pathway: string) => void
}

const conditionColors: Record<string, string> = {
  Fresh:       'bg-green-50 border-green-200 text-green-800',
  Moderate:    'bg-amber-50 border-amber-200 text-amber-800',
  'High Risk': 'bg-red-50 border-red-200 text-red-800',
}

export default function AssessmentResult({
  result, batchName, batchId, quantity,
  onBack, onViewScenarios, onSaveBatch,
}: AssessmentResultProps) {
  const conditionCls = conditionColors[result.condition] ?? conditionColors['Moderate']
  const estimatedLossKg = quantity
    ? `${((parseFloat(quantity) * result.lossExposure) / 100).toFixed(1)} kg`
    : '—'

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Hasil Analisis</h2>
          <p className="text-body-md text-secondary">
            Batch: <span className="font-mono font-semibold">{batchId}</span>
            {batchName ? ` — ${batchName}` : ''}
            {quantity ? ` · ${quantity} kg` : ''}
          </p>
        </div>
        <div className="flex gap-sm flex-wrap">
          <button
            onClick={onBack}
            className="border border-outline-variant px-lg py-sm rounded-full text-body-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Analisis Baru
          </button>
          <button
            onClick={() => onSaveBatch(result.recommendedPathway)}
            className="border border-primary text-primary px-lg py-sm rounded-full text-body-sm font-semibold hover:bg-primary/10 transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Simpan Batch
          </button>
          <button
            onClick={onViewScenarios}
            className="bg-primary text-on-primary px-lg py-sm rounded-full text-body-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-sm">fork_right</span>
            Lihat Skenario
          </button>
        </div>
      </div>

      {/* Demo banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-DEFAULT px-lg py-sm mb-lg flex items-center gap-sm">
        <span className="text-lg">⚗️</span>
        <div>
          <p className="text-body-sm font-bold text-amber-800">Prototype AI — Demo Mode</p>
          <p className="text-body-sm text-amber-700">Ini adalah prediksi demo, bukan output model nyata. CircuLens recommends. You decide.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

        {/* Left */}
        <div className="lg:col-span-5 flex flex-col gap-lg">

          {/* Condition */}
          <div className={`rounded-DEFAULT border-2 p-lg flex items-center gap-lg ${conditionCls}`}>
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center shrink-0">
              <span className="text-3xl">
                {result.condition === 'Fresh' ? '🟢' : result.condition === 'Moderate' ? '🟡' : '🔴'}
              </span>
            </div>
            <div>
              <p className="text-label-md font-semibold uppercase tracking-wide opacity-70">Kondisi Visual</p>
              <p className="text-headline-md font-bold">{result.condition}</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs p-md bg-surface-container-low rounded-DEFAULT">
              <span className="text-label-md text-secondary flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                Confidence
              </span>
              <span className="text-headline-lg font-bold text-primary">{result.confidence}%</span>
              <span className="text-[10px] text-on-surface-variant italic">⚗️ Demo</span>
            </div>
            <div className="flex flex-col gap-xs p-md bg-error-container/30 rounded-DEFAULT border border-error-container">
              <span className="text-label-md text-error flex items-center gap-xs">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_down</span>
                Est. Loss
              </span>
              <span className="text-headline-md font-bold text-error">{result.lossExposure}%</span>
            </div>
          </div>

          {/* Risk score bar */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm">
            <div className="flex justify-between mb-sm">
              <span className="text-body-sm font-semibold text-on-surface">Risk Score</span>
              <span className="text-body-sm font-bold text-on-surface">{result.riskScore}/100</span>
            </div>
            <div className="h-3 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.riskScore > 70 ? 'bg-error' : result.riskScore > 40 ? 'bg-amber-400' : 'bg-primary'
                }`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-xs text-label-md text-secondary">
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>

          {/* Quantity / Loss Exposure */}
          {quantity && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm">
              <h4 className="text-body-md font-semibold text-on-surface mb-md">Quantity & Loss Exposure</h4>
              <div className="grid grid-cols-2 gap-md">
                <div className="p-md bg-surface-container-low rounded-DEFAULT">
                  <p className="text-label-md text-secondary">Kuantitas Batch</p>
                  <p className="text-headline-sm font-bold text-on-surface mt-xs">{quantity} kg</p>
                </div>
                <div className="p-md bg-error-container/20 rounded-DEFAULT">
                  <p className="text-label-md text-error">Est. Kerugian</p>
                  <p className="text-headline-sm font-bold text-error mt-xs">~{estimatedLossKg}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="lg:col-span-7 flex flex-col gap-lg">

          {/* AI Reasoning */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              <h3 className="text-headline-sm font-bold text-on-surface">AI Reasoning</h3>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">⚗️ Demo</span>
            </div>
            <ul className="flex flex-col gap-sm">
              {result.explanations.map((exp, i) => (
                <li key={i} className="flex items-start gap-sm text-body-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {exp}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Action */}
          <div className="bg-primary/5 border-2 border-primary/30 rounded-DEFAULT p-lg">
            <div className="flex items-center gap-sm mb-md">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary fill">lightbulb</span>
              </div>
              <div>
                <p className="text-label-md text-primary uppercase tracking-wide font-semibold">Rekomendasi</p>
                <p className="text-headline-sm font-bold text-on-surface">{result.recommendedPathway}</p>
              </div>
            </div>
            <p className="text-body-sm text-secondary mb-md">{result.storageAdvice}</p>
            <p className="text-body-sm font-bold text-primary italic border-t border-primary/20 pt-md">
              "CircuLens recommends. You decide."
            </p>
          </div>

          {/* Pathway buttons */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm">
            <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Pilih Jalur</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-sm">
              {[
                { label: 'Jual',     icon: '🛒', recommended: result.recommendedPathway.includes('Pasar') || result.recommendedPathway.includes('Jual') },
                { label: 'Simpan',   icon: '❄️', recommended: result.recommendedPathway.includes('Simpan') || result.recommendedPathway.includes('Monitor') },
                { label: 'Proses',   icon: '🏭', recommended: result.recommendedPathway.includes('Olah') },
                { label: 'Redirect', icon: '↗️', recommended: false },
                { label: 'Kompos',   icon: '♻️', recommended: false },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={onViewScenarios}
                  className={`flex flex-col items-center gap-xs p-md rounded-DEFAULT border transition-all hover:-translate-y-0.5 duration-150
                    ${p.recommended
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant bg-surface-container-low text-secondary hover:border-primary'
                    }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-label-md font-semibold">{p.label}</span>
                  {p.recommended && (
                    <span className="text-[9px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full font-bold">AI Pick</span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
