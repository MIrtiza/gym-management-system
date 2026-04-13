-- Fix RLS policy for check_ins table
DROP POLICY IF EXISTS "Users can insert checkins for their gym" ON check_ins;

CREATE POLICY "Allow inserts for gym checkins" ON check_ins
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = check_ins.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- SELECT policy
DROP POLICY IF EXISTS "Users can view checkins of their gym" ON check_ins;

CREATE POLICY "Users can view checkins of their gym" ON check_ins
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = check_ins.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- UPDATE policy
DROP POLICY IF EXISTS "Users can update checkins of their gym" ON check_ins;

CREATE POLICY "Users can update checkins of their gym" ON check_ins
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = check_ins.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
