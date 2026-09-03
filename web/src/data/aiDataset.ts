// Dataset deterministik untuk rule-based AI detection
// Input: parameter dari form atau upload CSV
// Output: kondisi, risk_level, jalur_akhir, confidence, recommendation

export interface BatchInput {
  batch_id?: string
  commodity?: string // cabai_merah, cabai_rawit, dll
  moisture_pct: number // 0-100
  temperature_c: number // suhu dalam celcius
  humidity_pct: number // 0-100
  weight_kg: number
  age_days: number // umur batch sejak ditanam
  storage_type: 'gudang' | 'lapangan' | 'cold_storage' | 'transport'
  visual_condition?: 'sehat' | 'bercak' | 'layu' | 'busuk_sebagian' | 'busuk_total'
  notes?: string
}

export interface AIAnalysisResult {
  batch_id: string
  kondisi: string // "High moisture", "Normal", "Low risk", dll
  risk_level: 'rendah' | 'sedang' | 'tinggi' | 'kritis'
  risk_score: number // 0-100
  jalur_akhir: string // "Olah Pasta", "Pasar Segar", "Cold Storage", "Kompos", "Buang"
  confidence: number // 0-100, keyakinan AI
  recommendations: string[]
  detected_issues: string[]
  analyzed_at: string // ISO timestamp
}

// Rules database - ini yang "ditanam" sebagai dataset
const RULES = {
  // Moisture thresholds
  MOISTURE_CRITICAL: 85,
  MOISTURE_HIGH: 70,
  MOISTURE_NORMAL_MAX: 65,
  MOISTURE_LOW: 30,

  // Temperature thresholds (cabai optimum 20-28°C)
  TEMP_OPTIMAL_H: 28,
  TEMP_OPTIMAL_L: 18,
  TEMP_WARNING_H: 32,
  TEMP_WARNING_L: 15,

  // Humidity thresholds
  HUMIDITY_HIGH: 80,
  HUMIDITY_LOW: 40,

  // Age (days since harvest, post-harvest)
  AGE_FRESH: 2,
  AGE_OK: 5,
  AGE_RISK: 8,
  AGE_DECAY: 14,
}

function generateBatchId(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `CHL-${yy}-${mm}-${dd}-${seq}`
}

function detectIssues(input: BatchInput): { issues: string[]; riskBoost: number } {
  const issues: string[] = []
  let riskBoost = 0

  if (input.moisture_pct > RULES.MOISTURE_CRITICAL) {
    issues.push(`Kelembapan sangat tinggi (${input.moisture_pct}%) — risiko busuk cepat`)
    riskBoost += 35
  } else if (input.moisture_pct > RULES.MOISTURE_HIGH) {
    issues.push(`Kelembapan tinggi (${input.moisture_pct}%)`)
    riskBoost += 20
  } else if (input.moisture_pct < RULES.MOISTURE_LOW) {
    issues.push(`Kelembapan terlalu rendah (${input.moisture_pct}%) — cabai kering`)
    riskBoost += 15
  }

  if (input.temperature_c > RULES.TEMP_WARNING_H) {
    issues.push(`Suhu terlalu tinggi (${input.temperature_c}°C) —加速 pembusukan`)
    riskBoost += 25
  } else if (input.temperature_c < RULES.TEMP_WARNING_L) {
    issues.push(`Suhu terlalu rendah (${input.temperature_c}°C) — cabai bisa rusak`)
    riskBoost += 20
  } else if (
    input.temperature_c > RULES.TEMP_OPTIMAL_H ||
    input.temperature_c < RULES.TEMP_OPTIMAL_L
  ) {
    issues.push(`Suhu di luar range optimal (${input.temperature_c}°C)`)
    riskBoost += 10
  }

  if (input.humidity_pct > RULES.HUMIDITY_HIGH) {
    issues.push(`Kelembapan udara tinggi (${input.humidity_pct}%)`)
    riskBoost += 10
  } else if (input.humidity_pct < RULES.HUMIDITY_LOW) {
    issues.push(`Kelembapan udara rendah (${input.humidity_pct}%)`)
    riskBoost += 8
  }

  if (input.age_days > RULES.AGE_DECAY) {
    issues.push(`Batch sudah tua (${input.age_days} hari sejak panen)`)
    riskBoost += 30
  } else if (input.age_days > RULES.AGE_RISK) {
    issues.push(`Batch mendekati batas layak (${input.age_days} hari)`)
    riskBoost += 15
  }

  // Visual condition
  if (input.visual_condition === 'busuk_total') {
    issues.push('Visual: terdeteksi pembusukan total')
    riskBoost += 50
  } else if (input.visual_condition === 'busuk_sebagian') {
    issues.push('Visual: pembusukan sebagian terdeteksi')
    riskBoost += 25
  } else if (input.visual_condition === 'bercak') {
    issues.push('Visual: bercak pada daun/buah')
    riskBoost += 15
  } else if (input.visual_condition === 'layu') {
    issues.push('Visual: daun/buah layu')
    riskBoost += 10
  }

  // Storage type penalty
  if (input.storage_type === 'lapangan' && input.age_days > 3) {
    issues.push('Penyimpanan lapangan lebih dari 3 hari')
    riskBoost += 15
  }

  return { issues, riskBoost }
}

function classifyRisk(riskScore: number): AIAnalysisResult['risk_level'] {
  if (riskScore >= 75) return 'kritis'
  if (riskScore >= 50) return 'tinggi'
  if (riskScore >= 25) return 'sedang'
  return 'rendah'
}

function determinePath(
  input: BatchInput,
  riskLevel: AIAnalysisResult['risk_level']
): string {
  // Critical → compost or dispose
  if (riskLevel === 'kritis') {
    if (input.visual_condition === 'busuk_total') return 'Buang'
    return 'Kompos / Olah'
  }

  // High risk → process immediately
  if (riskLevel === 'tinggi') {
    if (input.storage_type === 'cold_storage') return 'Cold Storage (Segera)'
    if (input.visual_condition === 'bercak') return 'Olah Pasta (Sortir)'
    return 'Pasar Lokal (Cepat)'
  }

  // Medium → fresh market with priority
  if (riskLevel === 'sedang') {
    if (input.age_days <= 2) return 'Pasar Segar'
    return 'Olah Pasta'
  }

  // Low → optimal path based on freshness
  if (input.age_days <= RULES.AGE_FRESH) return 'Pasar Segar (Premium)'
  if (input.age_days <= RULES.AGE_OK) return 'Pasar Segar'
  if (input.age_days <= RULES.AGE_RISK) return 'Olah Pasta'
  return 'Cold Storage'
}

function buildRecommendations(
  input: BatchInput,
  riskLevel: AIAnalysisResult['risk_level'],
  issues: string[]
): string[] {
  const recs: string[] = []

  if (riskLevel === 'kritis') {
    recs.push('⚠️ SEGERA pisahkan batch ini dari batch lain untuk mencegah kontaminasi')
    recs.push('🚛 Koordinasikan pembuangan atau pengomposan dalam 24 jam')
    if (input.storage_type !== 'cold_storage') {
      recs.push('❄️ Pindahkan ke cold storage jika masih memungkinkan')
    }
  } else if (riskLevel === 'tinggi') {
    recs.push('⚡ Jual dalam 1-2 hari ke depan di pasar terdekat')
    if (input.moisture_pct > RULES.MOISTURE_HIGH) {
      recs.push('💨 Tambah ventilasi atau kurangi kelembapan sebelum distribusi')
    }
    if (input.visual_condition === 'bercak') {
      recs.push('🔍 Sortir manual: pisahkan yang bercak dari yang sehat')
    }
  } else if (riskLevel === 'sedang') {
    recs.push('📦 Kemasan dengan ventilasi baik untuk distribusi')
    recs.push('🌡️ Monitor suhu dan kelembapan setiap 6 jam')
  } else {
    recs.push('✅ Batch dalam kondisi optimal')
    recs.push('📈 Bisa dijual dengan harga premium di pasar modern')
  }

  // Specific recommendations based on issues
  if (issues.some((i) => i.includes('Suhu terlalu tinggi'))) {
    recs.push('🌡️ Turunkan suhu penyimpanan ke 20-25°C')
  }
  if (issues.some((i) => i.includes('Kelembapan udara tinggi'))) {
    recs.push('💨 Aktifkan exhaust fan atau buka ventilasi')
  }

  return recs
}

function calculateConfidence(input: BatchInput): number {
  // Confidence berdasarkan kelengkapan data
  let confidence = 60 // base
  if (input.visual_condition) confidence += 10
  if (input.notes && input.notes.length > 10) confidence += 5
  if (input.weight_kg > 0) confidence += 5
  if (input.commodity) confidence += 5
  if (input.age_days >= 0) confidence += 5
  return Math.min(confidence, 95)
}

export function analyzeBatch(input: BatchInput): AIAnalysisResult {
  const { issues, riskBoost } = detectIssues(input)
  const riskScore = Math.min(riskBoost, 100)
  const riskLevel = classifyRisk(riskScore)
  const jalurAkhir = determinePath(input, riskLevel)
  const recommendations = buildRecommendations(input, riskLevel, issues)
  const confidence = calculateConfidence(input)

  let kondisi = 'Normal'
  if (riskLevel === 'kritis') kondisi = 'Sangat buruk - perlu tindakan segera'
  else if (riskLevel === 'tinggi') kondisi = 'High moisture / High risk'
  else if (riskLevel === 'sedang') kondisi = 'Perhatian sedang'
  else kondisi = input.age_days <= 2 ? 'Sangat segar' : 'Kondisi baik'

  return {
    batch_id: input.batch_id ?? generateBatchId(),
    kondisi,
    risk_level: riskLevel,
    risk_score: riskScore,
    jalur_akhir: jalurAkhir,
    confidence,
    recommendations,
    detected_issues: issues,
    analyzed_at: new Date().toISOString(),
  }
}

// Analyze multiple batches (untuk upload CSV)
export function analyzeMultiple(inputs: BatchInput[]): AIAnalysisResult[] {
  return inputs.map((input) => analyzeBatch(input))
}

// Quick presets untuk demo / quick-test
export const PRESETS: Record<string, BatchInput> = {
  segar_premium: {
    moisture_pct: 55,
    temperature_c: 22,
    humidity_pct: 60,
    weight_kg: 50,
    age_days: 1,
    storage_type: 'cold_storage',
    visual_condition: 'sehat',
  },
  normal: {
    moisture_pct: 65,
    temperature_c: 24,
    humidity_pct: 70,
    weight_kg: 80,
    age_days: 3,
    storage_type: 'gudang',
    visual_condition: 'sehat',
  },
  high_moisture: {
    moisture_pct: 78,
    temperature_c: 29,
    humidity_pct: 85,
    weight_kg: 100,
    age_days: 5,
    storage_type: 'lapangan',
    visual_condition: 'bercak',
  },
  kritis: {
    moisture_pct: 92,
    temperature_c: 33,
    humidity_pct: 90,
    weight_kg: 60,
    age_days: 10,
    storage_type: 'lapangan',
    visual_condition: 'busuk_sebagian',
  },
}