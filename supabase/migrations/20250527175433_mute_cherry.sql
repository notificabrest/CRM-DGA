/*
  # Add default users

  This migration adds the default users that are used in the application:
  - Admin user
  - Director user
  - Manager user
  - Sales users
  - Support user

  All users are created with their respective roles and permissions.
*/

-- Insert default users
INSERT INTO public.users (
  id,
  name,
  email,
  phone,
  role,
  status,
  branch_ids,
  avatar,
  created_at,
  updated_at
)
VALUES
  (
    'usr_admin_001',
    'Admin User',
    'admin@example.com',
    '+5511999999999',
    'ADMIN',
    'ACTIVE',
    ARRAY['1'],
    'https://randomuser.me/api/portraits/men/1.jpg',
    now(),
    now()
  ),
  (
    'usr_director_001',
    'Director User',
    'director@example.com', 
    '+5511888888888',
    'DIRECTOR',
    'ACTIVE',
    ARRAY['1', '2'],
    'https://randomuser.me/api/portraits/women/2.jpg',
    now(),
    now()
  ),
  (
    'usr_manager_001',
    'Manager User',
    'manager@example.com',
    '+5511777777777',
    'MANAGER',
    'ACTIVE',
    ARRAY['1'],
    'https://randomuser.me/api/portraits/men/3.jpg',
    now(),
    now()
  ),
  (
    'usr_sales_001',
    'Jonny Santos',
    'jonny@brestelecom.com.br',
    '+5511666666666',
    'SALESPERSON',
    'ACTIVE',
    ARRAY['1'],
    null,
    now(),
    now()
  ),
  (
    'usr_support_001',
    'Alex Support',
    'suporte@brestelecom.com.br',
    '+5511555555555',
    'ASSISTANT',
    'ACTIVE',
    ARRAY['1'],
    null,
    now(),
    now()
  ),
  (
    'usr_sales_002',
    'Rafael Sales',
    'contato@brestelecom.com.br',
    '+5511444444444',
    'SALESPERSON',
    'ACTIVE',
    ARRAY['1'],
    null,
    now(),
    now()
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  branch_ids = EXCLUDED.branch_ids,
  avatar = EXCLUDED.avatar,
  updated_at = now();