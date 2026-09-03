import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useMarketplace — endpoint untuk DistributorShell
 * Mengambil batch yang status='available' dari view v_marketplace_batches.
 */

export interface MarketplaceBatch {
  id: string
  grade: string
  variety: string | null
  weight_kg: number
  harvest_date: string
  created_at: string
  moisture_pct: number | null
  quality_score: number | null
  farmer_id: string
  farmer_name: string | null
  village_id: string | null
  village_name: string | null
  unit_price?: number  // ditambahkan saat checkout
}

interface Filter {
  grade?: 'A' | 'B' | 'C' | 'all'
  search?: string
  minKg?: number
}

interface UseMarketplaceResult {
  batches: MarketplaceBatch[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  placeOrder: (input: {
    items: { batchId: string; quantityKg: number; unitPrice: number }[]
    notes?: string
  }) => Promise<{ orderId: string | null; error: string | null }>
}

// Harga default kalau belum ada tabel harga — patokan per kg per grade
export const DEFAULT_PRICE_PER_KG: Record<'A' | 'B' | 'C', number> = {
  A: 45000,
  B: 32000,
  C: 20000,
}

export function useMarketplace(filter?: Filter): UseMarketplaceResult {
  const [batches, setBatches] = useState<MarketplaceBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase
        .from('v_marketplace_batches')
        .select('*')
        .order('harvest_date', { ascending: false })

      if (filter?.grade && filter.grade !== 'all') {
        q = q.eq('grade', filter.grade)
      }
      if (filter?.search) {
        q = q.or(
          `variety.ilike.%${filter.search}%,farmer_name.ilike.%${filter.search}%,village_name.ilike.%${filter.search}%`
        )
      }
      if (filter?.minKg != null) {
        q = q.gte('weight_kg', filter.minKg)
      }

      const { data, error: err } = await q
      if (err) throw err

      const withPrice = (data ?? []).map((b: any) => ({
        ...b,
        unit_price: DEFAULT_PRICE_PER_KG[(b.grade as 'A' | 'B' | 'C') ?? 'B'] ?? 30000,
      }))
      setBatches(withPrice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat marketplace')
    } finally {
      setLoading(false)
    }
  }, [filter?.grade, filter?.search, filter?.minKg])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const placeOrder = useCallback(
    async (input: {
      items: { batchId: string; quantityKg: number; unitPrice: number }[]
      notes?: string
    }) => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      if (!userId) return { orderId: null, error: 'Belum login' }

      // Ambil full_name distributor snapshot
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()

      // Hitung totals
      const totalKg = input.items.reduce((s, i) => s + i.quantityKg, 0)
      const totalPrice = input.items.reduce(
        (s, i) => s + i.quantityKg * i.unitPrice,
        0
      )

      // Insert orders
      const { data: orderRow, error: orderErr } = await supabase
        .from('orders')
        .insert({
          distributor_id: userId,
          distributor_name: prof?.full_name ?? null,
          total_kg: totalKg,
          total_price: totalPrice,
          notes: input.notes ?? null,
        })
        .select('id')
        .single()

      if (orderErr || !orderRow) {
        return { orderId: null, error: orderErr?.message ?? 'Gagal buat order' }
      }

      // Insert order_items
      const itemsToInsert = input.items.map((item) => ({
        order_id: orderRow.id,
        batch_id: item.batchId,
        quantity_kg: item.quantityKg,
        unit_price: item.unitPrice,
        subtotal: item.quantityKg * item.unitPrice,
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert)

      if (itemsErr) {
        // Rollback order (manual)
        await supabase.from('orders').delete().eq('id', orderRow.id)
        return { orderId: null, error: itemsErr.message }
      }

      // Update batch status jadi 'reserved'
      await supabase
        .from('chili_batches')
        .update({
          status: 'reserved',
          reserved_by_order: orderRow.id,
        })
        .in('id', input.items.map((i) => i.batchId))

      // Buat 1 pickup (otomatis dijadwalkan ke collector default jika ada)
      // Cari collector dengan total_pickups paling sedikit — round-robin sederhana
      const { data: collectors } = await supabase
        .from('collector_profiles')
        .select('user_id')
        .eq('is_verified', true)
        .order('total_pickups', { ascending: true })
        .limit(1)

      if (collectors && collectors.length > 0) {
        await supabase.from('pickups').insert({
          order_id: orderRow.id,
          collector_id: collectors[0].user_id,
          scheduled_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // besok
          status: 'scheduled',
        })
      }

      await fetchBatches()
      return { orderId: orderRow.id, error: null }
    },
    [fetchBatches]
  )

  return { batches, loading, error, refresh: fetchBatches, placeOrder }
}
