/* # Create Real Auth Users and Profiles
This migration creates the actual Supabase auth users and links them to our test data.
Note: Auth users must be created via Supabase Dashboard or Admin API first.
This migration assumes the auth.users records exist and creates the corresponding profile records.

1. Auth Users Created (via Dashboard/Admin API):
- adult@example.com (password: password123) - ID: 00000000-0000-0000-0000-000000000001
- work@example.com (password: password123) - ID: 00000000-0000-0000-0000-000000000002
- parent@example.com (password: password123) - ID: 00000000-0000-0000-0000-000000000003
- teen@example.com (password: password123) - ID: 00000000-0000-0000-0000-000000000004

2. Profile Records Creation
- Links auth.users to our application users table
- Creates user preferences and role assignments
- Preserves all existing test data

Instructions:
1. First, create these 4 users in your Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add user" for each email with password: password123
   - Note down the user IDs that are generated
   - Update the UUIDs in this migration to match the real user IDs

2. Then run this migration to create the profile records
*/

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to safely insert or update user profile
CREATE OR REPLACE FUNCTION create_user_profile(user_id_param UUID, email_param VARCHAR)
RETURNS VOID AS $$
BEGIN
    -- Insert into users table
    INSERT INTO users (id, email, created_at, updated_at) 
    VALUES (user_id_param, email_param, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Create default preferences if not exist
    INSERT INTO user_preferences (
        user_id, 
        wake_time, 
        sleep_time, 
        work_start_time, 
        work_end_time, 
        theme, 
        notifications_enabled,
        created_at,
        updated_at
    ) VALUES (
        user_id_param, 
        '07:00', 
        '22:00', 
        NULL, 
        NULL, 
        'low-stim', 
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert audit log entry
    INSERT INTO audit_log (user_id, action, resource_type, resource_id, details, created_at)
    VALUES (user_id_param, 'CREATE_PROFILE', 'users', user_id_param, 
            json_build_object('email', email_param, 'action', 'User profile created'), NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert or update profiles for all test users
-- Note: Replace these UUIDs with the actual user IDs from your Supabase auth.users table
SELECT create_user_profile('00000000-0000-0000-0000-000000000001', 'adult@example.com');
SELECT create_user_profile('00000000-0000-0000-0000-000000000002', 'work@example.com');
SELECT create_user_profile('00000000-0000-0000-0000-000000000003', 'parent@example.com');
SELECT create_user_profile('00000000-0000-0000-0000-000000000004', 'teen@example.com');

-- Ensure user roles are properly assigned
INSERT INTO user_roles (user_id, role, is_primary, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'adult', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002', 'workplace', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000003', 'parent', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000004', 'teen', true, NOW(), NOW())
ON CONFLICT (user_id, role) DO UPDATE SET 
    is_primary = EXCLUDED.is_primary,
    updated_at = NOW();

-- Update preferences for each user type with their specific settings
UPDATE user_preferences SET 
    wake_time = '07:00',
    sleep_time = '22:00',
    work_start_time = NULL,
    work_end_time = NULL,
    theme = 'low-stim',
    notifications_enabled = true
WHERE user_id = '00000000-0000-0000-0000-000000000001';

UPDATE user_preferences SET 
    wake_time = '06:30',
    sleep_time = '23:00',
    work_start_time = '08:30',
    work_end_time = '17:30',
    theme = 'low-stim',
    notifications_enabled = true
WHERE user_id = '00000000-0000-0000-0000-000000000002';

UPDATE user_preferences SET 
    wake_time = '06:00',
    sleep_time = '22:30',
    work_start_time = NULL,
    work_end_time = NULL,
    theme = 'low-stim',
    notifications_enabled = true
WHERE user_id = '00000000-0000-0000-0000-000000000003';

UPDATE user_preferences SET 
    wake_time = '07:15',
    sleep_time = '22:00',
    work_start_time = NULL,
    work_end_time = NULL,
    theme = 'dark',
    notifications_enabled = true
WHERE user_id = '00000000-0000-0000-0000-000000000004';

-- Clean up the function
DROP FUNCTION IF EXISTS create_user_profile(UUID, VARCHAR);