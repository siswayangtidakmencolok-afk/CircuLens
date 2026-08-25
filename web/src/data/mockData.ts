export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi'
export type Pathway = 'Pasar Segar' | 'Pengeringan' | 'Olah Pasta' | 'Cold Storage' | 'Kompos' | 'Redirect'

export interface Batch {
  id: string
  date: string
  condition: string
  risk: RiskLevel
  pathway: Pathway
}

export const mockBatches: Batch[] = [
  { id: '#B-492', date: '12 Okt 2023', condition: 'Kadar air 85%',  risk: 'Tinggi', pathway: 'Olah Pasta'    },
  { id: '#B-491', date: '11 Okt 2023', condition: 'Optimal',         risk: 'Rendah', pathway: 'Pasar Segar'  },
  { id: '#B-490', date: '10 Okt 2023', condition: 'Sedikit memar',   risk: 'Sedang', pathway: 'Pengeringan'  },
  { id: '#B-489', date: '09 Okt 2023', condition: 'Diskolorasi',     risk: 'Sedang', pathway: 'Redirect'     },
  { id: '#B-488', date: '08 Okt 2023', condition: 'Segar',           risk: 'Rendah', pathway: 'Pasar Segar'  },
]

export const historyBatches: Batch[] = [
  { id: 'CHL-23-1042', date: '24 Okt 2023', condition: 'High moisture', risk: 'Tinggi', pathway: 'Olah Pasta'    },
  { id: 'CHL-23-1041', date: '23 Okt 2023', condition: 'Normal',         risk: 'Rendah', pathway: 'Pasar Segar'  },
  { id: 'CHL-23-1040', date: '22 Okt 2023', condition: 'Low risk',       risk: 'Rendah', pathway: 'Cold Storage'  },
  { id: 'CHL-23-1039', date: '21 Okt 2023', condition: 'Bruising',       risk: 'Tinggi', pathway: 'Redirect'      },
  { id: 'CHL-23-1038', date: '20 Okt 2023', condition: 'Discolored',     risk: 'Sedang', pathway: 'Pengeringan'   },
  { id: 'CHL-23-1037', date: '19 Okt 2023', condition: 'Optimal',        risk: 'Rendah', pathway: 'Pasar Segar'  },
]

export const kpis = {
  totalBatch:     142,
  totalDelta:     '+12 minggu ini',
  risikoTinggi:   18,
  perluTindakan:  5,
  estimasiLoss:   '12%',
  lossDelta:      '-2% vs bln lalu',
}

export const riskDistribution = { Rendah: 65, Sedang: 22, Tinggi: 13 }

export const pathwaySummary = [
  { label: 'Pasar Segar', icon: '🛒', count: 9,  pct: 37 },
  { label: 'Pengeringan', icon: '☀️', count: 5,  pct: 21 },
  { label: 'Olah Pasta',  icon: '🏭', count: 5,  pct: 21 },
  { label: 'Redirect',    icon: '↗️', count: 3,  pct: 13 },
  { label: 'Kompos',      icon: '♻️', count: 2,  pct: 8  },
]
