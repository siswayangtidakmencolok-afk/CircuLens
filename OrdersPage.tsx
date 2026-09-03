import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../hooks/useOrders'

/**
 * OrdersPage — Halaman distributor: pesanan saya.
 */
interface Props {
  onNavigate?: (id: string) => void
}

const STATUS_META: Record<string, { label: string; tone: string; icon: string }> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    tone: 'bg-amber-100 text-amber-800',
    icon: 'hourglass_top',
  },
  confirmed: { label: 'Dikonfirmasi', tone: 'bg-blue-100 text-blue-800', icon: 'check' },
  shipped: { label: 'Dikirim', tone: 'bg-indigo-100 text-indigo-800', icon: 'local_shipping' },
  completed: { label: 'Selesai', tone: 'bg-emerald-100 text-emerald-800', icon: 'task_alt' },
  cancelled: { label: 'Dibatalkan', tone: 'bg-rose-100 text-rose-800', icon: 'cancel' },
}

function formatRupiah(n: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function OrdersPage(_props: Props) {
  const { profile: authProfile } = useAuth()
  const { orders, loading, error } = useOrders(authProfile?.id)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
          Pesanan Saya
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Lacak pesanan Anda. Status akan otomatis terupdate saat pengepul menyelesaikan pickup.
        </p>
      </header>

      {error && (
        <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-on-surface-variant">Memuat pesanan…</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              receipt_long
            </span>
          </div>
          <p className="text-body-lg text-on-surface-variant mb-4">
            Belum ada pesanan.
          </p>
          <button
            onClick={() => _props.onNavigate?.('marketplace')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90"
          >
            <span className="material-symbols-outlined">storefront</span>
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.pending
            return (
              <div
                key={o.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">
                      Order ID
                    </p>
                    <p className="font-mono text-body-md font-medium text-primary">
                      #{o.id.slice(0, 8)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md ${meta.tone}`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {meta.icon}
                    </span>
                    {meta.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-body-md">
                  <div>
                    <p className="text-on-surface-variant text-label-sm">Tanggal</p>
                    <p className="font-medium text-primary">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-label-sm">Item</p>
                    <p className="font-medium text-primary">
                      {o.item_count} batch
                    </p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-label-sm">Total berat</p>
                    <p className="font-medium text-primary">
                      {o.total_kg.toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-label-sm">Total</p>
                    <p className="font-bold text-primary">
                      {formatRupiah(o.total_price)}
                    </p>
                  </div>
                </div>

                {o.notes && (
                  <p className="text-body-sm text-on-surface-variant bg-surface-container-low rounded-lg p-3 mt-3">
                    <span className="material-symbols-outlined text-base align-middle mr-1">
                      info
                    </span>
                    {o.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
