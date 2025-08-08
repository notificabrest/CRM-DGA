/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `company` (text)
      - `phones` (jsonb array for phone numbers)
      - `address` (text)
      - `notes` (text)
      - `status` (text with check constraint, default 'ACTIVE')
      - `source` (text)
      - `tags` (text array)
      - `owner_id` (uuid, foreign key to users)
      - `branch_id` (uuid, foreign key to branches)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `clients` table
    - Add policies for authenticated users to manage clients
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phones jsonb DEFAULT '[]'::jsonb,
  address text,
  notes text,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  source text,
  tags text[] DEFAULT '{}',
  owner_id uuid REFERENCES users(id),
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients they own"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can update all clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );

CREATE POLICY "Users can delete clients they own"
  ON clients
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can delete all clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );