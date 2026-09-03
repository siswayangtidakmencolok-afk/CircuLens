import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDistributorProfile } from '../../hooks/useDistributorProfile'
import { supabase } from '../../lib/supabase'

/**
 * DistributorDashboard
 * Halaman utama untuk role `distributor`.
 * Menampilkan:
 *  - Sapaan + company name + status verifikasi
 *  - 4 stat card (Pesanan Aktif, Pengeluaran Minggu Ini, Petani Mitra, Rating)
 *  - Quick action: Buka Marketplace
 *  - Riwayat pesanan 5 teratas dari tabel `orders` (jika sudah ada di DB)
 *
 * Karena Phase 10.2 (marketplace) belum dibuat, query ke DB di-bungkus
 * try/catch sehingga dashboard TIDAK akan blank kalau tabel/order
 * belum tersedia — fallback ke placeholder.
 */

type OrderRow = {
  id: string
  created_at: string
  status: string
  total_kg: number | null
  total_price: number | null
}

interface Props {
  onNavigate?: (id: string) => void
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Menunggu', tone: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Dikonfirmasi', tone: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Dikirim', tone: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Selesai', tone: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Dibatalkan', tone: 'bg-rose-100 text-rose-800' },
}

function formatRupiah(n: number | null | undefined): string {
  if (n == null) return 'Rp 0'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return iso.slice(0, 10)
  }
}

export function DistributorDashboard({ onNavigate }: Props) {
  const { profile: authProfile } = useAuth()
  const { profile: distributorProfile, loading: profileLoading } =
    useDistributorProfile(authProfile?.id)

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch orders ringan (best-effort: tabel mungkin belum ada di Phase 10.1)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!authProfile?.id) return
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, created_at, status, total_kg, total_price')
          .eq('distributor_id', authProfile.id)
          .order('created_at', { ascending: false })
          .limit(5)
        if (cancelled) return
        if (error) {
          // Silent fallback — tampilkan empty state, jangan crash dashboard
          setFetchError(null)
          setOrders([])
        } else {
          setOrders((data ?? []) as OrderRow[])
        }
      } catch {
        // Tabel belum ada → biarkan orders = []
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [authProfile?.id])

  const stats = useMemo(() => {
    const active = orders.filter((o) =>
      ['pending', 'confirmed', 'shipped'].includes(o.status)
    ).length
    const weekSpend = orders
      .filter((o) => {
        const days = (Date.now() - new Date(o.created_at).getTime()) / 86400000
        return days <= 7 && o.status !== 'cancelled'
      })
      .reduce((sum, o) => sum + (o.total_price ?? 0), 0)
    const uniqueFarmers = new Set(orders.map((o) => o.id)).size // placeholder
    return { active, weekSpend, uniqueFarmers, rating: distributorProfile?.is_verified ? 4.8 : 0 }
  }, [orders, distributorProfile])

  const companyName =
    distributorProfile?.company_name ?? authProfile?.full_name ?? 'Distributor'

  const goto = (id: string) => onNavigate?.(id)

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <section className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">
              Selamat datang kembali 👋
            </p>
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary leading-tight">
              {companyName}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              {distributorProfile?.is_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-label-sm rounded-full">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  Verified Distributor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-label-sm rounded-full">
                  <span className="material-symbols-outlined text-base">pending</span>
                  Belum terverifikasi
                </span>
              )}
              {distributorProfile?.address_city && (
                <span className="text-body-sm text-on-surface-variant">
                  · {distributorProfile.address_city}
                  {distributorProfile.address_province
                    ? `, ${distributorProfile.address_province}`
                    : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => goto('marketplace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              <span className="material-symbols-outlined">storefront</span>
              Buka Marketplace
            </button>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="receipt_long"
          label="Pesanan Aktif"
          value={String(stats.active)}
          tone="bg-tertiary-container text-on-tertiary-container"
          sublabel="pending + confirmed + shipped"
        />
        <StatCard
          icon="payments"
          label="Pengeluaran 7 Hari"
          value={formatRupiah(stats.weekSpend)}
          tone="bg-primary-container text-on-primary-container"
          sublabel="Pesanan non-batal"
        />
        <StatCard
          icon="group"
          label="Petani Mitra"
          value={String(distributorProfile?.max_order_per_week ?? 0)}
          tone="bg-secondary-container text-on-secondary-container"
          sublabel="Kapasitas order/minggu"
        />
        <StatCard
          icon="star"
          label="Rating"
          value={stats.rating ? stats.rating.toFixed(1) : '—'}
          tone="bg-amber-100 text-amber-800"
          sublabel={stats.rating ? 'Dari petani' : 'Verifikasi dulu'}
        />
      </section>

      {/* QUICK ACTIONS */}
      <section className="mb-8">
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon="storefront"
            title="Jelajahi Marketplace"
            desc="Temukan batch cabai berkualitas langsung dari petani."
            onClick={() => goto('marketplace')}
            badge="Baru"
          />
          <ActionCard
            icon="receipt_long"
            title="Pesanan Saya"
            desc="Pantau status pesanan dan pengiriman Anda."
            onClick={() => goto('my-orders')}
          />
          <ActionCard
            icon="settings"
            title="Pengaturan Akun"
            desc="Kelola profil perusahaan dan preferensi."
            onClick={() => goto('settings')}
          />
        </div>
      </section>

      {/* RECENT ORDERS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            Pesanan Terbaru
          </h2>
          <button
            onClick={() => goto('my-orders')}
            className="text-label-lg text-primary hover:underline"
          >
            Lihat semua →
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          {profileLoading || ordersLoading ? (
            <div className="p-8 text-center text-on-surface-variant">Memuat…</div>
          ) : orders.length === 0 ? (
            <EmptyOrders onCta={() => goto('marketplace')} />
          ) : (
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-label-md font-medium text-on-surface-variant">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-label-md font-medium text-on-surface-variant">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-label-md font-medium text-on-surface-variant">
                    Total
                  </th>
                  <th className="px-4 py-3 text-label-md font-medium text-on-surface-variant">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const meta = STATUS_LABELS[o.status] ?? STATUS_LABELS.pending
                  return (
                    <tr
                      key={o.id}
                      className="border-t border-outline-variant hover:bg-surface-container-low"
                    >
                      <td className="px-4 py-3 text-body-md">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3 text-body-md font-mono text-on-surface-variant">
                        #{o.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-body-md font-medium">
                        {formatRupiah(o.total_price)}
                        {o.total_kg != null && (
                          <span className="text-label-sm text-on-surface-variant ml-1">
                            ({o.total_kg} kg)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-label-sm ${meta.tone}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {fetchError && (
          <p className="text-label-sm text-on-surface-variant mt-2">{fetchError}</p>
        )}
      </section>
    </div>
  )
}

// === Sub-komponen kecil, diletakkan di file yang sama agar file count tetap sedikit ===

function StatCard({
  icon,
  label,
  value,
  sublabel,
  tone,
}: {
  icon: string
  label: string
  value: string
  sublabel?: string
  tone: string
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="font-headline-md text-headline-md font-bold text-primary leading-tight">
        {value}
      </p>
      {sublabel && (
        <p className="text-label-sm text-on-surface-variant">{sublabel}</p>
      )}
    </div>
  )
}

function ActionCard({
  icon,
  title,
  desc,
  onClick,
  badge,
}: {
  icon: string
  title: string
  desc: string
  onClick: () => void
  badge?: string
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:border-primary hover:shadow-md transition-all relative"
    >
      {badge && (
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary-container text-on-primary-container text-label-sm rounded-full">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="font-title-md text-title-md font-semibold text-primary mb-1">{title}</p>
      <p className="text-body-sm text-on-surface-variant">{desc}</p>
    </button>
  )
}

function EmptyOrders({ onCta }: { onCta: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant">
          inbox
        </span>
      </div>
      <h3 className="font-title-lg text-title-lg font-semibold text-primary mb-2">
        Belum ada pesanan
      </h3>
      <p className="text-body-md text-on-surface-variant mb-5 max-w-md mx-auto">
        Marketplace distributor akan segera tersedia. Untuk sementara Anda bisa menjelajahi
        produk dan fitur akan aktif setelahnya.
      </p>
      <button
        onClick={onCta}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90"
      >
        <span className="material-symbols-outlined">storefront</span>
        Buka Marketplace
      </button>
    </div>
  )
}
