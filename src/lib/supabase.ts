import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Configurações do Supabase
const SUPABASE_URL = 'https://efidzpahjjbnvihwiyxz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaWR6cGFoampibnZpaHdpeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzMzODgsImV4cCI6MjA2MzcwOTM4OH0.nfphXbe1VraBKUGGJ6ydJGKBHWEHo1td8iDBx_D4Is0';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);