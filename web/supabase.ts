// ===========================================================
// lib/supabase.ts
// Singleton Supabase client untuk seluruh aplikasi.
// Ganti URL/KEY dengan nilai dari Supabase Dashboard → Settings → API.
// ===========================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Tidak lempar error di runtime — biar app tetap jalan untuk testing UI
  // tanpa backend. Hook yang query DB akan caught error dan return empty.
  console.warn(
    '[supabase] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum di-set. ' +
      'Aplikasi jalan dalam mode UI-only. Tambahkan di file .env: \n' +
      '  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co\n' +
      '  VITE_SUPABASE_ANON_KEY=eyJhbGc...'
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Tipe data minimal untuk tabel `profiles`. Hook lain (useXxxProfile) extend-nya.
export interface AuthProfile {
  id: string
  role: 'farmer' | 'village_head' | 'distributor' | 'pengepul'
  full_name: string | null
  village_id: string | null
  phone: string | null
  created_at: string
  updated_at: string
}
