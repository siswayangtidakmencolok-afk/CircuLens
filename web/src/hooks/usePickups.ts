import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * usePickups — untuk pengepul: list pickup hari ini + aksi complete.
 */

export interface PickupRouteItem {
  pickup_id: string
  order_id: string
  pickup_status: 'scheduled' | 'en_route' | 'picked_up' | 'cancelled'
  scheduled_at: string
  distributor_name: string | null
  distributor_id: string
  order_item_id: string
  batch_id: string
  batch_grade: string | null
  farmer_name: string | null
  quantity_kg: number
  actual_kg: number | null
  harvest_date: string
}

interface UsePickupsResult {
  routes: PickupRouteItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  startPickup: (pickupId: string) => Promise<void>
  completePickup: (pickupId: string, actualKg: number, notes?: string) => Promise<{
    error: string | null
  }>
  cancelPickup: (pickupId: string) => Promise<void>
}

export function usePickups(collectorId: string | undefined): UsePickupsResult {
  const [routes, setRoutes] = useState<PickupRouteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!collectorId) {
      setRoutes([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('v_collector_routes')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (err) throw err
      setRoutes((data ?? []) as PickupRouteItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat rute')
    } finally {
      setLoading(false)
    }
  }, [collectorId])

  useEffect(() => {
    fetch()
  }, [fetch])

  const startPickup = useCallback(
    async (pickupId: string) => {
      await supabase
        .from('pickups')
        .update({ status: 'en_route', started_at: new Date().toISOString() })
        .eq('id', pickupId)
      await fetch()
    },
    [fetch]
  )

  const completePickup = useCallback(
    async (pickupId: string, actualKg: number, notes?: string) => {
      // Validasi: actual_kg harus >= 0
      if (actualKg < 0) return { error: 'Berat tidak valid' }

      // Hitung total actual_kg dari semua item di order
      const { data: items } = await supabase
        .from('order_items')
        .select('id, quantity_kg')
        .eq('order_id',
          // ambil order_id dari pickup
          (await supabase
            .from('pickups')
            .select('order_id')
            .eq('id', pickupId)
            .maybeSingle()).data?.order_id ?? ''
        )

      const totalActual =
        items?.reduce((s, i: any) => s + Number(i.quantity_kg), 0) ?? 0

      const { error: err } = await supabase
        .from('pickups')
        .update({
          status: 'picked_up',
          completed_at: new Date().toISOString(),
          total_kg: totalActual || actualKg,
          notes: notes ?? null,
        })
        .eq('id', pickupId)

      if (err) return { error: err.message }

      // Update actual_kg di order_items satu per satu (opsional,
      // trigger akan handle batch status)
      await supabase
        .from('order_items')
        .update({ actual_kg: actualKg, picked_up_at: new Date().toISOString() })
        .eq('batch_id', routes.find((r) => r.pickup_id === pickupId)?.batch_id ?? '')

      await fetch()
      return { error: null }
    },
    [fetch, routes]
  )

  const cancelPickup = useCallback(
    async (pickupId: string) => {
      await supabase
        .from('pickups')
        .update({ status: 'cancelled' })
        .eq('id', pickupId)
      await fetch()
    },
    [fetch]
  )

  return {
    routes,
    loading,
    error,
    refresh: fetch,
    startPickup,
    completePickup,
    cancelPickup,
  }
}
