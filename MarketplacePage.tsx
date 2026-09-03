import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  useMarketplace,
  DEFAULT_PRICE_PER_KG,
} from '../../hooks/useMarketplace'
import type { MarketplaceBatch } from '../../hooks/useMarketplace'

/**
 * MarketplacePage — Halaman untuk distributor.
 * - Browse batch dari petani (filter grade/search/min Kg)
 * - Tambah ke keranjang → checkout → order dibuat, batch.status = 'reserved'
 *
 * Dipakai di dalam DistributorShell pada menu 'marketplace'.
 */

interface Props {
  onNavigate?: (id: string) => void
}

interface CartItem {
  batch: MarketplaceBatch
  quantityKg: number
}

const GRADE_OPTIONS = [
  { value: 'all', label: 'Semua Grade', tone: 'bg-surface-container text-on-surface' },
  { value: 'A', label: 'Grade A', tone: 'bg-emerald-100 text-emerald-800' },
  { value: 'B', label: 'Grade B', tone: 'bg-amber-100 text-amber-800' },
  { value: 'C', label: 'Grade C', tone: 'bg-rose-100 text-rose-800' },
] as const

function formatRupiah(n: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function daysAgo(iso: string): string {
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86400000
  )
  if (days === 0) return 'Hari ini'
  if (days === 1) return '1 hari lalu'
  return `${days} hari lalu`
}

export function MarketplacePage({ onNavigate }: Props) {
  const { profile: authProfile } = useAuth()
  const [gradeFilter, setGradeFilter] =
    useState<typeof GRADE_OPTIONS[number]['value']>('all')
  const [search, setSearch] = useState('')
  const [minKg, setMinKg] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { batches, loading, error, placeOrder } = useMarketplace({
    grade: gradeFilter,
    search: search.trim() || undefined,
    minKg: minKg > 0 ? minKg : undefined,
  })

  const cartSummary = useMemo(() => {
    const totalKg = cart.reduce((s, i) => s + i.quantityKg, 0)
    const totalPrice = cart.reduce(
      (s, i) => s + i.quantityKg * (i.batch.unit_price ?? 0),
      0
    )
    return { totalKg, totalPrice }
  }, [cart])

  const addToCart = (batch: MarketplaceBatch, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.batch.id === batch.id)
      if (existing) {
        return prev.map((i) =>
          i.batch.id === batch.id
            ? { ...i, quantityKg: Math.min(i.quantityKg + qty, batch.weight_kg) }
            : i
        )
      }
      return [...prev, { batch, quantityKg: Math.min(qty, batch.weight_kg) }]
    })
  }

  const removeFromCart = (batchId: string) =>
    setCart((prev) => prev.filter((i) => i.batch.id !== batchId))

  const updateQty = (batchId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.batch.id === batchId
          ? {
              ...i,
              quantityKg: Math.max(1, Math.min(qty, i.batch.weight_kg)),
            }
          : i
      )
    )
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const res = await placeOrder({
        items: cart.map((i) => ({
          batchId: i.batch.id,
          quantityKg: i.quantityKg,
          unitPrice: i.batch.unit_price ?? DEFAULT_PRICE_PER_KG.B,
        })),
        notes: `Order dari ${authProfile?.full_name ?? 'distributor'}`,
      })
      if (res.error) {
        alert('Gagal membuat pesanan: ' + res.error)
      } else {
        setSuccessMsg(`Pesanan berhasil dibuat! (${cart.length} batch dipesan)`)
        setCart([])
        setShowCart(false)
        setTimeout(() => setSuccessMsg(null), 4000)
        onNavigate?.('my-orders')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="mb-6">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">
          Marketplace Cabai
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Pilih batch dari petani, tambahkan ke keranjang, dan checkout. Pengepul akan
          mengambilnya otomatis.
        </p>
      </header>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="mb-5 p-4 bg-emerald-100 text-emerald-900 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="mb-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Cari varietas, petani, desa…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* Grade filter chips */}
          <div className="flex gap-2 flex-wrap">
            {GRADE_OPTIONS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGradeFilter(g.value)}
                className={`px-3 py-1.5 rounded-full text-label-md font-medium transition-all ${
                  gradeFilter === g.value
                    ? 'bg-primary text-on-primary shadow-sm'
                    : `${g.tone} opacity-70 hover:opacity-100`
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Min kg */}
          <div className="flex items-center gap-2">
            <label className="text-label-md text-on-surface-variant whitespace-nowrap">
              Min:
            </label>
            <input
              type="number"
              min={0}
              value={minKg}
              onChange={(e) => setMinKg(Number(e.target.value) || 0)}
              className="w-24 px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
            />
            <span className="text-label-md text-on-surface-variant">kg</span>
          </div>
        </div>
      </div>

      {/* CART BAR (sticky) */}
      {cart.length > 0 && (
        <div className="mb-6 bg-primary-container text-on-primary-container rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md sticky top-2 z-20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">shopping_cart</span>
            <div>
              <p className="font-label-lg font-semibold">
                {cart.length} item · {cartSummary.totalKg.toFixed(1)} kg
              </p>
              <p className="text-label-sm opacity-80">
                Total: {formatRupiah(cartSummary.totalPrice)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCart(true)}
              className="px-4 py-2 bg-surface text-primary rounded-full font-label-md hover:opacity-90"
            >
              Lihat Keranjang
            </button>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-md hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Memproses…' : 'Checkout'}
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-5 p-4 bg-error-container text-on-error-container rounded-lg">
          {error}
        </div>
      )}

      {/* BATCH GRID */}
      {loading ? (
        <div className="text-center py-20 text-on-surface-variant">Memuat batch…</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              inventory_2
            </span>
          </div>
          <p className="text-body-lg text-on-surface-variant">
            Belum ada batch tersedia dengan filter ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => {
            const gradeStyle =
              GRADE_OPTIONS.find((g) => g.value === b.grade)?.tone ??
              'bg-surface-container text-on-surface'
            return (
              <BatchCard
                key={b.id}
                batch={b}
                gradeTone={gradeStyle}
                onAdd={(qty) => addToCart(b, qty)}
              />
            )
          })}
        </div>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <CartDrawer
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onCheckout={handleCheckout}
          submitting={submitting}
        />
      )}
    </div>
  )
}

// === Sub-komponen ===

function BatchCard({
  batch,
  gradeTone,
  onAdd,
}: {
  batch: MarketplaceBatch
  gradeTone: string
  onAdd: (qty: number) => void
}) {
  const [qty, setQty] = useState(Math.min(10, batch.weight_kg))
  const price = batch.unit_price ?? 30000

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Grade banner */}
      <div className={`px-4 py-2 ${gradeTone} flex items-center justify-between`}>
        <span className="font-label-lg font-bold">
          Grade {batch.grade ?? '?'}
        </span>
        {batch.moisture_pct != null && (
          <span className="text-label-sm opacity-80">
            {batch.moisture_pct.toFixed(1)}% moisture
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-title-md text-title-md font-semibold text-primary mb-1">
          {batch.variety ?? 'Cabai'} · {batch.farmer_name ?? 'Petani'}
        </h3>
        <p className="text-body-sm text-on-surface-variant mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">location_on</span>
          {batch.village_name ?? 'Lokasi tidak diketahui'}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-body-sm">
          <div>
            <p className="text-on-surface-variant text-label-sm">Stok</p>
            <p className="font-semibold text-primary">
              {batch.weight_kg.toFixed(1)} kg
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-sm">Dipanen</p>
            <p className="font-medium text-primary">{daysAgo(batch.harvest_date)}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-label-sm">Harga</p>
            <p className="font-semibold text-primary">
              {formatRupiah(price)}<span className="text-label-sm font-normal">/kg</span>
            </p>
          </div>
          {batch.quality_score != null && (
            <div>
              <p className="text-on-surface-variant text-label-sm">Kualitas</p>
              <p className="font-medium text-primary">
                {batch.quality_score.toFixed(0)}/100
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={1}
            max={batch.weight_kg}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(batch.weight_kg, Number(e.target.value) || 1)))
            }
            className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-center"
          />
          <span className="flex items-center text-label-md text-on-surface-variant">
            kg
          </span>
        </div>

        <button
          onClick={() => onAdd(qty)}
          disabled={qty < 1 || qty > batch.weight_kg}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">add_shopping_cart</span>
          Tambah — {formatRupiah(price * qty)}
        </button>
      </div>
    </div>
  )
}

function CartDrawer({
  cart,
  onClose,
  onRemove,
  onUpdateQty,
  onCheckout,
  submitting,
}: {
  cart: CartItem[]
  onClose: () => void
  onRemove: (batchId: string) => void
  onUpdateQty: (batchId: string, qty: number) => void
  onCheckout: () => Promise<void>
  submitting: boolean
}) {
  const totalKg = cart.reduce((s, i) => s + i.quantityKg, 0)
  const totalPrice = cart.reduce(
    (s, i) => s + i.quantityKg * (i.batch.unit_price ?? 0),
    0
  )
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-surface shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            Keranjang ({cart.length})
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10">
              Keranjang kosong.
            </p>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.batch.id}
                  className="flex gap-3 p-3 bg-surface-container-low rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-label-lg font-medium text-primary">
                      {item.batch.variety ?? 'Cabai'} ·{' '}
                      {item.batch.farmer_name ?? 'Petani'}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      Grade {item.batch.grade} ·{' '}
                      {formatRupiah(item.batch.unit_price ?? 0)}/kg
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQty(item.batch.id, item.quantityKg - 1)
                        }
                        className="w-6 h-6 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <input
                        type="number"
                        value={item.quantityKg}
                        onChange={(e) =>
                          onUpdateQty(item.batch.id, Number(e.target.value) || 1)
                        }
                        className="w-16 text-center px-2 py-1 bg-surface border border-outline-variant rounded"
                      />
                      <button
                        onClick={() =>
                          onUpdateQty(item.batch.id, item.quantityKg + 1)
                        }
                        className="w-6 h-6 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                      <span className="text-label-sm text-on-surface-variant">kg</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {formatRupiah(
                        (item.batch.unit_price ?? 0) * item.quantityKg
                      )}
                    </p>
                    <button
                      onClick={() => onRemove(item.batch.id)}
                      className="text-error text-label-sm hover:underline mt-2"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-outline-variant bg-surface-container-low">
            <div className="flex justify-between mb-2 text-body-md">
              <span>Total berat</span>
              <span className="font-semibold">{totalKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between mb-4 text-headline-sm">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              disabled={submitting}
              className="w-full px-5 py-3 bg-primary text-on-primary rounded-full font-label-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Memproses…'
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  Checkout Sekarang
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
