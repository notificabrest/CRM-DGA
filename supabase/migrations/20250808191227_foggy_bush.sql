/*
  # Create branches table

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `manager_id` (uuid, foreign key to users)
      - `status` (text with check constraint, default 'ACTIVE')
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `branches` table
    - Add policies for authenticated users to read branches
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  manager_id uuid REFERENCES users(id),
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read branches"
  ON branches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can update branches"
  ON branches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR', 'MANAGER')
    )
  );