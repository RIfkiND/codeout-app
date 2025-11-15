-- Add fake challenges and lobbies for Rifki N D
-- User ID: 68665f1e-c2b5-418d-945b-4ab8a04e7d87

-- Insert additional challenges
INSERT INTO challenges (id, title, description, difficulty, time_limit, test_cases, code_template, created_by, created_at, updated_at) VALUES
-- JavaScript challenges
('550e8400-e29b-41d4-a716-446655440001', 'Array Sum', 'Calculate the sum of all elements in an array', 'easy', 30, 
'[{"input": "[1, 2, 3, 4, 5]", "expected_output": "15", "explanation": "Sum of 1+2+3+4+5 = 15"}, {"input": "[10, -5, 3]", "expected_output": "8", "explanation": "Sum of 10+(-5)+3 = 8"}]'::jsonb,
'{"javascript": "function arraySum(arr) {\n  // Your code here\n  return 0;\n}", "python": "def array_sum(arr):\n    # Your code here\n    return 0", "java": "public static int arraySum(int[] arr) {\n    // Your code here\n    return 0;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440002', 'Palindrome Check', 'Check if a given string is a palindrome', 'easy', 25,
'[{"input": "\"racecar\"", "expected_output": "true", "explanation": "racecar reads the same forwards and backwards"}, {"input": "\"hello\"", "expected_output": "false", "explanation": "hello is not a palindrome"}]'::jsonb,
'{"javascript": "function isPalindrome(str) {\n  // Your code here\n  return false;\n}", "python": "def is_palindrome(s):\n    # Your code here\n    return False", "java": "public static boolean isPalindrome(String str) {\n    // Your code here\n    return false;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440003', 'Find Maximum', 'Find the maximum number in an array', 'easy', 20,
'[{"input": "[3, 7, 2, 9, 1]", "expected_output": "9", "explanation": "9 is the largest number in the array"}, {"input": "[-1, -5, -2]", "expected_output": "-1", "explanation": "-1 is the largest among negative numbers"}]'::jsonb,
'{"javascript": "function findMax(arr) {\n  // Your code here\n  return 0;\n}", "python": "def find_max(arr):\n    # Your code here\n    return 0", "java": "public static int findMax(int[] arr) {\n    // Your code here\n    return 0;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440004', 'Reverse String', 'Reverse a given string', 'easy', 15,
'[{"input": "\"hello\"", "expected_output": "\"olleh\"", "explanation": "Reverse of hello is olleh"}, {"input": "\"world\"", "expected_output": "\"dlrow\"", "explanation": "Reverse of world is dlrow"}]'::jsonb,
'{"javascript": "function reverseString(str) {\n  // Your code here\n  return \"\";\n}", "python": "def reverse_string(s):\n    # Your code here\n    return \"\"", "java": "public static String reverseString(String str) {\n    // Your code here\n    return \"\";\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440005', 'Count Vowels', 'Count the number of vowels in a string', 'easy', 25,
'[{"input": "\"hello world\"", "expected_output": "3", "explanation": "e, o, o are vowels"}, {"input": "\"programming\"", "expected_output": "3", "explanation": "o, a, i are vowels"}]'::jsonb,
'{"javascript": "function countVowels(str) {\n  // Your code here\n  return 0;\n}", "python": "def count_vowels(s):\n    # Your code here\n    return 0", "java": "public static int countVowels(String str) {\n    // Your code here\n    return 0;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

-- Medium difficulty challenges
('550e8400-e29b-41d4-a716-446655440006', 'Binary Search', 'Implement binary search algorithm', 'medium', 45,
'[{"input": "[1, 3, 5, 7, 9], 5", "expected_output": "2", "explanation": "5 is at index 2"}, {"input": "[1, 2, 3, 4], 6", "expected_output": "-1", "explanation": "6 is not found"}]'::jsonb,
'{"javascript": "function binarySearch(arr, target) {\n  // Your code here\n  return -1;\n}", "python": "def binary_search(arr, target):\n    # Your code here\n    return -1", "java": "public static int binarySearch(int[] arr, int target) {\n    // Your code here\n    return -1;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440007', 'Valid Parentheses', 'Check if parentheses are valid and balanced', 'medium', 40,
'[{"input": "\"()[]{}\"", "expected_output": "true", "explanation": "All parentheses are properly matched"}, {"input": "\"([)]\"", "expected_output": "false", "explanation": "Parentheses are not properly nested"}]'::jsonb,
'{"javascript": "function isValidParentheses(s) {\n  // Your code here\n  return false;\n}", "python": "def is_valid_parentheses(s):\n    # Your code here\n    return False", "java": "public static boolean isValidParentheses(String s) {\n    // Your code here\n    return false;\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW()),

('550e8400-e29b-41d4-a716-446655440008', 'Merge Sorted Arrays', 'Merge two sorted arrays into one sorted array', 'medium', 35,
'[{"input": "[1, 3, 5], [2, 4, 6]", "expected_output": "[1, 2, 3, 4, 5, 6]", "explanation": "Merge and sort both arrays"}, {"input": "[1], [2, 3]", "expected_output": "[1, 2, 3]", "explanation": "Merge single element with array"}]'::jsonb,
'{"javascript": "function mergeSortedArrays(arr1, arr2) {\n  // Your code here\n  return [];\n}", "python": "def merge_sorted_arrays(arr1, arr2):\n    # Your code here\n    return []", "java": "public static int[] mergeSortedArrays(int[] arr1, int[] arr2) {\n    // Your code here\n    return new int[0];\n}"}',
'68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW(), NOW());

-- Insert lobbies for Rifki
INSERT INTO lobbies (id, name, description, status, max_participants, time_limit_minutes, is_private, created_by, created_at, updated_at) VALUES
-- Active lobby
('660e8400-e29b-41d4-a716-446655440001', 'Rifki''s Coding Challenge', 'Practice session for algorithm problems', 'waiting', 8, 60, false, '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '2 hours', NOW()),

-- Running lobby
('660e8400-e29b-41d4-a716-446655440002', 'JavaScript Mastery', 'Advanced JavaScript problem solving', 'running', 6, 45, false, '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '1 day', NOW() - INTERVAL '30 minutes'),

-- Finished lobby
('660e8400-e29b-41d4-a716-446655440003', 'Weekend Warriors', 'Weekend coding competition', 'finished', 10, 90, false, '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),

-- Private lobby
('660e8400-e29b-41d4-a716-446655440004', 'Study Group', 'Private study session with friends', 'waiting', 4, 30, true, '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '1 hour', NOW()),

-- Multi-challenge lobby
('660e8400-e29b-41d4-a716-446655440005', 'Algorithm Sprint', 'Multiple challenges in sequence', 'waiting', 12, 120, false, '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '30 minutes', NOW());

-- Insert lobby users (Rifki joins his own lobbies and some fake participants)
INSERT INTO lobby_users (id, lobby_id, user_id, joined_at) VALUES
-- Rifki joins his lobbies
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '2 hours'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '1 day'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '3 days'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '1 hour'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440005', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', NOW() - INTERVAL '30 minutes');

-- Insert lobby challenges (multi-challenge setup)
INSERT INTO lobby_challenges (id, lobby_id, challenge_id, order_index, created_at) VALUES
-- Algorithm Sprint lobby has multiple challenges
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 1, NOW() - INTERVAL '30 minutes'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 2, NOW() - INTERVAL '30 minutes'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 3, NOW() - INTERVAL '30 minutes'),

-- JavaScript Mastery lobby
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 1, NOW() - INTERVAL '1 day'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 2, NOW() - INTERVAL '1 day'),

-- Coding Challenge lobby
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 1, NOW() - INTERVAL '2 hours'),

-- Weekend Warriors lobby
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 1, NOW() - INTERVAL '3 days'),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 2, NOW() - INTERVAL '3 days'),

-- Study Group lobby
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 1, NOW() - INTERVAL '1 hour');

-- Insert some sample submissions for completed lobbies
INSERT INTO submissions (id, user_id, challenge_id, lobby_id, language, code, is_correct, score, test_cases_passed, total_test_cases, execution_time, memory_usage, submitted_at) VALUES
-- Rifki's submissions from finished lobby
('990e8400-e29b-41d4-a716-446655440001', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'javascript', 
'function countVowels(str) {\n  const vowels = "aeiouAEIOU";\n  let count = 0;\n  for (let char of str) {\n    if (vowels.includes(char)) count++;\n  }\n  return count;\n}', 
true, 100, 2, 2, 45, 1024, NOW() - INTERVAL '2 days'),

('990e8400-e29b-41d4-a716-446655440002', '68665f1e-c2b5-418d-945b-4ab8a04e7d87', '550e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'javascript',
'function mergeSortedArrays(arr1, arr2) {\n  return [...arr1, ...arr2].sort((a, b) => a - b);\n}',
true, 85, 2, 2, 32, 2048, NOW() - INTERVAL '2 days');

-- Update lobby timestamps for more realistic data
UPDATE lobbies SET 
  started_at = created_at + INTERVAL '1 hour',
  ended_at = created_at + INTERVAL '3 hours'
WHERE status = 'finished';

UPDATE lobbies SET 
  started_at = created_at + INTERVAL '2 hours'
WHERE status = 'running';

-- Add some lobby statistics
INSERT INTO lobby_statistics (id, lobby_id, total_participants, total_submissions, average_score, completion_rate, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 1, 2, 92.5, 100.0, NOW() - INTERVAL '1 day'),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1, 1, 75.0, 50.0, NOW() - INTERVAL '30 minutes');