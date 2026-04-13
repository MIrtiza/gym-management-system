-- Create gyms table
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- Create index on owner_id for faster queries
CREATE INDEX idx_gyms_owner_id ON gyms(owner_id);

-- Enable RLS
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own gym
CREATE POLICY "Users can read their own gym" ON gyms
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Users can update their own gym
CREATE POLICY "Users can update their own gym" ON gyms
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Users can insert their own gym (during signup)
CREATE POLICY "Users can create their gym" ON gyms
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
