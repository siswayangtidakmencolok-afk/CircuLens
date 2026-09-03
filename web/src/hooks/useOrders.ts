import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useOrders — untuk distributor melihat pesanannya sendiri.
 */
export interface OrderListItem {
  id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
  total_kg: number
  total_price: number
  created_at: string
  notes: string | null
  item_count: number
}

interface UseOrdersResult {
  orders: OrderListItem[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useOrders(distributorId: string | undefined): UseOrdersResult {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!distributorId) {
      setOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Ambil orders + count of order_items via join
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          id, status, total_kg, total_price, created_at, notes,
          order_items(id)
        `)
        .eq('distributor_id', distributorId)
        .order('created_at', { ascending: false })

      if (err) throw err

      const mapped = (data ?? []).map((o: any) => ({
        id: o.id,
        status: o.status,
        total_kg: o.total_kg,
        total_price: o.total_price,
        created_at: o.created_at,
        notes: o.notes,
        item_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
      }))

      setOrders(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [distributorId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { orders, loading, error, refresh: fetch }
}
