/*
  # Create initial admin user

  1. Changes
    - Creates admin user in auth.users table
    - Creates corresponding user profile in public.users table
    - Sets up proper role and permissions

  2. Security
    - Creates a secure admin account
    - Sets appropriate role and status
*/

-- Create admin user with proper role
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@brestelecom.com.br',
  crypt('admin@123', gen_salt('bf')),
  now(),
  now(),
  now()
)
ON CONFLICT DO NOTHING;

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
SELECT 
  id,
  email,
  'System Administrator',
  'ADMIN',
  'ACTIVE',
  ARRAY['1'],
  created_at,
  updated_at
FROM auth.users
WHERE email = 'admin@brestelecom.com.br'
ON CONFLICT DO NOTHING;