-- Fix RLS policy for members table to allow service role inserts
DROP POLICY IF EXISTS "Users can insert members for their gym" ON members;

CREATE POLICY "Allow inserts for gym members" ON members
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = members.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- Also ensure SELECT policy works
DROP POLICY IF EXISTS "Users can view members of their gym" ON members;

CREATE POLICY "Users can view members of their gym" ON members
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = members.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- And UPDATE policy
DROP POLICY IF EXISTS "Users can update members of their gym" ON members;

CREATE POLICY "Users can update members of their gym" ON members
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = members.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
