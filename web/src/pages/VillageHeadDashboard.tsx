import { useAuth } from '../context/AuthContext'
import { historyBatches } from '../data/mockData'
import { loadBatches } from '../data/storage'
import RiskBadge from '../components/RiskBadge'

export default function VillageHeadDashboard() {
  const { profile } = useAuth()
  const savedBatches = loadBatches()
  const allBatches   = [...savedBatches, ...historyBatches]

  const high   = allBatches.filter(b => b.risk === 'Tinggi').length
  const medium = allBatches.filter(b => b.risk === 'Sedang').length
  const low    = allBatches.filter(b => b.risk === 'Rendah').length
  const total  = allBatches.length

  const displayName = profile?.full_name || 'Kepala Desa'

  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* Header */}
      <div className="mb-xl">
        <p className="cl-label text-secondary mb-xs">🏛️ Kepala Desa</p>
        <h1 className="cl-display text-on-surface">Selamat datang, {displayName}</h1>
        <p className="text-body-md text-secondary mt-xs">
          Ringkasan kondisi seluruh batch cabai di wilayah Anda.
        </p>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-sm bg-amber-50 border border-amber-200 rounded-2xl px-lg py-sm mb-lg">
        <span className="shrink-0">⚗️</span>
        <p className="text-body-sm text-amber-800 font-medium">
          Prototype AI — Demo Mode.{' '}
          <span className="font-normal">Data akses dikendalikan oleh RLS Supabase. Kepala Desa hanya melihat data sesuai policy.</span>
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <div className="cl-card">
          <p className="cl-label text-secondary mb-sm">Total Batch</p>
          <p className="cl-kpi-value text-on-surface">{total}</p>
          <p className="text-body-sm text-secondary mt-xs">semua batch</p>
        </div>
        <div className="cl-card bg-red-50 !border-red-100">
          <p className="cl-label text-red-500 mb-sm">Risiko Tinggi</p>
          <p className="cl-kpi-value text-red-700">{high}</p>
          <p className="text-body-sm text-red-500 mt-xs">perlu tindakan</p>
        </div>
        <div className="cl-card bg-amber-50 !border-amber-100">
          <p className="cl-label text-amber-600 mb-sm">Risiko Sedang</p>
          <p className="cl-kpi-value text-amber-700">{medium}</p>
          <p className="text-body-sm text-amber-500 mt-xs">monitor rutin</p>
        </div>
        <div className="cl-card bg-green-50 !border-green-100">
          <p className="cl-label text-green-600 mb-sm">Risiko Rendah</p>
          <p className="cl-kpi-value text-green-700">{low}</p>
          <p className="text-body-sm text-green-500 mt-xs">kondisi baik</p>
        </div>
      </div>

      {/* Risk distribution bar */}
      <div className="cl-card mb-xl">
        <p className="cl-label text-secondary mb-sm">Distribusi Risiko Wilayah</p>
        {total > 0 && (
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-md">
            {low    > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(low    / total) * 100}%` }} title={`Rendah: ${low}`}   />}
            {medium > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(medium / total) * 100}%` }} title={`Sedang: ${medium}`} />}
            {high   > 0 && <div className="bg-red-400   transition-all" style={{ width: `${(high   / total) * 100}%` }} title={`Tinggi: ${high}`}   />}
          </div>
        )}
        <div className="flex gap-lg text-body-sm flex-wrap">
          <span className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />Rendah: {low}</span>
          <span className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />Sedang: {medium}</span>
          <span className="flex items-center gap-xs"><span className="w-3 h-3 rounded-full bg-red-400   inline-block" />Tinggi: {high}</span>
        </div>
      </div>

      {/* All batches table */}
      <div className="cl-card">
        <p className="cl-label text-secondary mb-sm">Seluruh Batch</p>
        <h3 className="cl-title text-on-surface mb-md">Log Batch Wilayah</h3>

        {allBatches.length === 0 ? (
          <p className="text-body-sm text-secondary py-xl text-center">Belum ada batch yang tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant cl-label uppercase tracking-wide border-b border-outline-variant">
                  <th className="pb-sm pr-lg">Batch ID</th>
                  <th className="pb-sm pr-lg">Tanggal</th>
                  <th className="pb-sm pr-lg">Kondisi</th>
                  <th className="pb-sm pr-lg">Risiko</th>
                  <th className="pb-sm">Jalur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {allBatches.map((b, i) => (
                  <tr key={`${b.id}-${i}`} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-sm pr-lg font-mono font-semibold text-on-surface">{b.id}</td>
                    <td className="py-sm pr-lg text-secondary">{b.date}</td>
                    <td className="py-sm pr-lg text-on-surface">{b.condition}</td>
                    <td className="py-sm pr-lg"><RiskBadge risk={b.risk} /></td>
                    <td className="py-sm text-secondary">{b.pathway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
