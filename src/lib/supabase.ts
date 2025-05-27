import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efidzpahjjbnvihwiyxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaWR6cGFoampibnZpaHdpeXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzMzODgsImV4cCI6MjA2MzcwOTM4OH0.nfphXbe1VraBKUGGJ6ydJGKBHWEHo1td8iDBx_D4Is0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to handle database errors
export const handleError = (error: any) => {
  console.error('Database error:', error);
  throw new Error(error.message || 'An error occurred');
};