/*
  # Create calendar events table

  1. New Tables
    - `calendar_events`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `type` (text with check constraint)
      - `priority` (text with check constraint)
      - `status` (text with check constraint)
      - `start_date` (timestamp with timezone, not null)
      - `end_date` (timestamp with timezone, not null)
      - `all_day` (boolean, default false)
      - `location` (text)
      - `attendees` (text array)
      - `reminder_minutes` (integer, default 15)
      - `owner_id` (uuid, foreign key to users)
      - `client_id` (uuid, foreign key to clients, nullable)
      - `deal_id` (uuid, foreign key to deals, nullable)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `calendar_events` table
    - Add policies for authenticated users to manage their events
*/

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text DEFAULT 'MEETING' CHECK (type IN ('MEETING', 'TASK', 'REMINDER', 'DEAL')),
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  location text,
  attendees text[] DEFAULT '{}',
  reminder_minutes integer DEFAULT 15,
  owner_id uuid REFERENCES users(id),
  client_id uuid REFERENCES clients(id),
  deal_id uuid REFERENCES deals(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own events"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can read events they are attending"
  ON calendar_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = ANY(attendees)
    )
  );

CREATE POLICY "Users can insert their own events"
  ON calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own events"
  ON calendar_events
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own events"
  ON calendar_events
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all events"
  ON calendar_events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('ADMIN', 'DIRECTOR')
    )
  );