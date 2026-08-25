import RiskBadge from '../components/RiskBadge'
import { historyBatches } from '../data/mockData'

export default function History() {
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
          Prototype AI — Demo Mode. Data di bawah adalah mock data untuk demonstrasi.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-md flex flex-wrap gap-md items-center mb-lg shadow-sm">
        <div className="flex items-center gap-sm flex-1 min-w-[200px]">
          <span className="material-symbols-outlined text-secondary">search</span>
          <input
            type="text"
            placeholder="Cari batch ID..."
            className="bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none flex-1"
          />
        </div>
        <select className="text-body-sm border border-outline-variant rounded-lg px-md py-sm bg-surface text-on-surface focus:outline-none focus:border-primary">
          <option>Semua Risiko</option>
          <option>Rendah</option>
          <option>Sedang</option>
          <option>Tinggi</option>
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
              {historyBatches.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-md font-semibold font-mono">{b.id}</td>
                  <td className="p-md text-secondary">{b.date}</td>
                  <td className="p-md">{b.condition}</td>
                  <td className="p-md"><RiskBadge risk={b.risk} /></td>
                  <td className="p-md">{b.pathway}</td>
                  <td className="p-md text-right">
                    <button className="p-xs text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-md border-t border-outline-variant flex items-center justify-between">
          <span className="text-body-sm text-secondary">Menampilkan 6 dari 124 entri</span>
          <div className="flex items-center gap-sm">
            <button disabled className="p-sm rounded-DEFAULT border border-outline-variant text-secondary opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-sm rounded-DEFAULT border border-outline-variant text-secondary hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
