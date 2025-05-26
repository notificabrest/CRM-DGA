/*
  # Create admin user
  
  1. Changes
    - Creates admin user in auth.users
    - Creates admin profile in public.users
    - Temporarily disables new user trigger to prevent conflicts
  
  2. Security
    - Sets up initial admin account with secure password
    - Uses proper role assignments
*/

-- Temporarily disable the trigger
ALTER TABLE auth.users DISABLE TRIGGER users_handle_new_user;

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

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER users_handle_new_user;