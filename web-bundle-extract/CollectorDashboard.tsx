import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCollectorProfile, getVehicleLabel } from '../../hooks/useCollectorProfile'
import { supabase } from '../../lib/supabase'

/**
 * CollectorDashboard
 * Halaman utama untuk role `pengepul`.
 *
 * Menampilkan:
 *  - Sapaan + identitas pengepul + jenis kendaraan
 *  - 4 stat card (Pickup Hari Ini, Pickup Minggu Ini, Total Pickup, Rating)
 *  - Quick action: Mulai Rute / Lihat Riwayat
 *  - Daftar pickup terbaru (best-effort dari tabel `pickups` jika sudah ada)
 */

type PickupRow = {
  id: string
  scheduled_at: string
  farmer_name: string | null
  address: string | null
  estimated_kg: number | null
  status: string
}

interface Props {
  onNavigate?: (id: string) => void
}

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  scheduled: { label: 'Terjadwal', tone: 'bg-blue-100 text-blue-800' },
  en_route: { label: 'Dalam Perjalanan', tone: 'bg-indigo-100 text-indigo-800' },
  picked_up: { label: 'Sudah Diambil', tone: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Dibatalkan', tone: 'bg-rose-100 text-rose-800' },
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso.slice(0, 16).replace('T', ' ')
  }
}

export function CollectorDashboard({ onNavigate }: Props) {
  const { profile: authProfile } = useAuth()
  const { profile: collectorProfile, loading: profileLoading } =
    useCollectorProfile(authProfile?.id)

  const [pickups, setPickups] = useState<PickupRow[]>([])
  const [pickupsLoading, setPickupsLoading] = useState(true)

  // Fetch pickup best-effort (tabel mungkin belum dibuat di Phase 10.1)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!authProfile?.id) return
      try {
        const { data, error } = await supabase
          .from('pickups')
          .select('id, scheduled_at, farmer_name, address, estimated_kg, status')
          .eq('collector_id', authProfile.id)
          .order('scheduled_at', { ascending: true })
          .limit(5)
        if (cancelled) return
        if (!error) setPickups((data ?? []) as PickupRow[])
      } catch {
        // Silent fallback
      } finally {
        if (!cancelled) setPickupsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [authProfile?.id])

  const stats = useMemo(() => {
    const now = Date.now()
    const isSameDay = (iso: string) => {
      const d = new Date(iso)
      const today = new Date()
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      )
    }
    const today = pickups.filter(
      (p) => isSameDay(p.scheduled_at) && p.status !== 'cancelled'
    ).length
    const week = pickups.filter((p) => {
      const days = (now - new Date(p.scheduled_at).getTime()) / 86400000
      return days <= 7 && p.status !== 'cancelled'
    }).length
    const total = collectorProfile?.total_pickups ?? 0
    const rating = collectorProfile?.rating ?? 0
    return { today, week, total, rating }
  }, [pickups, collectorProfile])

  const fullName =
    collectorProfile?.full_name ?? authProfile?.full_name ?? 'Pengepul'

  const vehicleLine = collectorProfile?.vehicle_type
    ? `${getVehicleLabel(collectorProfile.vehicle_type)}${
        collectorProfile.vehicle_plate ? ` · ${collectorProfile.vehicle_plate}` : ''
      }`
    : 'Kendaraan belum diatur'

  const goto = (id: string) => onNavigate?.(id)

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <section className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">
              Halo pengepul 👋
            </p>
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary leading-tight">
              {fullName}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-on-surface text-label-sm rounded-full">
                <span className="material-symbols-outlined text-base">local_shipping</span>
                {vehicleLine}
              </span>
              {collectorProfile?.is_verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-label-sm rounded-full">
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-label-sm rounded-full">
                  <span className="material-symbols-outlined text-base">pending</span>
                  Menunggu verifikasi
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => goto('today-route')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 shadow-sm"
          >
            <span className="material-symbols-outlined">route</span>
            Mulai Rute Hari Ini
          </button>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="schedule"
          label="Pickup Hari Ini"
          value={String(stats.today)}
          tone="bg-tertiary-container text-on-tertiary-container"
        />
        <StatCard
          icon="calendar_month"
          label="Pickup 7 Hari"
          value={String(stats.week)}
          tone="bg-primary-container text-on-primary-container"
        />
        <StatCard
          icon="inventory_2"
          label="Total Pickup"
          value={new Intl.NumberFormat('id-ID').format(stats.total)}
          tone="bg-secondary-container text-on-secondary-container"
          sublabel="Sepanjang masa"
        />
        <StatCard
          icon="star"
          label="Rating"
          value={stats.rating ? stats.rating.toFixed(1) : '—'}
          tone="bg-amber-100 text-amber-800"
          sublabel="Dari petani"
        />
      </section>

      {/* CAPACITY INFO */}
      <section className="mb-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined">scale</span>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Kapasitas Kendaraan</p>
              <p className="font-headline-sm text-headline-sm font-bold text-primary">
                {collectorProfile?.capacity_kg
                  ? `${new Intl.NumberFormat('id-ID').format(
                      collectorProfile.capacity_kg
                    )} kg`
                  : 'Belum diatur'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined">home</span>
            Home base: {collectorProfile?.home_base ?? 'Belum diatur'}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mb-8">
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon="route"
            title="Rute Hari Ini"
            desc="Lihat daftar petani yang harus dikunjungi hari ini."
            onClick={() => goto('today-route')}
          />
          <ActionCard
            icon="history"
            title="Riwayat Pickup"
            desc="Catatan pickup yang sudah selesai."
            onClick={() => goto('pickup-history')}
          />
          <ActionCard
            icon="settings"
            title="Pengaturan"
            desc="Kelola data kendaraan & profil pengepul."
            onClick={() => goto('settings')}
          />
        </div>
      </section>

      {/* NEXT PICKUPS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            Pickup Terdekat
          </h2>
          <button
            onClick={() => goto('today-route')}
            className="text-label-lg text-primary hover:underline"
          >
            Lihat rute lengkap →
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          {profileLoading || pickupsLoading ? (
            <div className="p-8 text-center text-on-surface-variant">Memuat…</div>
          ) : pickups.length === 0 ? (
            <EmptyPickups onCta={() => goto('settings')} />
          ) : (
            <ul className="divide-y divide-outline-variant">
              {pickups.map((p) => {
                const meta = STATUS_LABELS[p.status] ?? STATUS_LABELS.scheduled
                return (
                  <li
                    key={p.id}
                    className="p-4 flex flex-wrap items-center gap-3 hover:bg-surface-container-low"
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-title-sm text-title-sm font-semibold text-primary">
                        {p.farmer_name ?? 'Petani'}
                      </p>
                      <p className="text-body-sm text-on-surface-variant truncate">
                        {p.address ?? 'Alamat belum diatur'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm font-medium text-primary">
                        {formatDate(p.scheduled_at)}
                      </p>
                      {p.estimated_kg != null && (
                        <p className="text-label-sm text-on-surface-variant">
                          ±{p.estimated_kg} kg
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-label-sm ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

// === Sub-komponen ===

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
}: {
  icon: string
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:border-primary hover:shadow-md transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="font-title-md text-title-md font-semibold text-primary mb-1">{title}</p>
      <p className="text-body-sm text-on-surface-variant">{desc}</p>
    </button>
  )
}

function EmptyPickups({ onCta }: { onCta: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant">
          route
        </span>
      </div>
      <h3 className="font-title-lg text-title-lg font-semibold text-primary mb-2">
        Belum ada pickup terjadwal
      </h3>
      <p className="text-body-md text-on-surface-variant mb-5 max-w-md mx-auto">
        Fitur rute pickup akan aktif setelah Anda melengkapi data kendaraan dan diverifikasi
        oleh admin desa.
      </p>
      <button
        onClick={onCta}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90"
      >
        <span className="material-symbols-outlined">settings</span>
        Lengkapi Profil
      </button>
    </div>
  )
}
