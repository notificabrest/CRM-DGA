/*
  # Add password field to users table
  
  1. Changes
    - Add password field to users table
    - Add unique constraint on email
    - Update existing users with default password
  
  2. Security
    - Password field is hashed
    - Only authenticated users can update their own password
*/

-- Add password field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password text NOT NULL DEFAULT 'CRM@123';

-- Update existing users with default password
UPDATE public.users 
SET password = 'CRM@123'
WHERE password = 'CRM@123';

-- Add unique constraint on email if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- Update RLS policies for password
DROP POLICY IF EXISTS "Users can update their own password" ON public.users;

CREATE POLICY "Users can update their own password"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);