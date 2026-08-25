/**
 * CircuLens AI Service — MOCK / DEMO PROVIDER
 *
 * ⚗️ Demo AI — model inference not connected.
 * This returns deterministic mock results.
 * Replace `mockProvider` with a real ONNX Runtime Web implementation
 * when the trained model is available — the interface stays the same.
 */

export interface AIResult {
  isDemo: true
  condition: 'Fresh' | 'Moderate' | 'High Risk'
  riskScore: number          // 0–100
  lossExposure: number       // estimated % loss
  confidence: number         // 0–100 (demo only)
  explanations: string[]
  recommendedPathway: string
  storageAdvice: string
  scenarioOptions: ScenarioOption[]
}

export interface ScenarioOption {
  label: string
  icon: string
  estimatedValueRetained: number  // percent
  timeframe: string
  pros: string[]
  cons: string[]
  recommended: boolean
}

const DEMO_DISCLAIMER = '⚗️ Demo AI — Prototype inference. Bukan prediksi model nyata.'

export async function analyzeImage(_imageFile: File): Promise<AIResult> {
  // Simulate async processing delay
  await new Promise(res => setTimeout(res, 1800))

  // Deterministic demo result
  return {
    isDemo: true,
    condition: 'Moderate',
    riskScore: 52,
    lossExposure: 28,
    confidence: 91,
    explanations: [
      'Kelembaban permukaan terdeteksi pada ~15% area yang terlihat',
      'Warna tidak merata — indikasi awal diskolorasi pada tangkai',
      'Ukuran batch seragam — faktor positif',
      DEMO_DISCLAIMER,
    ],
    recommendedPathway: 'Pendinginan + Monitor 24 jam',
    storageAdvice: 'Simpan di suhu 8–12°C dengan sirkulasi udara baik. Periksa kembali dalam 24 jam.',
    scenarioOptions: [
      {
        label: 'Jual Sekarang',
        icon: '🛒',
        estimatedValueRetained: 60,
        timeframe: 'Hari ini',
        pros: ['Nilai tunai segera', 'Tidak ada risiko penyimpanan'],
        cons: ['Harga di bawah optimal karena kondisi sub-optimal'],
        recommended: false,
      },
      {
        label: 'Simpan + Monitor',
        icon: '❄️',
        estimatedValueRetained: 75,
        timeframe: '1–2 hari',
        pros: ['Nilai lebih tinggi jika kondisi stabil', 'Waktu untuk mencari pembeli terbaik'],
        cons: ['Biaya penyimpanan', 'Risiko deteriorasi berlanjut'],
        recommended: true,
      },
      {
        label: 'Olah Menjadi Produk',
        icon: '🏭',
        estimatedValueRetained: 55,
        timeframe: '2–3 hari',
        pros: ['Eliminasi risiko pembusukan', 'Nilai produk olahan stabil'],
        cons: ['Perlu fasilitas pengolahan', 'Waktu lebih lama'],
        recommended: false,
      },
    ],
  }
}
