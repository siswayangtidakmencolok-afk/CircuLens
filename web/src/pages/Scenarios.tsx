import type { AIResult } from '../services/aiService'

interface ScenariosProps {
  result: AIResult | null
  onBack: () => void
  onSelectPathway: (label: string) => void
}

export default function Scenarios({ result, onBack, onSelectPathway }: ScenariosProps) {
  const options = result?.scenarioOptions ?? [
    {
      label: 'Jual Sekarang', icon: '🛒',
      estimatedValueRetained: 60, timeframe: 'Hari ini',
      pros: ['Nilai tunai segera'], cons: ['Harga di bawah optimal'],
      recommended: false,
    },
    {
      label: 'Simpan + Monitor', icon: '❄️',
      estimatedValueRetained: 75, timeframe: '1–2 hari',
      pros: ['Nilai lebih tinggi'], cons: ['Biaya penyimpanan'],
      recommended: true,
    },
    {
      label: 'Olah Menjadi Produk', icon: '🏭',
      estimatedValueRetained: 55, timeframe: '2–3 hari',
      pros: ['Eliminasi risiko pembusukan'], cons: ['Perlu fasilitas'],
      recommended: false,
    },
  ]

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">
      <div className="flex items-center justify-between mb-xl flex-wrap gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Skenario & Perbandingan</h2>
          <p className="text-body-md text-secondary">Bandingkan jalur penanganan dan estimasi hasil.</p>
        </div>
        <button
          onClick={onBack}
          className="border border-outline-variant px-lg py-sm rounded-full text-body-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Kembali
        </button>
      </div>

      {/* Demo banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-DEFAULT px-lg py-sm mb-lg flex items-center gap-sm">
        <span>⚗️</span>
        <p className="text-body-sm text-amber-800 font-medium">
          Prototype AI — Estimasi adalah prediksi demo. Bukan saran keuangan atau pertanian profesional.
        </p>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {options.map(opt => (
          <div
            key={opt.label}
            className={`rounded-DEFAULT p-lg flex flex-col gap-md shadow-sm border-2 relative
              ${opt.recommended ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}
          >
            {opt.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full shadow">
                  ✅ Direkomendasikan AI
                </span>
              </div>
            )}

            <div className="flex items-center gap-sm mt-2">
              <div className="w-10 h-10 rounded-DEFAULT bg-surface-container-low flex items-center justify-center text-xl">{opt.icon}</div>
              <div>
                <p className="text-body-sm text-secondary">Skenario</p>
                <p className="text-body-md font-bold text-on-surface">{opt.label}</p>
              </div>
            </div>

            {/* Value retained bar */}
            <div>
              <div className="flex justify-between mb-xs">
                <span className="text-label-md text-secondary">Estimasi nilai terjaga</span>
                <span className="text-headline-sm font-bold text-on-surface">{opt.estimatedValueRetained}%</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${opt.recommended ? 'bg-primary' : 'bg-secondary-container'}`}
                  style={{ width: `${opt.estimatedValueRetained}%` }}
                />
              </div>
            </div>

            <div className="flex gap-md text-body-sm flex-wrap">
              <div><span className="text-secondary">Waktu: </span><span className="font-semibold text-on-surface">{opt.timeframe}</span></div>
            </div>

            <div className="flex flex-col gap-xs border-t border-outline-variant pt-md">
              {opt.pros.map(p => (
                <div key={p} className="flex gap-xs text-body-sm">
                  <span className="text-green-500 font-bold">+</span>
                  <span className="text-secondary">{p}</span>
                </div>
              ))}
              {opt.cons.map(c => (
                <div key={c} className="flex gap-xs text-body-sm">
                  <span className="text-red-400 font-bold">−</span>
                  <span className="text-secondary">{c}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectPathway(opt.label)}
              className={`w-full mt-auto py-sm rounded-full text-body-sm font-semibold transition-colors
                ${opt.recommended
                  ? 'bg-primary text-on-primary hover:bg-primary/90'
                  : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
            >
              Pilih Jalur Ini
            </button>
          </div>
        ))}
      </div>

      {/* Circular pathway */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-lg shadow-sm">
        <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Jalur Sirkular</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-md">
          {[
            { label: 'Jual',     icon: '🛒', desc: 'Pasar segar atau distributor',     recommended: false },
            { label: 'Olah',     icon: '🏭', desc: 'Pasta, saus, produk kering',      recommended: true  },
            { label: 'Simpan',   icon: '❄️', desc: 'Cold storage, perpanjang umur',   recommended: false },
            { label: 'Redirect', icon: '↗️', desc: 'Alihkan ke pasar alternatif',     recommended: false },
            { label: 'Kompos',   icon: '♻️', desc: 'Minimal loss recovery',           recommended: false },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => onSelectPathway(p.label)}
              className={`flex flex-col items-center gap-sm p-md rounded-DEFAULT transition-all hover:-translate-y-1 duration-150 border
                ${p.recommended ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low hover:border-primary'}`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-body-sm font-bold text-on-surface">{p.label}</span>
              <span className="text-[11px] text-secondary text-center">{p.desc}</span>
              {p.recommended && (
                <span className="text-[9px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">Direkomendasikan</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="text-body-sm font-bold text-primary italic mt-lg text-center">
        "CircuLens recommends. You decide."
      </p>
    </main>
  )
}
