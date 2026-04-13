-- Drop the old insert policy
DROP POLICY IF EXISTS "Users can create their gym" ON gyms;

-- New policy that allows both users and service role to insert
CREATE POLICY "Allow inserts for owner or service role" ON gyms
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id OR 
    auth.role() = 'service_role'
  );
