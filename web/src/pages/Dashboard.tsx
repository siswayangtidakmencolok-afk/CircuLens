import RiskBadge from '../components/RiskBadge'
import { mockBatches, kpis, riskDistribution, pathwaySummary } from '../data/mockData'

interface DashboardProps {
  onNewBatch: () => void
  onViewBatch: (id: string) => void
}

const kpiCards = [
  {
    label: 'Total Batch',
    value: String(kpis.totalBatch),
    delta: kpis.totalDelta,
    deltaColor: 'text-primary',
    icon: 'inventory_2',
    bg: 'bg-surface-container-lowest',
  },
  {
    label: 'Risiko Tinggi',
    value: String(kpis.risikoTinggi),
    delta: 'Batch kritis',
    deltaColor: 'text-error',
    icon: 'warning',
    bg: 'bg-error-container border-error-container',
    textColor: 'text-on-error-container',
    iconColor: 'text-error',
  },
  {
    label: 'Perlu Tindakan',
    value: String(kpis.perluTindakan),
    delta: 'Segera proses',
    deltaColor: 'text-secondary',
    icon: 'priority_high',
    bg: 'bg-surface-container-lowest',
    iconColor: 'text-tertiary',
  },
  {
    label: 'Estimasi Loss',
    value: kpis.estimasiLoss,
    delta: kpis.lossDelta,
    deltaColor: 'text-primary',
    icon: 'trending_down',
    bg: 'bg-surface-container-lowest',
  },
]

export default function Dashboard({ onNewBatch, onViewBatch }: DashboardProps) {
  return (
    <main className="flex-1 p-md md:p-xl overflow-y-auto">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
        <div>
          <h2 className="text-headline-lg-mobile md:text-display-lg text-on-surface mb-xs font-bold">
            Selamat datang, Admin Desa 🌱
          </h2>
          <p className="text-body-lg text-secondary">
            Pantau kondisi cabai, risiko kehilangan, dan jalur keputusan terbaik.
          </p>
        </div>
        <button
          onClick={onNewBatch}
          className="bg-primary-container text-on-primary-container text-label-md font-semibold px-lg py-sm rounded-full flex items-center gap-sm hover:bg-primary hover:text-on-primary transition-colors shadow-sm active:scale-95 duration-150 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Analisis Batch Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg mb-xl">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} border border-outline-variant p-lg rounded-DEFAULT shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300`}
          >
            <div className="flex justify-between items-start mb-md">
              <span className={`text-label-md uppercase tracking-widest ${card.textColor ?? 'text-secondary'}`}>
                {card.label}
              </span>
              <span className={`material-symbols-outlined ${card.iconColor ?? 'text-secondary'} bg-surface-container-low p-sm rounded-full`}>
                {card.icon}
              </span>
            </div>
            <div className="flex items-baseline gap-sm">
              <span className={`text-headline-lg font-bold ${card.textColor ?? 'text-on-surface'}`}>
                {card.value}
              </span>
              <span className={`text-label-md font-semibold ${card.deltaColor}`}>{card.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">

        {/* Recent Batches Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-headline-sm font-semibold text-on-surface">Analisis Terbaru</h3>
            <button className="text-primary text-label-md font-semibold hover:underline flex items-center gap-xs">
              Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-secondary text-label-md uppercase tracking-wide border-b border-outline-variant">
                  <th className="p-md">Batch ID</th>
                  <th className="p-md">Tanggal</th>
                  <th className="p-md">Kondisi</th>
                  <th className="p-md">Risiko</th>
                  <th className="p-md">Jalur Rekomendasi</th>
                  <th className="p-md text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
                {mockBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="p-md font-semibold">{batch.id}</td>
                    <td className="p-md text-secondary">{batch.date}</td>
                    <td className="p-md">{batch.condition}</td>
                    <td className="p-md"><RiskBadge risk={batch.risk} /></td>
                    <td className="p-md">{batch.pathway}</td>
                    <td className="p-md text-right">
                      <button
                        onClick={() => onViewBatch(batch.id)}
                        className="p-xs text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Lihat ${batch.id}`}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg flex flex-col justify-between">
          <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Distribusi Risiko</h3>

          {/* CSS donut */}
          <div className="relative flex-1 flex items-center justify-center min-h-[200px] my-md">
            <div className="w-48 h-48 rounded-full border-[16px] border-surface-container-low relative flex items-center justify-center shadow-inner">
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-t-primary border-r-primary rotate-45 opacity-80" />
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-l-secondary-container -rotate-12" />
              <div className="absolute inset-[-16px] rounded-full border-[16px] border-transparent border-b-error-container rotate-12" />
              <div className="text-center">
                <span className="block text-headline-md font-bold text-on-surface">142</span>
                <span className="block text-label-md text-secondary uppercase">Total</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                <span className="text-secondary">Rendah (Pasar)</span>
              </div>
              <span className="font-semibold text-on-surface">{riskDistribution.Rendah}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-secondary-container inline-block" />
                <span className="text-secondary">Sedang (Olah)</span>
              </div>
              <span className="font-semibold text-on-surface">{riskDistribution.Sedang}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full bg-error-container inline-block" />
                <span className="text-secondary">Tinggi (Kritis)</span>
              </div>
              <span className="font-semibold text-on-surface">{riskDistribution.Tinggi}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">

        {/* Weekly Trend placeholder */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg">
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-headline-sm font-semibold text-on-surface">Tren Risiko Mingguan</h3>
            <span className="material-symbols-outlined text-secondary">more_horiz</span>
          </div>
          {/* Bar chart mock */}
          <div className="flex items-end gap-2 h-48 px-2">
            {[40, 65, 30, 80, 50, 60, 35].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === 3 ? 'bg-error/60' : i % 2 === 0 ? 'bg-primary/40' : 'bg-secondary-container'}`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-secondary">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Recommendations */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg">
          <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Rekomendasi Prioritas</h3>
          <div className="flex flex-col gap-sm">
            <div className="p-md rounded-lg bg-surface border border-outline-variant flex gap-md items-start group hover:border-primary transition-colors">
              <div className="p-sm bg-error-container text-error rounded-full shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-md font-semibold text-on-surface mb-xs group-hover:text-primary transition-colors">
                  Alihkan Batch #B-492 ke Pengolahan
                </h4>
                <p className="text-body-sm text-secondary line-clamp-2">
                  Kadar air mendekati batas kritis pembusukan. Segera alihkan ke pabrik pasta untuk meminimalisir loss 100%.
                </p>
              </div>
              <button className="text-primary p-xs shrink-0">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="p-md rounded-lg bg-surface border border-outline-variant flex gap-md items-start group hover:border-primary transition-colors">
              <div className="p-sm bg-secondary-container text-on-secondary-container rounded-full shrink-0">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-md font-semibold text-on-surface mb-xs group-hover:text-primary transition-colors">
                  Optimasi Rute Pengiriman #B-491
                </h4>
                <p className="text-body-sm text-secondary line-clamp-2">
                  Suhu rute utara diprediksi naik. Rute alternatif selatan disarankan untuk menjaga kesegaran pasar.
                </p>
              </div>
              <button className="text-primary p-xs shrink-0">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Circular Pathway Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT shadow-sm p-lg mb-xl">
        <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Ringkasan Jalur Sirkular</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md">
          {pathwaySummary.map((p) => (
            <div key={p.label} className="flex flex-col items-center gap-sm p-md bg-surface-container-low rounded-DEFAULT text-center hover:-translate-y-1 transition-transform duration-200">
              <span className="text-2xl">{p.icon}</span>
              <span className="text-body-sm font-semibold text-on-surface">{p.label}</span>
              <span className="text-label-md text-secondary">{p.count} batch</span>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
