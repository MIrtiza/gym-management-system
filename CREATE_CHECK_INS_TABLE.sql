-- Create check_ins table
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMP,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, check_in_time)
);

-- Create indexes for better performance
CREATE INDEX idx_check_ins_gym_id ON check_ins(gym_id);
CREATE INDEX idx_check_ins_member_id ON check_ins(member_id);
CREATE INDEX idx_check_ins_check_in_time ON check_ins(check_in_time DESC);

-- Enable RLS
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- users can view check-ins for their gym
CREATE POLICY "Users can view check_ins of their gym" ON check_ins
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = check_ins.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- service role can insert check-ins
CREATE POLICY "Allow inserts for gym check_ins" ON check_ins
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- service role can update check-ins
CREATE POLICY "Users can update check_ins of their gym" ON check_ins
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = check_ins.gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );
