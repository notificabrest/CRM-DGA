/*
  # Create pipeline statuses table

  1. New Tables
    - `pipeline_statuses`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `color` (text, default '#6B7280')
      - `order` (integer, not null)
      - `is_closed` (boolean, default false)
      - `is_won` (boolean, default false)

  2. Security
    - Enable RLS on `pipeline_statuses` table
    - Add policies for authenticated users to read statuses

  3. Initial Data
    - Insert default pipeline statuses
*/

-- Create pipeline_statuses table
CREATE TABLE IF NOT EXISTS pipeline_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  "order" integer NOT NULL,
  is_closed boolean DEFAULT false,
  is_won boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE pipeline_statuses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read pipeline statuses"
  ON pipeline_statuses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage pipeline statuses"
  ON pipeline_statuses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );

-- Insert default pipeline statuses
INSERT INTO pipeline_statuses (name, color, "order", is_closed, is_won) VALUES
  ('Lead', '#3B82F6', 1, false, false),
  ('Qualified', '#8B5CF6', 2, false, false),
  ('Proposal', '#F59E0B', 3, false, false),
  ('Negotiation', '#EF4444', 4, false, false),
  ('Won', '#10B981', 5, true, true),
  ('Lost', '#6B7280', 6, true, false)
ON CONFLICT DO NOTHING;