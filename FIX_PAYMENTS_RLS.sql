-- Fix RLS policy for payments table
DROP POLICY IF EXISTS "Users can insert payments for their gym" ON payments;

CREATE POLICY "Allow inserts for gym payments" ON payments
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = payments.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- SELECT policy
DROP POLICY IF EXISTS "Users can view payments of their gym" ON payments;

CREATE POLICY "Users can view payments of their gym" ON payments
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = payments.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- UPDATE policy
DROP POLICY IF EXISTS "Users can update payments of their gym" ON payments;

CREATE POLICY "Users can update payments of their gym" ON payments
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = payments.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
