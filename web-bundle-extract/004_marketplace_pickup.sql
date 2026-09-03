-- =============================================================
-- 004_marketplace_pickup.sql
-- Phase 10.2 + 10.3 — Distributor Marketplace & Pengepul Pickup
-- =============================================================
-- Skema end-to-end:
--   farmers membuat batch (chili_batches.status = 'available')
--   → distributor membuat order (orders, order_items)
--   → batch.status berubah jadi 'reserved'
--   → pengepul menandai pickup selesai → batch.status = 'sold'
--
-- TIDAK ada pemisahan user vs admin di level data — semua role
-- baca dari tabel yang sama, dengan RLS policy masing-masing.
-- =============================================================

-- ---------- 1. MODIFIKASI chili_batches (tambah kolom pickup tracking) ----
ALTER TABLE chili_batches
  ADD COLUMN IF NOT EXISTS reserved_by_order UUID REFERENCES orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS picked_up_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_kg NUMERIC(10,2);

-- Index untuk query marketplace (filter by status + grade)
CREATE INDEX IF NOT EXISTS idx_chili_batches_marketplace
  ON chili_batches (status, grade, harvest_date DESC)
  WHERE status IN ('available', 'reserved');

-- ---------- 2. TABEL orders (pesanan distributor) --------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- opsional: nama distributor di-snapshot saat order dibuat
  distributor_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
  total_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_distributor ON orders (distributor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- ---------- 3. TABEL order_items (line item per batch) -----------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES chili_batches(id) ON DELETE RESTRICT,
  -- snapshot data batch saat order dibuat
  batch_grade TEXT,
  farmer_name TEXT,
  quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL,
  -- lifecycle item
  item_status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (item_status IN ('reserved', 'picked_up', 'cancelled')),
  picked_up_at TIMESTAMPTZ,
  actual_kg NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_batch ON order_items (batch_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items (item_status);

-- ---------- 4. TABEL pickups (driver = pengepul, refers ke order) -----
CREATE TABLE IF NOT EXISTS pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  collector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'en_route', 'picked_up', 'cancelled')),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_kg NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickups_collector ON pickups (collector_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_pickups_order ON pickups (order_id);

-- ---------- 5. TRIGGER: maintenance total_kg & total_price di orders --
CREATE OR REPLACE FUNCTION recompute_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders o
  SET
    total_kg   = COALESCE((SELECT SUM(quantity_kg) FROM order_items
                            WHERE order_id = o.id AND item_status <> 'cancelled'), 0),
    total_price= COALESCE((SELECT SUM(subtotal) FROM order_items
                            WHERE order_id = o.id AND item_status <> 'cancelled'), 0),
    updated_at = now()
  WHERE o.id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_order_totals ON order_items;
CREATE TRIGGER trg_recompute_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION recompute_order_totals();

-- ---------- 6. TRIGGER: balikkan batch ke 'available' kalau order batal -
CREATE OR REPLACE FUNCTION release_batch_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_status = 'cancelled' AND OLD.item_status <> 'cancelled' THEN
    UPDATE chili_batches
    SET status = 'available',
        reserved_by_order = NULL,
        updated_at = now()
    WHERE id = NEW.batch_id AND status = 'reserved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_release_batch_on_cancel ON order_items;
CREATE TRIGGER trg_release_batch_on_cancel
  AFTER UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION release_batch_on_cancel();

-- ---------- 7. TRIGGER: naikkan batch jadi 'sold' saat pickup_complete -
CREATE OR REPLACE FUNCTION complete_pickup_mark_sold()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'picked_up' AND OLD.status <> 'picked_up' THEN
    -- set semua item jadi picked_up + tandai batch jadi sold
    UPDATE order_items
    SET item_status = 'picked_up',
        picked_up_at = now(),
        actual_kg = COALESCE(actual_kg, quantity_kg)
    WHERE order_id = NEW.order_id
      AND item_status = 'reserved';

    UPDATE chili_batches b
    SET status = 'sold',
        picked_up_by = NEW.collector_id,
        picked_up_at = now(),
        actual_kg = COALESCE(NEW.total_kg, b.actual_kg),
        reserved_by_order = NULL,
        updated_at = now()
    FROM order_items oi
    WHERE oi.order_id = NEW.order_id
      AND oi.batch_id = b.id;

    -- tandai order selesai kalau semua item completed
    UPDATE orders o
    SET status = 'completed',
        updated_at = now()
    WHERE o.id = NEW.order_id
      AND NOT EXISTS (
        SELECT 1 FROM order_items
        WHERE order_id = NEW.order_id AND item_status NOT IN ('picked_up', 'cancelled')
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_complete_pickup_mark_sold ON pickups;
CREATE TRIGGER trg_complete_pickup_mark_sold
  AFTER UPDATE ON pickups
  FOR EACH ROW EXECUTE FUNCTION complete_pickup_mark_sold();

-- ---------- 8. ROW LEVEL SECURITY ---------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;

-- Orders: distributor (own), pengepul (via pickup), petani (via order_items.batch_id → chili_batches.farmer_id), kepala desa (semua di village)
DROP POLICY IF EXISTS orders_select_own ON orders;
CREATE POLICY orders_select_own ON orders
  FOR SELECT USING (
    distributor_id = auth.uid()  -- distributor sendiri
    OR EXISTS (SELECT 1 FROM pickups p WHERE p.order_id = orders.id AND p.collector_id = auth.uid()) -- pengepul yg pegang order
    OR EXISTS (
      SELECT 1 FROM order_items oi
      JOIN chili_batches b ON b.id = oi.batch_id
      WHERE oi.order_id = orders.id AND b.farmer_id = auth.uid()
    ) -- petani pemilik batch
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'village_head'
    ) -- kepala desa lihat semua
  );

DROP POLICY IF EXISTS orders_insert_distributor ON orders;
CREATE POLICY orders_insert_distributor ON orders
  FOR INSERT WITH CHECK (distributor_id = auth.uid());

DROP POLICY IF EXISTS orders_update_own ON orders;
CREATE POLICY orders_update_own ON orders
  FOR UPDATE USING (distributor_id = auth.uid());

-- order_items: visible jika user terkait ke order atau batch
DROP POLICY IF EXISTS oi_select ON order_items;
CREATE POLICY oi_select ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id)
  );

DROP POLICY IF EXISTS oi_insert ON order_items;
CREATE POLICY oi_insert ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.distributor_id = auth.uid()
        AND o.status IN ('pending', 'confirmed')
    )
  );

DROP POLICY IF EXISTS oi_update ON order_items;
CREATE POLICY oi_update ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.distributor_id = auth.uid()
    )
  );

-- pickups: visible untuk collector yg pegang + distributor + kepala desa
DROP POLICY IF EXISTS pickups_select ON pickups;
CREATE POLICY pickups_select ON pickups
  FOR SELECT USING (
    collector_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = pickups.order_id AND o.distributor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'village_head'
    )
  );

DROP POLICY IF EXISTS pickups_update_collector ON pickups;
CREATE POLICY pickups_update_collector ON pickups
  FOR UPDATE USING (collector_id = auth.uid());

-- ---------- 9. VIEW: marketplace (gabungan batch + farmer info) --------
CREATE OR REPLACE VIEW v_marketplace_batches AS
SELECT
  b.id,
  b.grade,
  b.variety,
  b.weight_kg,
  b.harvest_date,
  b.created_at,
  b.moisture_pct,
  b.quality_score,
  b.farmer_id,
  p.full_name AS farmer_name,
  p.village_id,
  v.name AS village_name
FROM chili_batches b
JOIN profiles p ON p.id = b.farmer_id
LEFT JOIN villages v ON v.id = p.village_id
WHERE b.status = 'available';

-- ---------- 10. VIEW: rute pickup pengepul (denormalized) -------------
CREATE OR REPLACE VIEW v_collector_routes AS
SELECT
  pu.id AS pickup_id,
  pu.order_id,
  pu.status AS pickup_status,
  pu.scheduled_at,
  o.distributor_name,
  o.distributor_id,
  oi.id AS order_item_id,
  oi.batch_id,
  oi.batch_grade,
  oi.farmer_name,
  oi.quantity_kg,
  oi.actual_kg,
  b.harvest_date
FROM pickups pu
JOIN orders o ON o.id = pu.order_id
JOIN order_items oi ON oi.order_id = o.id
JOIN chili_batches b ON b.id = oi.batch_id
WHERE pu.collector_id = auth.uid()
  AND oi.item_status = 'reserved';

-- =============================================================
-- SELESAI. Sekarang distributor dan pengepul bisa pakai flow
-- yang sama (data) dengan menu masing-masing.
-- =============================================================
