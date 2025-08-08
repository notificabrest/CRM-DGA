/*
  # Create deals table

  1. New Tables
    - `deals`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `value` (numeric, default 0)
      - `currency` (text, default 'USD')
      - `probability` (integer, default 50)
      - `expected_close_date` (date)
      - `status_id` (uuid, foreign key to pipeline_statuses)
      - `client_id` (uuid, foreign key to clients)
      - `owner_id` (uuid, foreign key to users)
      - `branch_id` (uuid, foreign key to branches)
      - `tags` (text array)
      - `notes` (text)
      - `history` (jsonb array for status changes)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `deals` table
    - Add policies for authenticated users to manage deals
*/

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  value numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  probability integer DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  status_id uuid REFERENCES pipeline_statuses(id),
  client_id uuid REFERENCES clients(id),
  owner_id uuid REFERENCES users(id),
  branch_id uuid REFERENCES branches(id),
  tags text[] DEFAULT '{}',
  notes text,
  history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all deals"
  ON deals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update deals they own"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can update all deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );

CREATE POLICY "Users can delete deals they own"
  ON deals
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can delete all deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );