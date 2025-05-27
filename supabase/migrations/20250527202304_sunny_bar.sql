/*
  # Add password field to users table
  
  1. Changes
    - Add PASS column to users table with default value
    - Add policy for password updates
*/

-- Add PASS column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'PASS'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN "PASS" text DEFAULT 'CRM@123'::text;
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