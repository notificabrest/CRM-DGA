/*
  # Add password field to users table

  1. Changes
    - Add password field to users table
    - Set default password for existing users
    - Add policy for password updates
*/

-- First, add the password column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN password text NOT NULL DEFAULT 'CRM@123';
  END IF;
END $$;

-- Create policy for password updates if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own password'
  ) THEN
    CREATE POLICY "Users can update their own password"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Update existing users with role-based default passwords
UPDATE public.users
SET password = CASE 
  WHEN role = 'ADMIN' THEN 'admin123'
  WHEN role = 'DIRECTOR' THEN 'director123'
  WHEN role = 'MANAGER' THEN 'manager123'
  WHEN role = 'SALESPERSON' THEN 'sales123'
  WHEN role = 'ASSISTANT' THEN 'assistant123'
  ELSE 'CRM@123'
END
WHERE password = 'CRM@123';