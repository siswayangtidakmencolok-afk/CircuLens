/**
 * CircuLens local storage helpers.
 * All batch data is stored in localStorage — no backend required.
 */

import type { RiskLevel, Pathway } from './mockData'

export interface SavedBatch {
  id: string
  name: string
  date: string
  condition: string
  risk: RiskLevel
  pathway: Pathway
  quantity: string
  lossExposure: number
  riskScore: number
  selectedPathway: string
}

const KEY = 'circulens_batches'

export function loadBatches(): SavedBatch[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedBatch[]) : []
  } catch {
    return []
  }
}

export function saveBatch(batch: SavedBatch): void {
  const existing = loadBatches()
  // Prepend so newest is first
  const updated = [batch, ...existing]
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'Tinggi'
  if (score >= 40) return 'Sedang'
  return 'Rendah'
}

export function pathwayFromLabel(label: string): Pathway {
  const map: Record<string, Pathway> = {
    'Jual Sekarang': 'Pasar Segar',
    Jual:            'Pasar Segar',
    'Simpan + Monitor': 'Cold Storage',
    Simpan:          'Cold Storage',
    'Olah Menjadi Produk': 'Olah Pasta',
    Olah:            'Olah Pasta',
    Proses:          'Olah Pasta',
    Redirect:        'Redirect',
    Kompos:          'Kompos',
    Pengeringan:     'Pengeringan',
  }
  return map[label] ?? 'Pasar Segar'
}
