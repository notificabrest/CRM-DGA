-- Drop duplicate policies
DROP POLICY IF EXISTS "Users can read branches" ON public.branches;

-- Insert sample branch
INSERT INTO public.branches (
  name,
  address,
  phone,
  status
) VALUES (
  'Matriz São Paulo',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  '11999999999',
  'ACTIVE'
) ON CONFLICT DO NOTHING;

-- Insert sample client
INSERT INTO public.clients (
  name,
  email,
  company,
  position,
  department,
  status,
  tags
) VALUES (
  'João Silva',
  'joao.silva@example.com',
  'Empresa ABC',
  'Diretor',
  'TI',
  'ACTIVE',
  ARRAY['VIP', 'Novo Cliente']
) ON CONFLICT DO NOTHING;

-- Insert sample client phone
INSERT INTO public.client_phones (
  client_id,
  type,
  number,
  is_primary
) VALUES (
  (SELECT id FROM public.clients WHERE email = 'joao.silva@example.com'),
  'MAIN',
  '11988887777',
  true
) ON CONFLICT DO NOTHING;

-- Insert sample client observation
INSERT INTO public.client_observations (
  client_id,
  user_id,
  text
) VALUES (
  (SELECT id FROM public.clients WHERE email = 'joao.silva@example.com'),
  (SELECT id FROM public.users WHERE email = 'admin@brestelecom.com.br'),
  'Primeiro contato realizado. Cliente interessado em nossos serviços.'
) ON CONFLICT DO NOTHING;

-- Insert sample pipeline statuses
INSERT INTO public.pipeline_statuses (
  name,
  color,
  order_index,
  is_default
) VALUES 
  ('Novo Lead', '#3B82F6', 0, true),
  ('Contato Inicial', '#8B5CF6', 1, true),
  ('Qualificação', '#EC4899', 2, true),
  ('Proposta', '#F97316', 3, true),
  ('Negociação', '#FBBF24', 4, true),
  ('Fechado Ganho', '#10B981', 5, true),
  ('Fechado Perdido', '#EF4444', 6, true)
ON CONFLICT DO NOTHING;

-- Insert sample deal
INSERT INTO public.deals (
  client_id,
  title,
  value,
  probability,
  status_id,
  owner_id
) VALUES (
  (SELECT id FROM public.clients WHERE email = 'joao.silva@example.com'),
  'Projeto Infraestrutura',
  50000.00,
  0.7,
  (SELECT id FROM public.pipeline_statuses WHERE name = 'Proposta'),
  (SELECT id FROM public.users WHERE email = 'jonny@brestelecom.com.br')
) ON CONFLICT DO NOTHING;

-- Insert sample deal history
INSERT INTO public.deal_history (
  deal_id,
  from_status_id,
  to_status_id,
  changed_by_id,
  notes
) VALUES (
  (SELECT id FROM public.deals WHERE title = 'Projeto Infraestrutura'),
  (SELECT id FROM public.pipeline_statuses WHERE name = 'Novo Lead'),
  (SELECT id FROM public.pipeline_statuses WHERE name = 'Proposta'),
  (SELECT id FROM public.users WHERE email = 'jonny@brestelecom.com.br'),
  'Proposta enviada ao cliente'
) ON CONFLICT DO NOTHING;

-- Insert sample calendar event
INSERT INTO public.calendar_events (
  title,
  description,
  type,
  priority,
  status,
  start_date,
  end_date,
  location,
  owner_id,
  client_id
) VALUES (
  'Reunião de Apresentação',
  'Apresentação inicial dos serviços',
  'MEETING',
  'HIGH',
  'PENDING',
  now() + interval '1 day',
  now() + interval '1 day' + interval '2 hours',
  'Online - Google Meet',
  (SELECT id FROM public.users WHERE email = 'jonny@brestelecom.com.br'),
  (SELECT id FROM public.clients WHERE email = 'joao.silva@example.com')
) ON CONFLICT DO NOTHING;