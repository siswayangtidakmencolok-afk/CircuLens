/**
 * CircuLens AI Service
 *
 * ⚗️ DEMO MODE — model inference not connected.
 * Returns deterministic mock results that mirror the real model interface.
 * To connect the real model: replace the body of `analyzeImage()` with
 * ONNX Runtime Web inference — all callers stay unchanged.
 */

export interface MarketPrice {
  pricePerKg: number          // IDR
  unit: string
  lastUpdated: string         // e.g. "Aug 2026"
  source: string
  note: string
}

export interface AIResult {
  isDemo: true
  condition: 'Fresh' | 'Moderate' | 'High Risk'
  riskScore: number           // 0–100
  lossExposure: number        // estimated % loss
  confidence: number          // 0–100 (demo)
  visualFindings: VisualFinding[]
  explanations: string[]
  recommendedPathway: string
  storageAdvice: string
  marketPrice: MarketPrice
  scenarioOptions: ScenarioOption[]
}

export interface VisualFinding {
  label: string
  severity: 'ok' | 'warn' | 'critical'
  detail: string
}

export interface ScenarioOption {
  label: string
  icon: string
  estimatedValueRetained: number
  estimatedLossPercent: number
  timeframe: string
  pros: string[]
  cons: string[]
  consequence: string        // one-sentence outcome description
  recommended: boolean
}

/** Reference market price — static reference data, NOT real-time. */
export const MARKET_PRICE_REFERENCE: MarketPrice = {
  pricePerKg: 35000,
  unit: 'IDR/kg',
  lastUpdated: 'Aug 2026',
  source: 'PIHPS Nasional (referensi)',
  note: 'Harga referensi pasar. Bukan data real-time. Konfirmasi ke pasar setempat.',
}

export async function analyzeImage(_imageFile: File): Promise<AIResult> {
  // Simulate processing (1.5–2s)
  await new Promise(res => setTimeout(res, 1600 + Math.random() * 400))

  return {
    isDemo: true,
    condition: 'Moderate',
    riskScore: 52,
    lossExposure: 28,
    confidence: 91,

    visualFindings: [
      { label: 'Surface Moisture',  severity: 'warn',     detail: 'Kondensasi terdeteksi pada ~15% permukaan yang terlihat' },
      { label: 'Color Uniformity',  severity: 'warn',     detail: 'Warna tidak merata — indikasi awal diskolorasi pada tangkai' },
      { label: 'Size Uniformity',   severity: 'ok',       detail: 'Ukuran batch seragam — tidak ada outlier signifikan' },
      { label: 'Surface Damage',    severity: 'ok',       detail: 'Tidak ada kerusakan fisik yang terdeteksi secara visual' },
      { label: 'Visible Mold',      severity: 'ok',       detail: 'Tidak ada tanda-tanda jamur yang terlihat' },
    ],

    explanations: [
      'Kelembaban permukaan terdeteksi pada ~15% area — meningkatkan risiko deteriorasi jika tidak ditangani',
      'Ketidakseragaman warna pada tangkai mengindikasikan awal proses pembusukan — butuh monitoring 24 jam',
      'Ukuran dan bentuk batch secara keseluruhan seragam — faktor positif untuk nilai pasar',
      'Berdasarkan pola visual, kondisi batch masih dapat diselamatkan dengan penanganan tepat',
    ],

    recommendedPathway: 'Simpan + Monitor 24 Jam',
    storageAdvice: 'Simpan di suhu 8–12°C dengan sirkulasi udara baik. Kurangi kelembaban relatif ke 85–90%. Periksa kembali dalam 24 jam.',

    marketPrice: MARKET_PRICE_REFERENCE,

    scenarioOptions: [
      {
        label: 'Jual Sekarang',
        icon: '🛒',
        estimatedValueRetained: 62,
        estimatedLossPercent: 38,
        timeframe: 'Hari ini',
        pros: [
          'Nilai tunai segera — tidak ada risiko deteriorasi lebih lanjut',
          'Tidak perlu biaya penyimpanan tambahan',
        ],
        cons: [
          'Harga diskon karena kondisi sub-optimal (~38% di bawah harga optimal)',
          'Pembeli mungkin menegosiasikan harga lebih rendah',
        ],
        consequence: 'Batch terjual hari ini dengan nilai ~62% dari potensi maksimal. Risiko loss berhenti di sini.',
        recommended: false,
      },
      {
        label: 'Simpan + Monitor',
        icon: '❄️',
        estimatedValueRetained: 78,
        estimatedLossPercent: 22,
        timeframe: '1–2 hari',
        pros: [
          'Potensi nilai 16% lebih tinggi jika kondisi stabil setelah pendinginan',
          'Waktu untuk mencari pembeli dengan harga lebih baik',
        ],
        cons: [
          'Biaya penyimpanan cold storage Rp 500–1.500/kg/hari',
          'Risiko deteriorasi berlanjut jika suhu tidak terkontrol',
        ],
        consequence: 'Jika suhu terjaga 8–12°C, batch dapat dijual dengan nilai ~78% dalam 1–2 hari.',
        recommended: true,
      },
      {
        label: 'Olah Menjadi Produk',
        icon: '🏭',
        estimatedValueRetained: 55,
        estimatedLossPercent: 45,
        timeframe: '2–4 hari',
        pros: [
          'Eliminasi risiko pembusukan sepenuhnya',
          'Nilai produk olahan (pasta/bubuk) lebih stabil',
        ],
        cons: [
          'Membutuhkan fasilitas pengolahan dan biaya produksi',
          'Nilai per kg lebih rendah dibanding jual segar',
        ],
        consequence: 'Batch diolah menjadi produk dengan nilai ~55% dari harga segar, namun tanpa risiko kehilangan total.',
        recommended: false,
      },
      {
        label: 'Redirect ke Pasar Lain',
        icon: '↗️',
        estimatedValueRetained: 68,
        estimatedLossPercent: 32,
        timeframe: 'Hari ini – besok',
        pros: [
          'Pasar horeca/restoran sering menerima produk kondisi B dengan harga kompetitif',
          'Lebih cepat dari pengolahan',
        ],
        cons: [
          'Perlu jaringan pembeli alternatif',
          'Transportasi tambahan menambah biaya',
        ],
        consequence: 'Batch diarahkan ke pasar horeca atau industri dengan nilai ~68% hari ini/besok.',
        recommended: false,
      },
      {
        label: 'Kompos',
        icon: '♻️',
        estimatedValueRetained: 5,
        estimatedLossPercent: 95,
        timeframe: 'Segera',
        pros: [
          'Opsi terakhir — mencegah pemborosan total',
          'Nilai kompos dapat digunakan untuk input pertanian',
        ],
        cons: [
          'Hampir kehilangan seluruh nilai ekonomi batch',
        ],
        consequence: 'Batch dijadikan kompos. Nilai ekonomi hampir nol, tapi mencegah kontaminasi batch lain.',
        recommended: false,
      },
    ],
  }
}

/** Helper: compute estimated batch value from quantity and loss */
export function estimateBatchValue(quantityKg: number, lossPercent: number, pricePerKg: number): {
  grossValue: number
  netValue: number
  lossValue: number
} {
  const grossValue = quantityKg * pricePerKg
  const lossValue  = grossValue * (lossPercent / 100)
  const netValue   = grossValue - lossValue
  return { grossValue, netValue, lossValue }
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}
