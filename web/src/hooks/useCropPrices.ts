import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface CropPrice {
  id: string
  crop_name: string
  variety: string | null
  price: number
  unit: string
  source: 'koperasi_desa' | 'pasar' | 'distributor' | 'lainnya'
  region: string | null
  notes: string | null
  recorded_at: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CropPriceInput {
  crop_name: string
  variety?: string
  price: number
  unit?: 'kg' | 'ton' | 'karung'
  source: CropPrice['source']
  region?: string
  notes?: string
  recorded_at?: string
}

export function useCropPrices() {
  const [prices, setPrices]   = useState<CropPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('crop_prices')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50)

      if (err) throw err
      setPrices(data ?? [])
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrices() }, [fetchPrices])

  const createPrice = async (input: CropPriceInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error: err } = await supabase
      .from('crop_prices')
      .insert({ ...input, created_by: user.id })
      .select()
      .single()

    if (err) throw err
    await fetchPrices()
    return data
  }

  const updatePrice = async (id: string, input: Partial<CropPriceInput>) => {
    const { data, error: err } = await supabase
      .from('crop_prices')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (err) throw err
    await fetchPrices()
    return data
  }

  const deletePrice = async (id: string) => {
    const { error: err } = await supabase
      .from('crop_prices')
      .delete()
      .eq('id', id)

    if (err) throw err
    await fetchPrices()
  }

  return { prices, loading, error, createPrice, updatePrice, deletePrice, refresh: fetchPrices }
}
