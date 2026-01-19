-- Make a user an admin
-- Run this in Supabase SQL Editor to grant admin access

-- Replace 'victorrcrispinjr@gmail.com' with the actual admin email
INSERT INTO user_roles (user_id, is_admin)
SELECT id, true 
FROM auth.users 
WHERE email = 'victorrcrispinjr@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET is_admin = true;

-- To add multiple admins, run this for each email:
-- INSERT INTO user_roles (user_id, is_admin)
-- SELECT id, true 
-- FROM auth.users 
-- WHERE email = 'another-admin@example.com'
-- ON CONFLICT (user_id) 
-- DO UPDATE SET is_admin = true;

-- To remove admin access from a user:
-- UPDATE user_roles 
-- SET is_admin = false 
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');

-- To view all admins:
-- SELECT u.email, ur.is_admin, ur.created_at
-- FROM user_roles ur
-- JOIN auth.users u ON u.id = ur.user_id
-- WHERE ur.is_admin = true;
