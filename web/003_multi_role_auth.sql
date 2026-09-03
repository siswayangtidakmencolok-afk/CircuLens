-- ============================================================
-- Migration 003: Multi-Role Authentication
-- Purpose: Add distributor & pengepul (collector) roles
-- Date: Phase 10.1
-- ============================================================

-- Step 1: Drop existing CHECK constraint on profiles.role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add new CHECK constraint that supports 4 roles
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('farmer', 'village_head', 'distributor', 'pengepul'));

-- Step 3: Create distributor_profiles table
CREATE TABLE IF NOT EXISTS public.distributor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_license text, -- NPWP / NIB
  contact_phone text NOT NULL,
  contact_email text,
  -- Address
  address_street text,
  address_city text,
  address_province text,
  -- Coverage
  area_coverage text[], -- daftar kabupaten yang dilayani
  -- Capacity
  max_order_per_week int DEFAULT 1000, -- kg
  -- Verification
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_distributor_user ON public.distributor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_distributor_verified ON public.distributor_profiles(is_verified);

-- Step 4: Create collector_profiles table (pengepul)
CREATE TABLE IF NOT EXISTS public.collector_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('motor', 'mobil_pickup', 'truk_kecil', 'truk_besar')),
  vehicle_plate text,
  capacity_kg int DEFAULT 500,
  -- Operating area
  home_base text, -- desa/lokasi asal
  -- Verification
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  -- Stats
  total_pickups int DEFAULT 0,
  rating numeric(3,2), -- 0.00-5.00
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_collector_user ON public.collector_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_collector_verified ON public.collector_profiles(is_verified);

-- Step 5: Enable RLS
ALTER TABLE public.distributor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS policies for distributor_profiles
-- Distributor can manage own profile
CREATE POLICY "distributor_manage_own_profile" ON public.distributor_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Village head can view all distributors (for verification)
CREATE POLICY "village_head_view_distributors" ON public.distributor_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'village_head'
    )
  );

-- Authenticated users can view verified distributors only (public marketplace)
CREATE POLICY "authenticated_view_verified_distributors" ON public.distributor_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_verified = true
  );

-- Step 7: RLS policies for collector_profiles
CREATE POLICY "collector_manage_own_profile" ON public.collector_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "village_head_view_collectors" ON public.collector_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'village_head'
    )
  );

CREATE POLICY "authenticated_view_verified_collectors" ON public.collector_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_verified = true
  );

-- Step 8: Helper function to get role-specific profile
CREATE OR REPLACE FUNCTION public.get_role_profile(p_user_id uuid)
RETURNS TABLE (
  role text,
  base_profile jsonb,
  role_profile jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.role::text,
    to_jsonb(p.*) AS base_profile,
    CASE
      WHEN p.role = 'distributor' THEN to_jsonb(d.*)
      WHEN p.role = 'pengepul' THEN to_jsonb(c.*)
      ELSE NULL
    END AS role_profile
  FROM public.profiles p
  LEFT JOIN public.distributor_profiles d ON d.user_id = p.id
  LEFT JOIN public.collector_profiles c ON c.user_id = p.id
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Comments for documentation
COMMENT ON TABLE public.distributor_profiles IS 'Profile khusus untuk role distributor (pembeli besar)';
COMMENT ON TABLE public.collector_profiles IS 'Profile khusus untuk role pengepul (middleman)';

-- Step 10: Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_distributor_profile_updated_at ON public.distributor_profiles;
CREATE TRIGGER update_distributor_profile_updated_at
  BEFORE UPDATE ON public.distributor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_collector_profile_updated_at ON public.collector_profiles;
CREATE TRIGGER update_collector_profile_updated_at
  BEFORE UPDATE ON public.collector_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED DATA: Sample users untuk testing multi-role
-- NOTE: User harus dibuat via Supabase Auth API dulu, baru profile
-- ============================================================

-- Untuk membuat user demo:
-- 1. Buka Supabase Dashboard → Authentication → Users → Add user
-- 2. Email: distributor@circulens.desa.id / Password: Distributor2026!
-- 3. Email: pengepul@circulens.desa.id / Password: Pengepul2026!
-- 4. Copy UUID masing-masing user
-- 5. Jalankan SQL ini (ganti USER_UUID dengan UUID dari step 4):

/*
-- Setelah dapat UUID distributor:
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'USER_UUID_DARI_SUPABASE_AUTH',
  'distributor@circulens.desa.id',
  'PT Hasil Tani Makmur',
  'distributor'
);

INSERT INTO public.distributor_profiles (
  user_id, company_name, business_license, contact_phone, contact_email,
  address_city, address_province, area_coverage, max_order_per_week, is_verified
)
VALUES (
  'USER_UUID_DARI_SUPABASE_AUTH',
  'PT Hasil Tani Makmur',
  'NPWP.01.234.567.8-901.000',
  '+62 812-1111-2222',
  'order@hasiltani.co.id',
  'Jakarta Selatan',
  'DKI Jakarta',
  ARRAY['Bogor', 'Sukabumi', 'Cianjur'],
  5000,
  true
);

-- Setelah dapat UUID pengepul:
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'USER_UUID_DARI_SUPABASE_AUTH',
  'pengepul@circulens.desa.id',
  'Pak Surya (Pengepul)',
  'pengepul'
);

INSERT INTO public.collector_profiles (
  user_id, full_name, vehicle_type, vehicle_plate, capacity_kg, home_base, is_verified
)
VALUES (
  'USER_UUID_DARI_SUPABASE_AUTH',
  'Pak Surya',
  'mobil_pickup',
  'B 1234 XYZ',
  800,
  'Desa Sukatani',
  true
);
*/