import { useMemo } from 'react'
import type { CropPrice } from './useCropPrices'

export interface PriceTrend {
  current: number
  previous: number
  changePercent: number
  direction: 'up' | 'down' | 'stable'
  average7d: number
  total: number
}

export function usePriceTrend(prices: CropPrice[], selectedCrop?: string): PriceTrend | null {
  return useMemo(() => {
    const filtered = selectedCrop
      ? prices.filter(p => p.crop_name === selectedCrop)
      : prices

    if (filtered.length < 2) return null

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )

    const current  = Number(sorted[0].price)
    const previous = Number(sorted[1].price)
    const change   = previous === 0 ? 0 : ((current - previous) / previous) * 100

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recent = filtered.filter(p => new Date(p.recorded_at) >= sevenDaysAgo)
    const avg7   = recent.length === 0
      ? current
      : recent.reduce((s, p) => s + Number(p.price), 0) / recent.length

    return {
      current,
      previous,
      changePercent: Number(change.toFixed(2)),
      direction:     change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable',
      average7d:     Number(avg7.toFixed(2)),
      total:         filtered.length,
    }
  }, [prices, selectedCrop])
}
