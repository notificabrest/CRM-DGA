/*
  # Schema Completo CRM-DGA v1.4.5

  1. Tabelas Principais
    - `users` - Usuários do sistema com autenticação
    - `branches` - Filiais/escritórios
    - `clients` - Clientes e contatos
    - `client_phones` - Telefones dos clientes
    - `client_observations` - Observações dos clientes
    - `pipeline_statuses` - Status do pipeline de vendas
    - `deals` - Negócios/oportunidades
    - `deal_history` - Histórico de mudanças nos negócios
    - `calendar_events` - Eventos e tarefas do calendário
    - `user_data` - Dados de configuração dos usuários

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em usuário autenticado
    - Triggers para updated_at automático

  3. Funcionalidades
    - Suporte completo a CRUD
    - Relacionamentos com foreign keys
    - Índices para performance
    - Validações via constraints
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'DIRECTOR', 'MANAGER', 'SALESPERSON', 'ASSISTANT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE branch_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phone_type AS ENUM ('MAIN', 'MOBILE', 'WHATSAPP', 'WORK', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('MEETING', 'TASK', 'REMINDER', 'DEAL', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, status, password, pass)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'SALESPERSON',
        'ACTIVE',
        'CRM@123',
        'CRM@123'
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role user_role NOT NULL DEFAULT 'SALESPERSON',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    phone text,
    avatar text,
    branch_ids text[] DEFAULT '{}',
    password text NOT NULL DEFAULT 'CRM@123',
    pass text DEFAULT 'CRM@123',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    manager_id uuid REFERENCES users(id),
    status branch_status NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    company text,
    position text,
    department text,
    branch_id uuid REFERENCES branches(id),
    owner_id uuid REFERENCES users(id),
    status client_status NOT NULL DEFAULT 'ACTIVE',
    tags text[] DEFAULT '{}',
    custom_fields jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create client_phones table
CREATE TABLE IF NOT EXISTS client_phones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    type phone_type NOT NULL,
    number text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create client_observations table
CREATE TABLE IF NOT EXISTS client_observations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id),
    text text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create pipeline_statuses table
CREATE TABLE IF NOT EXISTS pipeline_statuses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text NOT NULL,
    order_index integer NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id),
    title text NOT NULL,
    value numeric NOT NULL,
    probability numeric NOT NULL CHECK (probability >= 0 AND probability <= 1),
    status_id uuid REFERENCES pipeline_statuses(id),
    owner_id uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create deal_history table
CREATE TABLE IF NOT EXISTS deal_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
    from_status_id uuid REFERENCES pipeline_statuses(id),
    to_status_id uuid REFERENCES pipeline_statuses(id),
    changed_by_id uuid REFERENCES users(id),
    notes text,
    changed_at timestamptz DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    type event_type NOT NULL,
    priority event_priority NOT NULL,
    status event_status NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    all_day boolean DEFAULT false,
    location text,
    attendees uuid[] DEFAULT '{}',
    client_id uuid REFERENCES clients(id),
    deal_id uuid REFERENCES deals(id),
    owner_id uuid REFERENCES users(id),
    reminder_minutes integer,
    recurrence jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_data table for user preferences
CREATE TABLE IF NOT EXISTS user_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    data jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_client_phones_number ON client_phones(number);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can update their own password" ON users
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create RLS Policies for branches table
CREATE POLICY "Users can read branches" ON branches
    FOR SELECT TO authenticated USING (true);

-- Create RLS Policies for clients table
CREATE POLICY "Users can read clients" ON clients
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert clients" ON clients
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their clients" ON clients
    FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Create RLS Policies for client_phones table
CREATE POLICY "Users can read client phones" ON client_phones
    FOR SELECT TO authenticated USING (true);

-- Create RLS Policies for client_observations table
CREATE POLICY "Users can read client observations" ON client_observations
    FOR SELECT TO authenticated USING (true);

-- Create RLS Policies for pipeline_statuses table
CREATE POLICY "Users can read pipeline statuses" ON pipeline_statuses
    FOR SELECT TO authenticated USING (true);

-- Create RLS Policies for deals table
CREATE POLICY "Users can read deals" ON deals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert deals" ON deals
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their deals" ON deals
    FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Create RLS Policies for deal_history table
CREATE POLICY "Users can read deal history" ON deal_history
    FOR SELECT TO authenticated USING (true);

-- Create RLS Policies for calendar_events table
CREATE POLICY "Users can read calendar events" ON calendar_events
    FOR SELECT TO authenticated USING (owner_id = auth.uid() OR auth.uid() = ANY(attendees));

CREATE POLICY "Users can insert calendar events" ON calendar_events
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their calendar events" ON calendar_events
    FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- Create RLS Policies for user_data table
CREATE POLICY "Users can read their own data" ON user_data
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data" ON user_data
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data" ON user_data
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_client_phones_updated_at BEFORE UPDATE ON client_phones
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_pipeline_statuses_updated_at BEFORE UPDATE ON pipeline_statuses
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_user_data_updated_at BEFORE UPDATE ON user_data
    FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Insert default pipeline statuses
INSERT INTO pipeline_statuses (id, name, color, order_index, is_default) VALUES
    ('1', 'Novo Lead', '#3B82F6', 1, true),
    ('2', 'Qualificado', '#8B5CF6', 2, false),
    ('3', 'Proposta', '#F59E0B', 3, false),
    ('4', 'Negociação', '#EF4444', 4, false),
    ('5', 'Fechado Ganho', '#10B981', 5, false),
    ('6', 'Fechado Perdido', '#6B7280', 6, false)
ON CONFLICT (id) DO NOTHING;

-- Insert default branch
INSERT INTO branches (id, name, address, phone, status) VALUES
    (gen_random_uuid(), 'Matriz', 'Rua Principal, 123 - Centro', '(11) 99999-9999', 'ACTIVE')
ON CONFLICT DO NOTHING;