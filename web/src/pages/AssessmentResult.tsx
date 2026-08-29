import type { AIResult } from '../services/aiService'
import { estimateBatchValue, formatIDR } from '../services/aiService'

interface AssessmentResultProps {
  result: AIResult
  batchName: string
  batchId: string
  quantity: string
  onBack: () => void
  onViewScenarios: () => void
  onSaveBatch: (pathway: string) => void
}

const severityConfig = {
  ok:       { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-800',  label: 'OK'       },
  warn:     { dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-800',  label: 'Perhatian' },
  critical: { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-800',      label: 'Kritis'    },
}

const conditionConfig = {
  Fresh:       { bar: 'bg-green-500', ring: 'ring-green-200', bg: 'bg-green-50',  text: 'text-green-800', emoji: '🟢' },
  Moderate:    { bar: 'bg-amber-500', ring: 'ring-amber-200', bg: 'bg-amber-50',  text: 'text-amber-800', emoji: '🟡' },
  'High Risk': { bar: 'bg-red-500',   ring: 'ring-red-200',   bg: 'bg-red-50',    text: 'text-red-800',   emoji: '🔴' },
}

export default function AssessmentResult({
  result, batchName, batchId, quantity,
  onBack, onViewScenarios, onSaveBatch,
}: AssessmentResultProps) {
  const cc        = conditionConfig[result.condition]
  const qtyNum    = parseFloat(quantity) || 0
  const valCalc   = qtyNum > 0
    ? estimateBatchValue(qtyNum, result.lossExposure, result.marketPrice.pricePerKg)
    : null

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md mb-xl">
        <div>
          <p className="cl-label text-secondary mb-xs">Hasil Analisis</p>
          <h1 className="cl-display text-on-surface">
            {batchName || 'Batch Assessment'}
          </h1>
          <p className="text-body-sm text-secondary mt-xs font-mono">
            {batchId}{quantity ? ` · ${quantity} kg` : ''}
          </p>
        </div>
        <div className="flex gap-sm flex-wrap shrink-0">
          <button onClick={onBack}
            className="flex items-center gap-xs border border-outline-variant px-lg py-sm rounded-full text-body-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Analisis Baru
          </button>
          <button onClick={() => onSaveBatch(result.recommendedPathway)}
            className="flex items-center gap-xs border border-primary text-primary px-lg py-sm rounded-full text-body-sm font-semibold hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-sm">bookmark</span>Simpan
          </button>
          <button onClick={onViewScenarios}
            className="flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-full text-body-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">fork_right</span>Lihat Skenario
          </button>
        </div>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-sm mb-lg">
        <span className="shrink-0">⚗️</span>
        <p className="text-body-sm text-amber-800 font-semibold">
          Prototype AI — Demo Mode.{' '}
          <span className="font-normal">Hasil ini adalah prediksi demo, bukan output model nyata. CircuLens recommends. You decide.</span>
        </p>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">

        {/* LEFT column */}
        <div className="flex flex-col gap-lg">

          {/* Condition hero */}
          <div className={`cl-card ${cc.bg} ring-2 ${cc.ring} !border-0`}>
            <p className="cl-label text-on-surface/60 mb-sm">Kondisi Visual</p>
            <div className="flex items-center gap-md">
              <span className="text-4xl">{cc.emoji}</span>
              <div>
                <p className={`text-2xl font-black ${cc.text}`}>{result.condition}</p>
                <p className="text-body-sm text-on-surface/60 mt-xs">
                  ⚗️ Demo confidence: {result.confidence}%
                </p>
              </div>
            </div>
          </div>

          {/* Risk score */}
          <div className="cl-card">
            <div className="flex items-center justify-between mb-sm">
              <p className="cl-label text-secondary">Risk Score</p>
              <p className="text-headline-md font-black text-on-surface">{result.riskScore}<span className="text-body-sm font-normal text-secondary">/100</span></p>
            </div>
            <div className="cl-progress-track">
              <div className={`cl-progress-fill ${result.riskScore > 70 ? 'bg-red-500' : result.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${result.riskScore}%` }} />
            </div>
            <div className="flex justify-between mt-xs">
              <span className="cl-label text-green-600">Low</span>
              <span className="cl-label text-amber-600">Medium</span>
              <span className="cl-label text-red-600">High</span>
            </div>
          </div>

          {/* Food loss risk */}
          <div className="cl-card">
            <p className="cl-label text-secondary mb-sm">Food Loss Exposure</p>
            <p className="cl-kpi-value text-error">{result.lossExposure}%</p>
            <p className="text-body-sm text-secondary mt-xs">Estimasi risiko kehilangan nilai produk</p>
          </div>

          {/* Market price reference */}
          <div className="cl-card bg-surface-container-low border-surface-container-high">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-tertiary text-base">store</span>
              <p className="cl-label text-tertiary">Referensi Harga Pasar</p>
            </div>
            <p className="cl-kpi-value text-on-surface">{formatIDR(result.marketPrice.pricePerKg)}</p>
            <p className="text-body-sm text-secondary">{result.marketPrice.unit}</p>
            <p className="text-[11px] text-secondary mt-sm">
              Sumber: {result.marketPrice.source} · Update: {result.marketPrice.lastUpdated}
            </p>
            <p className="text-[11px] text-amber-600 mt-xs font-semibold">
              ⚠️ {result.marketPrice.note}
            </p>

            {/* Batch value estimate */}
            {valCalc && (
              <div className="mt-md pt-md border-t border-outline-variant grid grid-cols-3 gap-sm text-center">
                <div>
                  <p className="cl-label text-secondary">Nilai Kotor</p>
                  <p className="text-body-md font-bold text-on-surface mt-xs">{formatIDR(valCalc.grossValue)}</p>
                </div>
                <div>
                  <p className="cl-label text-error">Est. Loss</p>
                  <p className="text-body-md font-bold text-error mt-xs">−{formatIDR(valCalc.lossValue)}</p>
                </div>
                <div>
                  <p className="cl-label text-primary">Est. Bersih</p>
                  <p className="text-body-md font-bold text-primary mt-xs">{formatIDR(valCalc.netValue)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-lg">

          {/* Visual findings */}
          <div className="cl-card">
            <p className="cl-label text-secondary mb-sm">Visual Findings</p>
            <h3 className="cl-title text-on-surface mb-md">Faktor yang Terdeteksi</h3>
            <div className="flex flex-col divide-y divide-outline-variant/40">
              {result.visualFindings.map((f, i) => {
                const sc = severityConfig[f.severity]
                return (
                  <div key={i} className="flex items-start gap-md py-sm first:pt-0 last:pb-0 hover:bg-surface-container-low transition-colors -mx-sm px-sm rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${sc.dot} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-sm flex-wrap">
                        <span className="text-body-sm font-bold text-on-surface">{f.label}</span>
                        <span className={`cl-label px-2 py-0.5 rounded-full ${sc.badge}`}>{sc.label}</span>
                      </div>
                      <p className="text-body-sm text-secondary mt-xs">{f.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI reasoning */}
          <div className="cl-card">
            <div className="flex items-center gap-sm mb-md">
              <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              <p className="cl-title text-on-surface">AI Reasoning</p>
              <span className="cl-label bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⚗️ Demo</span>
            </div>
            <ul className="flex flex-col gap-sm">
              {result.explanations.map((exp, i) => (
                <li key={i} className="flex items-start gap-sm text-body-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-[6px] shrink-0" />
                  {exp}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="cl-card bg-primary/5 !border-primary/30 ring-2 ring-primary/10">
            <div className="flex items-start gap-md mb-md">
              <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary fill">lightbulb</span>
              </div>
              <div>
                <p className="cl-label text-primary mb-xs">Rekomendasi AI</p>
                <p className="cl-title text-on-surface">{result.recommendedPathway}</p>
              </div>
            </div>
            <p className="text-body-sm text-secondary mb-md">{result.storageAdvice}</p>

            {/* Pathway quick-pick */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-sm mb-md">
              {result.scenarioOptions.slice(0, 5).map(opt => (
                <button key={opt.label} onClick={onViewScenarios}
                  className={`flex flex-col items-center gap-xs p-sm rounded-2xl border text-center transition-all hover:-translate-y-0.5
                    ${opt.recommended ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-low hover:border-primary'}`}>
                  <span className="text-xl">{opt.icon}</span>
                  <span className="cl-label text-on-surface">{opt.label.split(' ')[0]}</span>
                  {opt.recommended && <span className="cl-label bg-primary text-on-primary px-1.5 py-0.5 rounded-full">Pick</span>}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-sm pt-md border-t border-primary/20">
              <p className="text-body-sm font-bold text-primary italic">"CircuLens recommends. You decide."</p>
              <button onClick={onViewScenarios}
                className="flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-full text-body-sm font-bold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">fork_right</span>Bandingkan Skenario
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
