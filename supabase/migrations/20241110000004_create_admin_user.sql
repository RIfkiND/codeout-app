-- Create or update Kaka ND user with admin role
INSERT INTO users (id, name, email, role, created_at, updated_at)
VALUES (
  'be38b185-f9aa-4de6-a1c2-27bfbaa381fd',
  'Kaka ND',
  'ndkaka04@gmail.com',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  name = 'Kaka ND',
  email = 'ndkaka04@gmail.com',
  updated_at = NOW();

-- Verify the user was created/updated
SELECT id, name, email, role, created_at, updated_at 
FROM users 
WHERE id = 'be38b185-f9aa-4de6-a1c2-27bfbaa381fd';