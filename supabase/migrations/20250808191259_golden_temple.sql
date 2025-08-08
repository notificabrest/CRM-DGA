/*
  # Create sample data for testing

  1. Sample Data
    - Create a test user for login
    - Create sample branches
    - Create sample clients
    - Create sample deals

  Note: This migration creates test data. In production, you should create users through the Supabase Auth interface.
*/

-- Insert sample branch
INSERT INTO branches (id, name, address, phone, email, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Main Office', '123 Business St, City, State 12345', '+1-555-0123', 'main@company.com', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Note: For the authentication to work, you need to create a user in Supabase Auth dashboard
-- This SQL will create the user profile, but the auth user must be created separately
-- Example user profile (will be created automatically when auth user signs up):
-- Email: admin@company.com
-- Password: (set in Supabase Auth dashboard)

-- The handle_new_user() function will automatically create a user profile when someone signs up
-- For immediate testing, you can manually insert a user profile if you have the auth.uid():

-- INSERT INTO users (id, email, name, role, status, branch_ids) VALUES
--   ('auth-user-id-here', 'admin@company.com', 'Admin User', 'ADMIN', 'ACTIVE', ARRAY['550e8400-e29b-41d4-a716-446655440000'])
-- ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, name, email, company, phones, address, notes, status, source, owner_id, branch_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john@example.com', 'ABC Corp', '[{"number": "+1-555-0101", "type": "MOBILE", "isPrimary": true}]', '456 Client Ave, City, State 12345', 'Potential high-value client', 'ACTIVE', 'Website', NULL, '550e8400-e29b-41d4-a716-446655440000'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Jane Doe', 'jane@example.com', 'XYZ Ltd', '[{"number": "+1-555-0102", "type": "WORK", "isPrimary": true}]', '789 Business Blvd, City, State 12345', 'Interested in premium services', 'ACTIVE', 'Referral', NULL, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;