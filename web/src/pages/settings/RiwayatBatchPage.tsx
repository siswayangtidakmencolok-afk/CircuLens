import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { downloadCSV } from '../../data/csvUtils'
import { formatDateID } from '../../utils/format'

interface BatchRecord {
  id: string
  batch_code: string
  tanggal: string
  kondisi: string
  risk_level: 'rendah' | 'sedang' | 'tinggi' | 'kritis'
  jalur_akhir: string
  commodity?: string
  farmer_name?: string
  created_at: string
}

const RISK_STYLES: Record<BatchRecord['risk_level'], string> = {
  rendah: 'bg-secondary-container/30 text-primary-container border border-leaf-accent/50',
  sedang: 'bg-yellow-100 text-yellow-900 border border-yellow-300',
  tinggi: 'bg-orange-100 text-orange-900 border border-orange-300',
  kritis: 'bg-error-container text-on-error-container border border-error/30',
}

type RiskFilter = 'all' | BatchRecord['risk_level']

export function RiwayatBatchPage() {
  const [records, setRecords] = useState<BatchRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    setLoading(true)
    setError(null)
    try {
      // Ambil dari tabel analyses (kalau ada) + batches
      const { data, error: err } = await supabase
        .from('analyses')
        .select('*, batches(batch_code, commodity), profiles:farmer_id(full_name)')
        .order('created_at', { ascending: false })

      if (err) throw err

      const mapped: BatchRecord[] = (data ?? []).map((row: Record<string, unknown>) => {
        const batches = row.batches as { batch_code?: string; commodity?: string } | null
        const profiles = row.profiles as { full_name?: string } | null
        return {
          id: row.id as string,
          batch_code: batches?.batch_code ?? (row.batch_id as string) ?? 'N/A',
          tanggal:
            (row.created_at as string) ?? new Date().toISOString(),
          kondisi: (row.kondisi as string) ?? (row.notes as string) ?? '-',
          risk_level: ((row.risk_level as BatchRecord['risk_level']) ?? 'rendah'),
          jalur_akhir: (row.jalur_akhir as string) ?? (row.pathway as string) ?? '-',
          commodity: batches?.commodity ?? (row.commodity as string | undefined),
          farmer_name: profiles?.full_name,
          created_at: row.created_at as string,
        }
      })

      setRecords(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const now = Date.now()
    const ranges: Record<typeof dateRange, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      all: Number.POSITIVE_INFINITY,
    }
    const cutoff = now - ranges[dateRange]

    return records.filter((r) => {
      if (riskFilter !== 'all' && r.risk_level !== riskFilter) return false
      if (term && !`${r.batch_code} ${r.kondisi} ${r.jalur_akhir}`.toLowerCase().includes(term))
        return false
      if (dateRange !== 'all' && new Date(r.created_at).getTime() < cutoff)
        return false
      return true
    })
  }, [records, search, riskFilter, dateRange])

  function handleExport() {
    const rows = filtered.map((r) => ({
      batch_id: r.batch_code,
      tanggal: formatDateID(r.tanggal),
      kondisi: r.kondisi,
      risk_level: r.risk_level,
      jalur_akhir: r.jalur_akhir,
      commodity: r.commodity ?? '',
      petani: r.farmer_name ?? '',
    }))
    downloadCSV(`riwayat-batch-${new Date().toISOString().slice(0, 10)}`, rows)
  }

  // Summary stats
  const stats = useMemo(() => {
    const total = filtered.length
    const kritis = filtered.filter((r) => r.risk_level === 'kritis').length
    const tinggi = filtered.filter((r) => r.risk_level === 'tinggi').length
    const aman = filtered.filter((r) => r.risk_level === 'rendah').length
    return { total, kritis, tinggi, aman }
  }, [filtered])

  return (
    <div className="p-md md:p-lg max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-xs">
          Riwayat Batch
        </h2>
        <p className="text-on-surface-variant text-body-lg">
          Log seluruh batch yang telah dianalisis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
        <StatCard label="Total Batch" value={stats.total} icon="inventory_2" color="primary" />
        <StatCard label="Kritis" value={stats.kritis} icon="error" color="error" />
        <StatCard label="Tinggi" value={stats.tinggi} icon="warning" color="warning" />
        <StatCard label="Aman" value={stats.aman} icon="check_circle" color="success" />
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md mb-md">
        <div className="flex flex-wrap gap-md items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Cari batch ID atau kondisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-md py-sm rounded-full border border-outline-variant bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
            className="px-md py-sm rounded-full border border-outline-variant bg-surface-container-low text-on-surface font-label-md"
          >
            <option value="all">Semua Risiko</option>
            <option value="kritis">Kritis</option>
            <option value="tinggi">Tinggi</option>
            <option value="sedang">Sedang</option>
            <option value="rendah">Rendah</option>
          </select>

          {/* Date range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-md py-sm rounded-full border border-outline-variant bg-surface-container-low text-on-surface font-label-md"
          >
            <option value="all">Semua Waktu</option>
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="px-md py-sm rounded-full bg-primary-container text-on-primary font-label-md hover:bg-primary transition-colors active:scale-95 inline-flex items-center gap-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-lg px-md py-sm mb-md font-label-md">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-xl text-center text-on-surface-variant">
            Memuat data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-xl text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant block mb-sm">
              inbox
            </span>
            <p className="font-body-md text-on-surface-variant">
              {records.length === 0
                ? 'Belum ada batch yang dianalisis.'
                : 'Tidak ada hasil yang cocok dengan filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Kondisi
                  </th>
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Risiko
                  </th>
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Jalur Akhir
                  </th>
                  <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-surface-container/50 transition-colors"
                  >
                    <td className="px-md py-md font-label-md text-primary">
                      {r.batch_code}
                    </td>
                    <td className="px-md py-md text-on-surface-variant">
                      {formatDateID(r.tanggal)}
                    </td>
                    <td className="px-md py-md text-on-surface">
                      {r.kondisi}
                    </td>
                    <td className="px-md py-md">
                      <span
                        className={`inline-block px-sm py-base rounded-full font-label-sm text-label-sm ${
                          RISK_STYLES[r.risk_level]
                        }`}
                      >
                        {r.risk_level.charAt(0).toUpperCase() + r.risk_level.slice(1)}
                      </span>
                    </td>
                    <td className="px-md py-md text-on-surface-variant">
                      {r.jalur_akhir}
                    </td>
                    <td className="px-md py-md">
                      <button
                        className="text-secondary hover:text-primary transition-colors"
                        aria-label="Detail"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: 'primary' | 'error' | 'warning' | 'success'
}) {
  const colorClass = {
    primary: 'bg-primary-container/30 text-primary',
    error: 'bg-error-container text-on-error-container',
    warning: 'bg-orange-100 text-orange-900',
    success: 'bg-secondary-container/30 text-primary-container',
  }[color]

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md">
      <div className="flex items-center gap-md mb-sm">
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="font-display-lg text-display-lg text-primary">{value}</p>
    </div>
  )
}