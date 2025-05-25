/*
  # Add core data tables

  1. New Tables
    - `deals` - Store deal information
    - `deal_history` - Track deal status changes
    - `calendar_events` - Store calendar events
    - `branches` - Store branch information
    - `pipeline_statuses` - Store pipeline status configurations
    - `clients` - Store client information
    - `client_phones` - Store client phone numbers
    - `client_observations` - Store client observations/notes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create pipeline_statuses table
CREATE TABLE IF NOT EXISTS public.pipeline_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  order_index integer NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pipeline_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read pipeline statuses"
  ON public.pipeline_statuses
  FOR SELECT
  TO authenticated
  USING (true);

-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  manager_id uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read branches"
  ON public.branches
  FOR SELECT
  TO authenticated
  USING (true);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  position text,
  department text,
  branch_id uuid REFERENCES public.branches(id),
  owner_id uuid REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create client_phones table
CREATE TABLE IF NOT EXISTS public.client_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('MAIN', 'MOBILE', 'WHATSAPP', 'WORK', 'OTHER')),
  number text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.client_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read client phones"
  ON public.client_phones
  FOR SELECT
  TO authenticated
  USING (true);

-- Create client_observations table
CREATE TABLE IF NOT EXISTS public.client_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.client_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read client observations"
  ON public.client_observations
  FOR SELECT
  TO authenticated
  USING (true);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id),
  title text NOT NULL,
  value numeric NOT NULL,
  probability numeric NOT NULL CHECK (probability >= 0 AND probability <= 1),
  status_id uuid REFERENCES public.pipeline_statuses(id),
  owner_id uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read deals"
  ON public.deals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert deals"
  ON public.deals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their deals"
  ON public.deals
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Create deal_history table
CREATE TABLE IF NOT EXISTS public.deal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
  from_status_id uuid REFERENCES public.pipeline_statuses(id),
  to_status_id uuid REFERENCES public.pipeline_statuses(id),
  changed_by_id uuid REFERENCES public.users(id),
  notes text,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read deal history"
  ON public.deal_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('MEETING', 'TASK', 'REMINDER', 'DEAL', 'OTHER')),
  priority text NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status text NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  location text,
  attendees uuid[] DEFAULT '{}',
  client_id uuid REFERENCES public.clients(id),
  deal_id uuid REFERENCES public.deals(id),
  owner_id uuid REFERENCES public.users(id),
  reminder_minutes integer,
  recurrence jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read calendar events"
  ON public.calendar_events
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR auth.uid() = ANY(attendees));

CREATE POLICY "Users can insert calendar events"
  ON public.calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their calendar events"
  ON public.calendar_events
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_client_phones_number ON public.client_phones(number);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(start_date, end_date);