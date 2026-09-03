import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface CollectorProfile {
  id: string
  user_id: string
  full_name: string
  vehicle_type: 'motor' | 'mobil_pickup' | 'truk_kecil' | 'truk_besar'
  vehicle_plate: string | null
  capacity_kg: number
  home_base: string | null
  is_verified: boolean
  verified_at: string | null
  verified_by: string | null
  total_pickups: number
  rating: number | null
  created_at: string
  updated_at: string
}

interface UseCollectorProfileResult {
  profile: CollectorProfile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateProfile: (input: Partial<CollectorProfile>) => Promise<void>
}

const VEHICLE_LABELS: Record<CollectorProfile['vehicle_type'], string> = {
  motor: 'Motor',
  mobil_pickup: 'Mobil Pickup',
  truk_kecil: 'Truk Kecil',
  truk_besar: 'Truk Besar',
}

export function getVehicleLabel(type: CollectorProfile['vehicle_type']): string {
  return VEHICLE_LABELS[type]
}

export function useCollectorProfile(
  userId: string | undefined
): UseCollectorProfileResult {
  const [profile, setProfile] = useState<CollectorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('collector_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (err) throw err
      setProfile(data as CollectorProfile | null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat profile')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (input: Partial<CollectorProfile>) => {
      if (!userId) return
      const { error: err } = await supabase
        .from('collector_profiles')
        .update(input)
        .eq('user_id', userId)
      if (err) throw new Error(err.message)
      await fetchProfile()
    },
    [userId, fetchProfile]
  )

  return { profile, loading, error, refresh: fetchProfile, updateProfile }
}