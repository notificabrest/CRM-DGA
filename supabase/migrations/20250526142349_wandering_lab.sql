/*
  # Create Admin User

  1. Create initial admin user
    - Email: admin@brestelecom.com.br
    - Name: System Administrator
    - Role: ADMIN
    - Status: ACTIVE
*/

-- Insert admin user profile data
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  status,
  branch_ids,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'admin@brestelecom.com.br',
  'System Administrator',
  'ADMIN',
  'ACTIVE',
  ARRAY['1'],
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;