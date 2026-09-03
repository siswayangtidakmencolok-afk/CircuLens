import type { BatchInput } from './aiDataset'

export function parseCSV(text: string): BatchInput[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headerLine = lines[0]
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase())

  const map: Record<string, string> = {
    batch_id: 'batch_id',
    'batch id': 'batch_id',
    'batchid': 'batch_id',
    commodity: 'commodity',
    'komoditas': 'commodity',
    moisture: 'moisture_pct',
    'moisture_pct': 'moisture_pct',
    'moisture %': 'moisture_pct',
    'kelembapan': 'moisture_pct',
    temperature: 'temperature_c',
    'temperature_c': 'temperature_c',
    'temperature (c)': 'temperature_c',
    'suhu': 'temperature_c',
    humidity: 'humidity_pct',
    'humidity_pct': 'humidity_pct',
    'humidity %': 'humidity_pct',
    weight: 'weight_kg',
    'weight_kg': 'weight_kg',
    'berat': 'weight_kg',
    age: 'age_days',
    'age_days': 'age_days',
    'umur': 'age_days',
    storage: 'storage_type',
    'storage_type': 'storage_type',
    'penyimpanan': 'storage_type',
    condition: 'visual_condition',
    'visual_condition': 'visual_condition',
    'kondisi': 'visual_condition',
    notes: 'notes',
    'catatan': 'notes',
  }

  return lines.slice(1).map((line, idx) => {
    const cells = line.split(',').map((c) => c.trim())
    const obj: Partial<BatchInput> = {}
    headers.forEach((h, i) => {
      const key = map[h]
      if (!key) return
      const value = cells[i] ?? ''
      if (
        key === 'moisture_pct' ||
        key === 'temperature_c' ||
        key === 'humidity_pct' ||
        key === 'weight_kg' ||
        key === 'age_days'
      ) {
        ;(obj as Record<string, unknown>)[key] = Number(value) || 0
      } else if (key === 'storage_type') {
        const v = value.toLowerCase().replace(/\s+/g, '_')
        if (['gudang', 'lapangan', 'cold_storage', 'transport'].includes(v)) {
          ;(obj as Record<string, unknown>)[key] = v
        }
      } else if (key === 'visual_condition') {
        const v = value.toLowerCase().replace(/\s+/g, '_')
        if (
          ['sehat', 'bercak', 'layu', 'busuk_sebagian', 'busuk_total'].includes(v)
        ) {
          ;(obj as Record<string, unknown>)[key] = v
        }
      } else {
        ;(obj as Record<string, unknown>)[key] = value
      }
    })
    return {
      moisture_pct: obj.moisture_pct ?? 0,
      temperature_c: obj.temperature_c ?? 0,
      humidity_pct: obj.humidity_pct ?? 0,
      weight_kg: obj.weight_kg ?? 0,
      age_days: obj.age_days ?? 0,
      storage_type: (obj.storage_type as BatchInput['storage_type']) ?? 'gudang',
      visual_condition: obj.visual_condition as BatchInput['visual_condition'],
      commodity: obj.commodity,
      batch_id: obj.batch_id,
      notes: obj.notes,
    } as BatchInput
  }).filter((b) => b.weight_kg > 0 || b.moisture_pct > 0) // skip empty rows
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    alert('Tidak ada data untuk di-export')
    return
  }
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val == null) return ''
          const s = String(val).replace(/"/g, '""')
          return /[,"\n]/.test(s) ? `"${s}"` : s
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}