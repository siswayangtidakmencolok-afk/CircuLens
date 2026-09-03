import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { usePickups } from '../../hooks/usePickups'

/**
 * PickupPage — Halaman pengepul untuk rute pickup + aksi complete.
 * Setelah 'picked_up', trigger SQL otomatis update batch jadi 'sold'.
 */

interface Props {
  onNavigate?: (id: string) => void
}

const STATUS_META: Record<string, { label: string; tone: string; icon: string }> = {
  scheduled: {
    label: 'Terjadwal',
    tone: 'bg-blue-100 text-blue-800',
    icon: 'schedule',
  },
  en_route: {
    label: 'Dalam Perjalanan',
    tone: 'bg-indigo-100 text-indigo-800',
    icon: 'directions_car',
  },
  picked_up: {
    label: 'Sudah Diambil',
    tone: 'bg-emerald-100 text-emerald-800',
    icon: 'check_circle',
  },
  cancelled: {
    label: 'Dibatalkan',
    tone: 'bg-rose-100 text-rose-800',
    icon: 'cancel',
  },
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function PickupPage(_props: Props) {
  const { profile: authProfile } = useAuth()
  const {
    routes,
    loading,
    error,
    startPickup,
    completePickup,
    cancelPickup,
    refresh,
  } = usePickups(authProfile?.id)

  // Pickup aktif yang sedang di-edit
  const [activePickupId, setActivePickupId] = useState<string | null>(null)
  const [actualKg, setActualKg] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Group routes by pickup_id
  const grouped = routes.reduce<Record<string, typeof routes>>((acc, r) => {
    if (!acc[r.pickup_id]) acc[r.pickup_id] = []
    acc[r.pickup_id].push(r)
    return acc
  }, {})

  const openComplete = (pickupId: string, plannedKg: number) => {
    setActivePickupId(pickupId)
    setActualKg(plannedKg)
    setNotes('')
  }

  const submitComplete = async () => {
    if (!activePickupId) return
    setSubmitting(true)
    try {
      const res = await completePickup(activePickupId, actualKg, notes)
      if (res.error) {
        alert('Gagal: ' + res.error)
      } else {
        setActivePickupId(null)
        await refresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
          Rute Pickup
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Daftar pesanan distributor yang perlu diambil dari petani. Tandai 'Selesai' setelah
          menimbang berat aktual di lapangan.
        </p>
      </header>

      {error && (
        <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-on-surface-variant">Memuat rute…</div>
      ) : routes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              route
            </span>
          </div>
          <h3 className="font-title-lg text-title-lg font-semibold text-primary mb-2">
            Belum ada rute pickup
          </h3>
          <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
            Setelah distributor checkout, rute pickup akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([pickupId, items]) => {
            const meta =
              STATUS_META[items[0].pickup_status] ?? STATUS_META.scheduled
            const totalPlanned = items.reduce(
              (s, i) => s + Number(i.quantity_kg),
              0
            )
            return (
              <div
                key={pickupId}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-outline-variant flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">
                      Pickup #{pickupId.slice(0, 8)} · Order #{items[0].order_id.slice(0, 8)}
                    </p>
                    <p className="font-title-md text-title-md font-semibold text-primary">
                      Ke: {items[0].distributor_name ?? 'Distributor'}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Jadwal: {formatDate(items[0].scheduled_at)}
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

                {/* Items */}
                <div className="p-5 space-y-3">
                  {items.map((it) => (
                    <div
                      key={it.order_item_id}
                      className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined">storefront</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-label-lg font-medium text-primary">
                          {it.farmer_name ?? 'Petani'}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          Grade {it.batch_grade ?? '?'} · Panen{' '}
                          {new Date(it.harvest_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {it.quantity_kg.toFixed(1)} kg
                        </p>
                        {it.actual_kg != null && (
                          <p className="text-label-sm text-emerald-700">
                            Aktual: {it.actual_kg.toFixed(1)} kg
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex flex-wrap items-center gap-2">
                  <span className="text-body-sm text-on-surface-variant mr-auto">
                    Total rencana: <strong className="text-primary">{totalPlanned.toFixed(1)} kg</strong>
                  </span>

                  {items[0].pickup_status === 'scheduled' && (
                    <button
                      onClick={() => startPickup(pickupId)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-md hover:opacity-90"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Mulai Perjalanan
                    </button>
                  )}
                  {(items[0].pickup_status === 'en_route' ||
                    items[0].pickup_status === 'scheduled') && (
                    <>
                      <button
                        onClick={() => openComplete(pickupId, totalPlanned)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-label-md hover:opacity-90"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        Selesaikan Pickup
                      </button>
                      <button
                        onClick={() => cancelPickup(pickupId)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-error hover:bg-error-container/20 rounded-full font-label-md"
                      >
                        <span className="material-symbols-outlined">cancel</span>
                        Batalkan
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* COMPLETE MODAL */}
      {activePickupId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setActivePickupId(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-outline-variant">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
                Selesaikan Pickup
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Berat Aktual (kg)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={actualKg}
                  onChange={(e) => setActualKg(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-headline-sm"
                />
                <p className="text-label-sm text-on-surface-variant mt-1">
                  Masukkan berat total aktual hasil penimbangan di lapangan.
                </p>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Mis: Cuaca cerah, kualitas baik…"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="p-5 border-t border-outline-variant flex gap-2 justify-end">
              <button
                onClick={() => setActivePickupId(null)}
                className="px-4 py-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"
              >
                Batal
              </button>
              <button
                onClick={submitComplete}
                disabled={submitting || actualKg <= 0}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  'Menyimpan…'
                ) : (
                  <>
                    <span className="material-symbols-outlined">check</span>
                    Konfirmasi Selesai
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
