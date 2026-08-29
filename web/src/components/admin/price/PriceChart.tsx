import { useMemo } from 'react'
import { formatRupiah, formatDate } from '@/utils/format'
import type { CropPrice } from '@/hooks/useCropPrices'

interface Props {
  prices: CropPrice[]
  days?: 7 | 30
  onDaysChange?: (d: 7 | 30) => void
}

export function PriceChart({ prices, days = 7, onDaysChange }: Props) {
  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return prices
      .filter(p => new Date(p.recorded_at) >= cutoff)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
  }, [prices, days])

  if (filtered.length === 0) {
    return (
      <div className="h-64 w-full bg-surface-container-low rounded-2xl border border-outline-variant border-dashed flex items-center justify-center">
        <p className="text-label-md text-on-surface-variant">Belum ada data untuk periode {days} hari</p>
      </div>
    )
  }

  const values = filtered.map(p => Number(p.price))
  const maxVal = Math.max(...values)
  const minVal = Math.min(...values)
  const range  = maxVal - minVal || 1

  const W = 800, H = 240, pad = 40

  const points = filtered.map((p, i) => ({
    x:     pad + (i / Math.max(filtered.length - 1, 1)) * (W - pad * 2),
    y:     pad + (1 - (Number(p.price) - minVal) / range) * (H - pad * 2),
    price: p.price,
    date:  p.recorded_at,
  }))

  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-lg">
      <div className="flex justify-between items-center mb-md flex-wrap gap-sm">
        <h3 className="text-headline-md font-semibold text-on-surface">Pergerakan Harga ({days} Hari)</h3>
        <div className="flex gap-xs">
          {([7, 30] as const).map(d => (
            <button key={d} onClick={() => onDaysChange?.(d)}
              className={`px-md py-xs rounded-full text-label-md font-bold transition-colors ${
                days === d ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              {d} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mb-sm text-label-md text-on-surface-variant">
        <span>Maks: {formatRupiah(maxVal)}</span>
        <span>Min: {formatRupiah(minVal)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1={pad} x2={W - pad}
            y1={pad + p * (H - pad * 2)} y2={pad + p * (H - pad * 2)}
            stroke="#bccabb" strokeDasharray="4 4" strokeWidth="0.8" />
        ))}
        <path d={pathD} fill="none" stroke="#006d36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${H - pad} L ${points[0].x} ${H - pad} Z`}
          fill="#006d36" opacity="0.08" />
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#fff" stroke="#006d36" strokeWidth="2" />
            <title>{formatDate(pt.date)}: {formatRupiah(pt.price)}</title>
          </g>
        ))}
        {points.map((pt, i) => (
          i % Math.max(Math.ceil(points.length / 5), 1) === 0 ? (
            <text key={`lbl-${i}`} x={pt.x} y={H - 8} textAnchor="middle" fontSize="10" fill="#6d7b6d">
              {formatDate(pt.date)}
            </text>
          ) : null
        ))}
      </svg>
    </div>
  )
}
