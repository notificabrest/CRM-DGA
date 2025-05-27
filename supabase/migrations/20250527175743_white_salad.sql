/*
  # Add default users

  1. Changes
    - Inserts default users into the users table
    - Includes admin, director, manager, salespeople and support staff
    - Sets proper roles, branches and contact information
    - Handles conflicts by updating existing records

  2. Security
    - No passwords are stored (handled by auth system)
    - Proper role constraints are enforced
*/

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
    gen_random_uuid(),
    'Admin User',
    'admin@brestelecom.com.br',
    '+5511999999999',
    'ADMIN',
    'ACTIVE',
    ARRAY['1'],
    'https://randomuser.me/api/portraits/men/1.jpg',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Director User', 
    'director@brestelecom.com.br',
    '+5511888888888',
    'DIRECTOR',
    'ACTIVE',
    ARRAY['1', '2'],
    'https://randomuser.me/api/portraits/women/2.jpg',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Manager User',
    'manager@brestelecom.com.br',
    '+5511777777777',
    'MANAGER',
    'ACTIVE',
    ARRAY['1'],
    'https://randomuser.me/api/portraits/men/3.jpg',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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