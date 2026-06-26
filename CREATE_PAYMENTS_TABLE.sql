-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer')),
  payment_type text NOT NULL DEFAULT 'membership' CHECK (payment_type IN ('membership', 'additional')),
  membership_plan text DEFAULT NULL CHECK (membership_plan IS NULL OR membership_plan IN ('starter', 'pro', 'elite')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description text,
  transaction_id text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on gym_id for faster queries
CREATE INDEX IF NOT EXISTS payments_gym_id_idx ON payments(gym_id);
CREATE INDEX IF NOT EXISTS payments_member_id_idx ON payments(member_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Gym owners can see their payments
CREATE POLICY payments_select_policy ON payments
  FOR SELECT
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- RLS Policy: Gym owners can insert payments
CREATE POLICY payments_insert_policy ON payments
  FOR INSERT
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- RLS Policy: Gym owners can update payments
CREATE POLICY payments_update_policy ON payments
  FOR UPDATE
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- RLS Policy: Gym owners can delete payments
CREATE POLICY payments_delete_policy ON payments
  FOR DELETE
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );


-- Create payment_plans table (for storing membership plan prices)
CREATE TABLE IF NOT EXISTS payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(gym_id, plan_name, billing_cycle)
);

-- Create index
CREATE INDEX IF NOT EXISTS payment_plans_gym_id_idx ON payment_plans(gym_id);

-- Enable RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_plans
CREATE POLICY payment_plans_select_policy ON payment_plans
  FOR SELECT
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY payment_plans_insert_policy ON payment_plans
  FOR INSERT
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY payment_plans_update_policy ON payment_plans
  FOR UPDATE
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );
