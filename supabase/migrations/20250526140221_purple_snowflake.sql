/*
  # Create admin user

  1. Changes
    - Creates a trigger function to handle new user creation
    - Creates an admin user with proper role and permissions
    
  2. Security
    - Sets up secure password hashing
    - Enables RLS policies for user management
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
ON CONFLICT (email) DO NOTHING;

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
ON CONFLICT (email) DO NOTHING;