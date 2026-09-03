import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface DistributorProfile {
  id: string
  user_id: string
  company_name: string
  business_license: string | null
  contact_phone: string
  contact_email: string | null
  address_street: string | null
  address_city: string | null
  address_province: string | null
  area_coverage: string[] | null
  max_order_per_week: number
  is_verified: boolean
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

interface UseDistributorProfileResult {
  profile: DistributorProfile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateProfile: (input: Partial<DistributorProfile>) => Promise<void>
}

export function useDistributorProfile(
  userId: string | undefined
): UseDistributorProfileResult {
  const [profile, setProfile] = useState<DistributorProfile | null>(null)
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
        .from('distributor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (err) throw err
      setProfile(data as DistributorProfile | null)
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
    async (input: Partial<DistributorProfile>) => {
      if (!userId) return
      const { error: err } = await supabase
        .from('distributor_profiles')
        .update(input)
        .eq('user_id', userId)
      if (err) throw new Error(err.message)
      await fetchProfile()
    },
    [userId, fetchProfile]
  )

  return { profile, loading, error, refresh: fetchProfile, updateProfile }
}