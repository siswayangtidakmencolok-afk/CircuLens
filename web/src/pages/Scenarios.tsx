import type { AIResult } from '../services/aiService'
import { formatIDR } from '../services/aiService'

interface ScenariosProps {
  result: AIResult | null
  batchName: string
  onBack: () => void
  onSelectPathway: (label: string) => void
  onSaveBatch: (pathway: string) => void
}

export default function Scenarios({ result, batchName, onBack, onSelectPathway, onSaveBatch }: ScenariosProps) {
  const options = result?.scenarioOptions ?? defaultOptions
  const mp = result?.marketPrice

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-md mb-xl">
        <div>
          <p className="cl-label text-secondary mb-xs">Scenario Intelligence</p>
          <h1 className="cl-display text-on-surface">What-If Comparison</h1>
          {batchName && <p className="text-body-md text-secondary mt-xs">{batchName}</p>}
        </div>
        <button onClick={onBack}
          className="flex items-center gap-xs border border-outline-variant px-lg py-sm rounded-full text-body-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shrink-0">
          <span className="material-symbols-outlined text-sm">arrow_back</span>Kembali
        </button>
      </div>

      {/* Demo + market price note */}
      <div className="flex items-center gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-sm mb-lg">
        <span className="shrink-0">⚗️</span>
        <p className="text-body-sm text-amber-800 font-semibold">
          Prototype AI — Estimasi demo.{' '}
          <span className="font-normal">Bukan saran keuangan atau pertanian profesional.
          {mp && ` Referensi harga: ${formatIDR(mp.pricePerKg)}/kg (${mp.source}, ${mp.lastUpdated}).`}
          </span>
        </p>
      </div>

      {/* Sell vs Store quick comparison */}
      <div className="cl-card mb-lg">
        <p className="cl-label text-secondary mb-sm">Quick Comparison</p>
        <h3 className="cl-title text-on-surface mb-md">Jual Sekarang vs Simpan + Monitor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {options.slice(0, 2).map(opt => (
            <div key={opt.label}
              className={`rounded-2xl p-lg border-2 ${opt.recommended ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low'}`}>
              <div className="flex items-center gap-sm mb-md">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className="cl-label text-secondary">{opt.recommended ? '✅ Direkomendasikan' : 'Alternatif'}</p>
                  <p className="cl-title text-on-surface">{opt.label}</p>
                </div>
              </div>
              {/* Value bar */}
              <div className="mb-md">
                <div className="flex justify-between mb-xs">
                  <p className="cl-label text-secondary">Nilai terjaga</p>
                  <p className="text-body-lg font-black text-on-surface">{opt.estimatedValueRetained}%</p>
                </div>
                <div className="cl-progress-track">
                  <div className={`cl-progress-fill ${opt.recommended ? 'bg-primary' : 'bg-secondary-container'}`}
                    style={{ width: `${opt.estimatedValueRetained}%` }} />
                </div>
              </div>
              {/* Consequence */}
              <p className="text-body-sm text-secondary italic mb-md border-l-2 border-primary/40 pl-sm">
                {opt.consequence}
              </p>
              <p className="cl-label text-secondary mb-sm">Waktu: <span className="text-on-surface font-semibold">{opt.timeframe}</span></p>
              <div className="flex flex-col gap-xs mb-md">
                {opt.pros.map(p => (
                  <div key={p} className="flex gap-xs text-body-sm">
                    <span className="text-green-600 font-bold shrink-0">+</span>
                    <span className="text-secondary">{p}</span>
                  </div>
                ))}
                {opt.cons.map(c => (
                  <div key={c} className="flex gap-xs text-body-sm">
                    <span className="text-red-500 font-bold shrink-0">−</span>
                    <span className="text-secondary">{c}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { onSaveBatch(opt.label); onSelectPathway(opt.label) }}
                className={`w-full py-sm rounded-full text-body-sm font-bold transition-all flex items-center justify-center gap-xs
                  ${opt.recommended ? 'bg-primary text-on-primary hover:bg-primary/90' : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'}`}>
                <span className="material-symbols-outlined text-sm">save</span>
                Pilih & Simpan
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All scenarios */}
      <div className="cl-card mb-lg">
        <p className="cl-label text-secondary mb-sm">Semua Opsi</p>
        <h3 className="cl-title text-on-surface mb-lg">Perbandingan Lengkap</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-md">
          {options.map(opt => (
            <div key={opt.label}
              className={`relative rounded-2xl p-md flex flex-col gap-sm border-2 ${opt.recommended ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low'}`}>
              {opt.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary cl-label px-3 py-1 rounded-full shadow whitespace-nowrap">
                  ✅ AI Pick
                </span>
              )}
              <div className="flex items-center gap-sm mt-1">
                <span className="text-2xl">{opt.icon}</span>
                <p className="text-body-sm font-bold text-on-surface">{opt.label}</p>
              </div>
              <div>
                <div className="flex justify-between mb-xs">
                  <p className="cl-label text-secondary">Nilai</p>
                  <p className="text-body-md font-black text-on-surface">{opt.estimatedValueRetained}%</p>
                </div>
                <div className="cl-progress-track">
                  <div className={`cl-progress-fill ${opt.recommended ? 'bg-primary' : 'bg-secondary-container'}`}
                    style={{ width: `${opt.estimatedValueRetained}%` }} />
                </div>
              </div>
              <p className="cl-label text-secondary">{opt.timeframe}</p>
              <p className="text-[11px] text-secondary italic leading-relaxed">{opt.consequence}</p>
              <button
                onClick={() => { onSaveBatch(opt.label); onSelectPathway(opt.label) }}
                className={`mt-auto w-full py-xs rounded-full text-body-sm font-semibold transition-colors flex items-center justify-center gap-xs
                  ${opt.recommended ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:bg-surface-container-lowest'}`}>
                <span className="material-symbols-outlined text-sm">save</span>
                Pilih
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Circular pathway */}
      <div className="cl-card">
        <p className="cl-label text-secondary mb-sm">Circular Economy</p>
        <h3 className="cl-title text-on-surface mb-lg">Jalur Sirkular</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
          {[
            { label: 'Jual',     icon: '🛒', desc: 'Pasar segar / distributor',   rec: false },
            { label: 'Olah',     icon: '🏭', desc: 'Pasta, saus, produk kering',  rec: true  },
            { label: 'Simpan',   icon: '❄️', desc: 'Cold storage, perpanjang umur', rec: false },
            { label: 'Redirect', icon: '↗️', desc: 'Pasar horeca / alternatif',   rec: false },
            { label: 'Kompos',   icon: '♻️', desc: 'Input pertanian organik',     rec: false },
          ].map(p => (
            <button key={p.label}
              onClick={() => { onSaveBatch(p.label); onSelectPathway(p.label) }}
              className={`flex flex-col items-center gap-sm p-md rounded-2xl border-2 transition-all hover:-translate-y-1 text-center
                ${p.rec ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:border-primary'}`}>
              <span className="text-3xl">{p.icon}</span>
              <p className="text-body-sm font-bold text-on-surface">{p.label}</p>
              <p className="text-[11px] text-secondary">{p.desc}</p>
              {p.rec && <span className="cl-label bg-primary text-on-primary px-2 py-0.5 rounded-full">Recommended</span>}
            </button>
          ))}
        </div>
      </div>

      <p className="text-body-sm font-bold text-primary italic text-center mt-lg">
        "CircuLens recommends. You decide."
      </p>
    </main>
  )
}

const defaultOptions = [
  { label: 'Jual Sekarang',       icon: '🛒', estimatedValueRetained: 62, estimatedLossPercent: 38, timeframe: 'Hari ini',  pros: ['Nilai tunai segera'], cons: ['Harga sub-optimal'], consequence: 'Batch terjual hari ini ~62% nilai.', recommended: false },
  { label: 'Simpan + Monitor',    icon: '❄️', estimatedValueRetained: 78, estimatedLossPercent: 22, timeframe: '1–2 hari', pros: ['Nilai lebih tinggi'], cons: ['Biaya storage'],      consequence: 'Nilai ~78% jika suhu terjaga.',   recommended: true  },
  { label: 'Olah Menjadi Produk', icon: '🏭', estimatedValueRetained: 55, estimatedLossPercent: 45, timeframe: '2–4 hari', pros: ['Tanpa risiko busuk'],  cons: ['Perlu fasilitas'],   consequence: 'Produk olahan nilai stabil ~55%.', recommended: false },
  { label: 'Redirect',            icon: '↗️', estimatedValueRetained: 68, estimatedLossPercent: 32, timeframe: 'Besok',    pros: ['Pasar horeca'],        cons: ['Perlu jaringan'],    consequence: 'Dijual ke horeca ~68%.',           recommended: false },
  { label: 'Kompos',              icon: '♻️', estimatedValueRetained: 5,  estimatedLossPercent: 95, timeframe: 'Segera',   pros: ['Cegah kontaminasi'],   cons: ['Loss hampir total'], consequence: 'Nilai hampir nol, input pertanian.', recommended: false },
]
