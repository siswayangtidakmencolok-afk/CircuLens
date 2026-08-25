import { useState, useEffect } from 'react'
import RiskBadge from '../components/RiskBadge'
import { historyBatches } from '../data/mockData'
import { loadBatches } from '../data/storage'
import type { SavedBatch } from '../data/storage'
import type { Batch } from '../data/mockData'

interface HistoryProps {
  onViewBatch: (id: string) => void
}

export default function History({ onViewBatch }: HistoryProps) {
  const [savedBatches, setSavedBatches] = useState<SavedBatch[]>([])
  const [search, setSearch] = useState('')
  const [filterRisk, setFilterRisk] = useState('')

  useEffect(() => {
    setSavedBatches(loadBatches())
  }, [])

  // Combine saved (from localStorage) + mock data — saved ones first
  const combined: Batch[] = [
    ...savedBatches.map(b => ({
      id:        b.id,
      date:      b.date,
      condition: b.condition,
      risk:      b.risk,
      pathway:   b.pathway,
    })),
    ...historyBatches,
  ]

  const filtered = combined.filter(b => {
    const matchSearch = !search || b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.condition.toLowerCase().includes(search.toLowerCase())
    const matchRisk = !filterRisk || b.risk === filterRisk
    return matchSearch && matchRisk
  })

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">
      <div className="mb-xl">
        <h2 className="text-headline-lg font-bold text-on-surface mb-xs">Riwayat Batch</h2>
        <p className="text-body-md text-secondary">Log seluruh batch yang telah dianalisis.</p>
      </div>

      {/* Demo banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-DEFAULT px-lg py-sm mb-lg flex items-center gap-sm">
        <span className="text-lg">⚗️</span>
        <p className="text-body-sm text-amber-800 font-medium">
          Prototype AI — Demo Mode. Batch yang disimpan tampil di atas.
          {savedBatches.length > 0 && (
            <span className="font-bold"> {savedBatches.length} batch tersimpan.</span>
          )}
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-md flex flex-wrap gap-md items-center mb-lg shadow-sm">
        <div className="flex items-center gap-sm flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-secondary">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari batch ID atau kondisi..."
            className="bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none flex-1"
          />
        </div>
        <select
          value={filterRisk}
          onChange={e => setFilterRisk(e.target.value)}
          className="text-body-sm border border-outline-variant rounded-lg px-md py-sm bg-surface text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="">Semua Risiko</option>
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
        <button className="text-label-md font-semibold border border-outline-variant px-md py-sm rounded-full text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary text-label-md uppercase tracking-wide border-b border-outline-variant">
                <th className="p-md">Batch ID</th>
                <th className="p-md">Tanggal</th>
                <th className="p-md">Kondisi</th>
                <th className="p-md">Risiko</th>
                <th className="p-md">Jalur Akhir</th>
                <th className="p-md text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-xl text-center text-secondary">
                    Tidak ada batch yang ditemukan.
                  </td>
                </tr>
              ) : filtered.map((b, idx) => (
                <tr
                  key={`${b.id}-${idx}`}
                  className={`hover:bg-surface-container-low transition-colors group ${
                    idx < savedBatches.length ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-md font-semibold font-mono flex items-center gap-xs">
                    {idx < savedBatches.length && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
                    )}
                    {b.id}
                  </td>
                  <td className="p-md text-secondary">{b.date}</td>
                  <td className="p-md">{b.condition}</td>
                  <td className="p-md"><RiskBadge risk={b.risk} /></td>
                  <td className="p-md">{b.pathway}</td>
                  <td className="p-md text-right">
                    <button
                      onClick={() => onViewBatch(b.id)}
                      className="p-xs text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="p-md border-t border-outline-variant flex items-center justify-between">
          <span className="text-body-sm text-secondary">
            Menampilkan {filtered.length} entri
            {savedBatches.length > 0 && (
              <span className="text-primary font-semibold"> · {savedBatches.length} dari localStorage</span>
            )}
          </span>
        </div>
      </div>
    </main>
  )
}
