/*
  # Add password field and email uniqueness

  1. Changes
    - Add password field to users table
    - Set default password for all users
    - Ensure email uniqueness
    - Update RLS policies for password management

  2. Security
    - Enable password updates only for own user
    - Maintain existing RLS policies
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

-- Then ensure email uniqueness
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