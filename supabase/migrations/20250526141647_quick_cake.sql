/*
  # Create admin user

  1. New Records
    - Creates admin user in public.users table
    
  2. Security
    - No special permissions required
    - Works within standard access controls
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