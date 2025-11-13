-- Update Kaka ND's role to admin
UPDATE users 
SET role = 'admin'
WHERE email = 'ndkaka04@gmail.com';

-- Verify the update
SELECT id, email, username, role, updated_at 
FROM users 
WHERE email = 'ndkaka04@gmail.com';