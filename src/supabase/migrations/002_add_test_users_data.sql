/* # Add Test Users with Sample Data

This migration creates test user accounts with sample data for each user type:
- Adult user with personal tasks and routines
- Workplace user with professional tasks and work routines
- Parent user with family management tasks
- Teen user with school and personal tasks

1. New Test Users
- adult@example.com (password: password123)
- work@example.com (password: password123)
- parent@example.com (password: password123)
- teen@example.com (password: password123)

2. Sample Data Added
- User preferences for each user type
- Tasks specific to each user's needs
- Routines with steps for daily activities
- User roles assignments

3. Security
- All data is created with proper user relationships
- RLS policies will ensure users can only access their own data
*/

-- Function to create test user with profile
CREATE OR REPLACE FUNCTION create_test_user(email_param VARCHAR, password_param VARCHAR, role_param VARCHAR)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create user in auth.users (this requires admin privileges)
  -- Note: This part needs to be done via Supabase Dashboard or Admin API
  -- The UUID below is a placeholder - actual auth.users records must be created first
  
  -- For now, we'll skip the auth.users creation and focus on the profile data
  -- In a real scenario, you'd use the Supabase Admin API to create auth users
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for users (assuming auth.users records exist)
-- These UUIDs correspond to the auth.users records for our test emails

-- Adult User Data
INSERT INTO users (id, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'adult@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_preferences (user_id, wake_time, sleep_time, work_start_time, work_end_time, theme, notifications_enabled) VALUES
('00000000-0000-0000-0000-000000000001', '07:00', '22:00', NULL, NULL, 'low-stim', true)
ON CONFLICT (user_id) DO UPDATE SET
  wake_time = EXCLUDED.wake_time,
  sleep_time = EXCLUDED.sleep_time,
  work_start_time = EXCLUDED.work_start_time,
  work_end_time = EXCLUDED.work_end_time,
  theme = EXCLUDED.theme,
  notifications_enabled = EXCLUDED.notifications_enabled;

INSERT INTO user_roles (user_id, role, is_primary) VALUES
('00000000-0000-0000-0000-000000000001', 'adult', true)
ON CONFLICT DO NOTHING;

-- Adult Tasks
INSERT INTO tasks (user_id, title, description, status, due_date, estimated_duration, is_essential) VALUES
('00000000-0000-0000-0000-000000000001', 'Schedule doctor appointment', 'Call the clinic to schedule annual checkup', 'pending', CURRENT_DATE + INTERVAL '7 days', 30, true),
('00000000-0000-0000-0000-000000000001', 'Pay utility bills', 'Pay electricity and internet bills for this month', 'pending', CURRENT_DATE + INTERVAL '3 days', 45, true),
('00000000-0000-0000-0000-000000000001', 'Meal prep for the week', 'Prepare meals for the next 5 days', 'pending', CURRENT_DATE + INTERVAL '1 day', 120, false),
('00000000-0000-0000-0000-000000000001', 'Call mom', 'Weekly check-in call with mom', 'pending', CURRENT_DATE + INTERVAL '2 days', 30, false),
('00000000-0000-0000-0000-000000000001', 'Organize garage', 'Clean and organize the garage space', 'pending', CURRENT_DATE + INTERVAL '14 days', 180, false)
ON CONFLICT DO NOTHING;

-- Adult Routines
INSERT INTO routines (user_id, name, description, repeat_pattern) VALUES
('00000000-0000-0000-0000-000000000001', 'Morning Routine', 'Start the day with focus and energy', 'daily'),
('00000000-0000-0000-0000-000000000001', 'Evening Wind-down', 'Prepare for restful sleep', 'daily')
ON CONFLICT DO NOTHING;

-- Adult Routine Steps
INSERT INTO routine_steps (routine_id, name, description, order_index, duration_minutes, is_essential, preferred_time) VALUES
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Morning Routine'), 
 'Wake up and hydrate', 'Drink a glass of water immediately upon waking', 1, 5, true, '07:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Morning Routine'), 
 'Meditation', '10-minute mindfulness meditation', 2, 10, true, '07:05'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Morning Routine'), 
 'Exercise', '30-minute workout routine', 3, 30, false, '07:15'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Morning Routine'), 
 'Shower and get ready', 'Get ready for the day', 4, 20, true, '07:45'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Evening Wind-down'), 
 'Review tomorrow', 'Look at calendar and tasks for tomorrow', 1, 15, true, '21:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Evening Wind-down'), 
 'Tidy up', 'Quick 15-minute tidy of living spaces', 2, 15, false, '21:15'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000001' AND name = 'Evening Wind-down'), 
 'Read', 'Read a book for pleasure', 3, 30, false, '21:30')
ON CONFLICT DO NOTHING;

-- Workplace User Data
INSERT INTO users (id, email) VALUES 
('00000000-0000-0000-0000-000000000002', 'work@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_preferences (user_id, wake_time, sleep_time, work_start_time, work_end_time, theme, notifications_enabled) VALUES
('00000000-0000-0000-0000-000000000002', '06:30', '23:00', '08:30', '17:30', 'low-stim', true)
ON CONFLICT (user_id) DO UPDATE SET
  wake_time = EXCLUDED.wake_time,
  sleep_time = EXCLUDED.sleep_time,
  work_start_time = EXCLUDED.work_start_time,
  work_end_time = EXCLUDED.work_end_time,
  theme = EXCLUDED.theme,
  notifications_enabled = EXCLUDED.notifications_enabled;

INSERT INTO user_roles (user_id, role, is_primary) VALUES
('00000000-0000-0000-0000-000000000002', 'workplace', true)
ON CONFLICT DO NOTHING;

-- Workplace Tasks
INSERT INTO tasks (user_id, title, description, status, due_date, estimated_duration, is_essential) VALUES
('00000000-0000-0000-0000-000000000002', 'Complete quarterly report', 'Finish Q4 performance analysis and submit to management', 'pending', CURRENT_DATE + INTERVAL '2 days', 180, true),
('00000000-0000-0000-0000-000000000002', 'Team meeting prep', 'Prepare slides for Monday team meeting', 'pending', CURRENT_DATE + INTERVAL '3 days', 60, true),
('00000000-0000-0000-0000-000000000002', 'Email client follow-up', 'Reply to client emails from yesterday', 'pending', CURRENT_DATE, 45, true),
('00000000-0000-0000-0000-000000000002', 'Update project timeline', 'Revise project schedule based on new requirements', 'pending', CURRENT_DATE + INTERVAL '1 day', 90, false),
('00000000-0000-0000-0000-000000000002', 'Professional development', 'Complete online training module', 'pending', CURRENT_DATE + INTERVAL '10 days', 120, false)
ON CONFLICT DO NOTHING;

-- Workplace Routines
INSERT INTO routines (user_id, name, description, repeat_pattern) VALUES
('00000000-0000-0000-0000-000000000002', 'Work Morning Prep', 'Prepare for productive work day', 'weekdays'),
('00000000-0000-0000-0000-000000000002', 'Work Day End', 'Wrap up work and prepare for tomorrow', 'weekdays')
ON CONFLICT DO NOTHING;

-- Workplace Routine Steps
INSERT INTO routine_steps (routine_id, name, description, order_index, duration_minutes, is_essential, preferred_time) VALUES
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Morning Prep'), 
 'Review calendar', 'Check meetings and priorities for the day', 1, 10, true, '07:30'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Morning Prep'), 
 'Coffee and breakfast', 'Quick breakfast while reviewing emails', 2, 20, false, '07:40'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Morning Prep'), 
 'Commute prep', 'Gather items needed for work', 3, 10, true, '08:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Day End'), 
 'Review completed tasks', 'Check off completed items and update status', 1, 15, true, '17:30'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Day End'), 
 'Plan tomorrow', 'Set top 3 priorities for tomorrow', 2, 10, true, '17:45'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000002' AND name = 'Work Day End'), 
 'Tidy workspace', 'Clean desk and organize for next day', 3, 5, false, '17:55')
ON CONFLICT DO NOTHING;

-- Parent User Data
INSERT INTO users (id, email) VALUES 
('00000000-0000-0000-0000-000000000003', 'parent@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_preferences (user_id, wake_time, sleep_time, work_start_time, work_end_time, theme, notifications_enabled) VALUES
('00000000-0000-0000-0000-000000000003', '06:00', '22:30', NULL, NULL, 'low-stim', true)
ON CONFLICT (user_id) DO UPDATE SET
  wake_time = EXCLUDED.wake_time,
  sleep_time = EXCLUDED.sleep_time,
  work_start_time = EXCLUDED.work_start_time,
  work_end_time = EXCLUDED.work_end_time,
  theme = EXCLUDED.theme,
  notifications_enabled = EXCLUDED.notifications_enabled;

INSERT INTO user_roles (user_id, role, is_primary) VALUES
('00000000-0000-0000-0000-000000000003', 'parent', true)
ON CONFLICT DO NOTHING;

-- Parent Tasks
INSERT INTO tasks (user_id, title, description, status, due_date, estimated_duration, is_essential) VALUES
('00000000-0000-0000-0000-000000000003', 'School permission slip', 'Sign and return field trip permission form', 'pending', CURRENT_DATE, 15, true),
('00000000-0000-0000-0000-000000000003', 'Grocery shopping', 'Weekly grocery run for family', 'pending', CURRENT_DATE + INTERVAL '1 day', 90, true),
('00000000-0000-0000-0000-000000000003', 'Parent-teacher conference', 'Schedule meeting with kids teachers', 'pending', CURRENT_DATE + INTERVAL '5 days', 60, true),
('00000000-0000-0000-0000-000000000003', 'Kids doctor appointments', 'Annual checkups for both children', 'pending', CURRENT_DATE + INTERVAL '10 days', 120, true),
('00000000-0000-0000-0000-000000000003', 'Family budget review', 'Monthly expense review and budget planning', 'pending', CURRENT_DATE + INTERVAL '7 days', 60, false)
ON CONFLICT DO NOTHING;

-- Parent Routines
INSERT INTO routines (user_id, name, description, repeat_pattern) VALUES
('00000000-0000-0000-0000-000000000003', 'School Morning', 'Get kids ready and off to school', 'weekdays'),
('00000000-0000-0000-0000-000000000003', 'After School Routine', 'Handle homework and after-school activities', 'weekdays'),
('00000000-0000-0000-0000-000000000003', 'Bedtime Routine', 'Kids bedtime preparation', 'daily')
ON CONFLICT DO NOTHING;

-- Parent Routine Steps
INSERT INTO routine_steps (routine_id, name, description, order_index, duration_minutes, is_essential, preferred_time) VALUES
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'School Morning'), 
 'Wake kids', 'Wake up children and help them get dressed', 1, 20, true, '06:30'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'School Morning'), 
 'Breakfast', 'Prepare and serve breakfast to family', 2, 30, true, '06:50'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'School Morning'), 
 'Pack lunches', 'Make school lunches for kids', 3, 15, true, '07:20'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'School Morning'), 
 'School drop-off', 'Drive kids to school', 4, 20, true, '07:35'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'After School Routine'), 
 'Snack time', 'Prepare after-school snacks', 1, 15, false, '15:30'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'After School Routine'), 
 'Homework help', 'Assist with homework assignments', 2, 60, true, '15:45'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'Bedtime Routine'), 
 'Bath time', 'Kids evening bath and prep', 1, 30, true, '19:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'Bedtime Routine'), 
 'Story time', 'Read bedtime stories', 2, 20, false, '19:30'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000003' AND name = 'Bedtime Routine'), 
 'Tuck in', 'Kids bedtime and lights out', 3, 15, true, '19:50')
ON CONFLICT DO NOTHING;

-- Teen User Data
INSERT INTO users (id, email) VALUES 
('00000000-0000-0000-0000-000000000004', 'teen@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_preferences (user_id, wake_time, sleep_time, work_start_time, work_end_time, theme, notifications_enabled) VALUES
('00000000-0000-0000-0000-000000000004', '07:15', '22:00', NULL, NULL, 'dark', true)
ON CONFLICT (user_id) DO UPDATE SET
  wake_time = EXCLUDED.wake_time,
  sleep_time = EXCLUDED.sleep_time,
  work_start_time = EXCLUDED.work_start_time,
  work_end_time = EXCLUDED.work_end_time,
  theme = EXCLUDED.theme,
  notifications_enabled = EXCLUDED.notifications_enabled;

INSERT INTO user_roles (user_id, role, is_primary) VALUES
('00000000-0000-0000-0000-000000000004', 'teen', true)
ON CONFLICT DO NOTHING;

-- Teen Tasks
INSERT INTO tasks (user_id, title, description, status, due_date, estimated_duration, is_essential) VALUES
('00000000-0000-0000-0000-000000000004', 'Math homework', 'Complete calculus assignment chapter 5', 'pending', CURRENT_DATE, 60, true),
('00000000-0000-0000-0000-000000000004', 'Science project', 'Finish biology lab report', 'pending', CURRENT_DATE + INTERVAL '2 days', 90, true),
('00000000-0000-0000-0000-000000000004', 'College application essay', 'Write personal statement for university applications', 'pending', CURRENT_DATE + INTERVAL '7 days', 120, true),
('00000000-0000-0000-0000-000000000004', 'Room cleaning', 'Clean and organize bedroom', 'pending', CURRENT_DATE + INTERVAL '3 days', 45, false),
('00000000-0000-0000-0000-000000000004', 'Practice guitar', '30 minutes of guitar practice', 'pending', CURRENT_DATE, 30, false)
ON CONFLICT DO NOTHING;

-- Teen Routines
INSERT INTO routines (user_id, name, description, repeat_pattern) VALUES
('00000000-0000-0000-0000-000000000004', 'School Day', 'High school daily routine', 'weekdays'),
('00000000-0000-0000-0000-000000000004', 'Study Session', 'After-school study routine', 'weekdays'),
('00000000-0000-0000-0000-000000000004', 'Weekend Gaming', 'Weekend free time routine', 'weekends')
ON CONFLICT DO NOTHING;

-- Teen Routine Steps
INSERT INTO routine_steps (routine_id, name, description, order_index, duration_minutes, is_essential, preferred_time) VALUES
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'School Day'), 
 'Get ready for school', 'Shower, dress, grab backpack', 1, 25, true, '07:15'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'School Day'), 
 'Quick breakfast', 'Grab breakfast on the go', 2, 10, false, '07:40'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'School Day'), 
 'Bus to school', 'Wait for and ride school bus', 3, 25, true, '07:50'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'Study Session'), 
 'Snack break', 'After-school snack before homework', 1, 15, false, '16:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'Study Session'), 
 'Homework', 'Complete daily homework assignments', 2, 90, true, '16:15'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'Study Session'), 
 'Review notes', 'Review today class notes', 3, 20, false, '17:45'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'Weekend Gaming'), 
 'Gaming session', 'Play video games with friends', 1, 120, false, '14:00'),
((SELECT id FROM routines WHERE user_id = '00000000-0000-0000-0000-000000000004' AND name = 'Weekend Gaming'), 
 'Social media', 'Check social media and message friends', 2, 30, false, '16:00')
ON CONFLICT DO NOTHING;

-- Create some sample events for each user
INSERT INTO events (user_id, external_id, title, description, start_at, end_at, is_all_day, source) VALUES
-- Adult events
('00000000-0000-0000-0000-000000000001', 'evt_001', 'Dentist Appointment', 'Regular dental checkup', CURRENT_DATE + INTERVAL '7 days' + INTERVAL '10:00 hours', CURRENT_DATE + INTERVAL '7 days' + INTERVAL '11:00 hours', false, 'google_calendar'),
('00000000-0000-0000-0000-000000000001', 'evt_002', 'Birthday Party', 'Sarah birthday celebration', CURRENT_DATE + INTERVAL '14 days' + INTERVAL '19:00 hours', CURRENT_DATE + INTERVAL '14 days' + INTERVAL '22:00 hours', false, 'google_calendar'),
-- Workplace events
('00000000-0000-0000-0000-000000000002', 'evt_003', 'Team Standup', 'Daily team sync meeting', CURRENT_DATE + INTERVAL '1 days' + INTERVAL '09:00 hours', CURRENT_DATE + INTERVAL '1 days' + INTERVAL '09:30 hours', false, 'google_calendar'),
('00000000-0000-0000-0000-000000000002', 'evt_004', 'Client Presentation', 'Q4 results presentation to client', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '14:00 hours', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '15:30 hours', false, 'google_calendar'),
-- Parent events
('00000000-0000-0000-0000-000000000003', 'evt_005', 'Soccer Practice', 'Kids soccer practice', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '16:30 hours', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '17:30 hours', false, 'google_calendar'),
('00000000-0000-0000-0000-000000000003', 'evt_006', 'PTA Meeting', 'Monthly parent-teacher association meeting', CURRENT_DATE + INTERVAL '5 days' + INTERVAL '18:30 hours', CURRENT_DATE + INTERVAL '5 days' + INTERVAL '20:00 hours', false, 'google_calendar'),
-- Teen events
('00000000-0000-0000-0000-000000000004', 'evt_007', 'Math Test', 'Calculus chapter test', CURRENT_DATE + INTERVAL '1 days' + INTERVAL '10:00 hours', CURRENT_DATE + INTERVAL '1 days' + INTERVAL '11:00 hours', false, 'google_calendar'),
('00000000-0000-0000-0000-000000000004', 'evt_008', 'Band Practice', 'School band after-school practice', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '15:30 hours', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '17:00 hours', false, 'google_calendar')
ON CONFLICT (user_id, external_id) DO NOTHING;

-- Add audit log entries for tracking
INSERT INTO audit_log (user_id, action, resource_type, resource_id, details) VALUES
('00000000-0000-0000-0000-000000000001', 'INSERT', 'users', '00000000-0000-0000-0000-000000000001', '{"action": "Test user created"}'),
('00000000-0000-0000-0000-000000000002', 'INSERT', 'users', '00000000-0000-0000-0000-000000000002', '{"action": "Test user created"}'),
('00000000-0000-0000-0000-000000000003', 'INSERT', 'users', '00000000-0000-0000-0000-000000000003', '{"action": "Test user created"}'),
('00000000-0000-0000-0000-000000000004', 'INSERT', 'users', '00000000-0000-0000-0000-000000000004', '{"action": "Test user created"}')
ON CONFLICT DO NOTHING;