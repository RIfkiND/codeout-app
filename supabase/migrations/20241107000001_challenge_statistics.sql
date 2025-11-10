-- Add realistic statistics to existing challenges
-- This migration updates challenge statistics with realistic data

-- First, add the category column if it doesn't exist (safe operation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'challenges' AND column_name = 'category') THEN
        ALTER TABLE public.challenges ADD COLUMN category TEXT;
    END IF;
END $$;

-- Update Two Sum challenge
UPDATE public.challenges 
SET 
    view_count = 2847,
    attempt_count = 1923,
    success_rate = 67.0,
    tags = ARRAY['array', 'hash-table', 'two-pointers'],
    category = 'algorithms'
WHERE title = 'Two Sum';

-- Update Valid Parentheses challenge  
UPDATE public.challenges 
SET 
    view_count = 1654,
    attempt_count = 1089,
    success_rate = 72.0,
    tags = ARRAY['stack', 'string'],
    category = 'data-structures'
WHERE title = 'Valid Parentheses';

-- Update Merge Two Sorted Lists challenge
UPDATE public.challenges 
SET 
    view_count = 1432,
    attempt_count = 892,
    success_rate = 58.0,
    tags = ARRAY['linked-list', 'recursion'],
    category = 'data-structures'  
WHERE title = 'Merge Two Sorted Lists';

-- Update Maximum Subarray challenge
UPDATE public.challenges 
SET 
    view_count = 2156,
    attempt_count = 1234,
    success_rate = 61.0,
    tags = ARRAY['array', 'dynamic-programming', 'greedy'],
    category = 'dynamic-programming'
WHERE title = 'Maximum Subarray';

-- Update N-Queens challenge
UPDATE public.challenges 
SET 
    view_count = 987,
    attempt_count = 234,
    success_rate = 34.0,
    tags = ARRAY['backtracking', 'recursion', 'array'],
    category = 'algorithms'
WHERE title = 'N-Queens';

-- Add some more sample challenges with realistic data
INSERT INTO public.challenges (
    id,
    title,
    description,
    input_example,
    output_example,
    testcases,
    difficulty,
    max_score,
    is_global,
    created_by,
    view_count,
    attempt_count,
    success_rate,
    tags,
    category,
    time_limit,
    memory_limit
) VALUES 
(
    gen_random_uuid(),
    'Reverse Integer',
    '<p>Given a signed 32-bit integer <strong>x</strong>, return <strong>x</strong> with its digits reversed. If reversing <strong>x</strong> causes the value to go outside the signed 32-bit integer range <strong>[-2³¹, 2³¹ - 1]</strong>, then return <strong>0</strong>.</p><p><strong>Assume the environment does not allow you to store 64-bit integers (signed or unsigned).</strong></p><h3>Example 1:</h3><pre><code>Input: x = 123
Output: 321</code></pre><h3>Example 2:</h3><pre><code>Input: x = -123
Output: -321</code></pre><h3>Example 3:</h3><pre><code>Input: x = 120
Output: 21</code></pre><h3>Constraints:</h3><ul><li><strong>-2³¹ ≤ x ≤ 2³¹ - 1</strong></li></ul>',
    'x = 123',
    '321',
    '[{"input": {"x": 123}, "output": 321}, {"input": {"x": -123}, "output": -321}, {"input": {"x": 120}, "output": 21}, {"input": {"x": 1534236469}, "output": 0}, {"input": {"x": -2147483648}, "output": 0}, {"input": {"x": 0}, "output": 0}, {"input": {"x": 10}, "output": 1}]',
    'medium',
    150,
    true,
    (SELECT id FROM auth.users LIMIT 1),
    1876,
    1234,
    71.0,
    ARRAY['math', 'integer-overflow'],
    'mathematics',
    1000,
    256
),
(
    gen_random_uuid(),
    'Binary Tree Inorder Traversal',
    '<p>Given the <strong>root</strong> of a binary tree, return <em>the inorder traversal of its nodes'' values</em>.</p><h3>Example 1:</h3><pre><code>Input: root = [1,null,2,3]
Output: [1,3,2]</code></pre><h3>Example 2:</h3><pre><code>Input: root = []
Output: []</code></pre><h3>Example 3:</h3><pre><code>Input: root = [1]
Output: [1]</code></pre><p><strong>Follow up:</strong> Recursive solution is trivial, could you do it iteratively?</p>',
    'root = [1,null,2,3]',
    '[1,3,2]',
    '[{"input": {"root": [1,null,2,3]}, "output": [1,3,2]}, {"input": {"root": []}, "output": []}, {"input": {"root": [1]}, "output": [1]}]',
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1),
    2341,
    1567,
    78.0,
    ARRAY['binary-tree', 'stack', 'tree-traversal', 'depth-first-search'],
    'data-structures',
    1000,
    256
),
(
    gen_random_uuid(),
    'Longest Palindromic Substring',
    '<p>Given a string <strong>s</strong>, return <em>the longest palindromic substring</em> in <strong>s</strong>.</p><h3>Example 1:</h3><pre><code>Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.</code></pre><h3>Example 2:</h3><pre><code>Input: s = "cbbd"
Output: "bb"</code></pre><h3>Constraints:</h3><ul><li><strong>1 ≤ s.length ≤ 1000</strong></li><li><strong>s</strong> consist of only digits and English letters.</li></ul>',
    's = "babad"',
    '"bab"',
    '[{"input": {"s": "babad"}, "output": "bab"}, {"input": {"s": "cbbd"}, "output": "bb"}]',
    'medium',
    150,
    true,
    (SELECT id FROM auth.users LIMIT 1),
    3245,
    1876,
    52.0,
    ARRAY['string', 'dynamic-programming', 'expand-around-center'],
    'string-manipulation',
    2000,
    256
),
(
    gen_random_uuid(),
    'Climbing Stairs',
    '<p>You are climbing a staircase. It takes <strong>n</strong> steps to reach the top.</p><p>Each time you can either climb <strong>1</strong> or <strong>2</strong> steps. In how many distinct ways can you climb to the top?</p><h3>Example 1:</h3><pre><code>Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps</code></pre><h3>Example 2:</h3><pre><code>Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step</code></pre>',
    'n = 2',
    '2',
    '[{"input": {"n": 2}, "output": 2}, {"input": {"n": 3}, "output": 3}, {"input": {"n": 4}, "output": 5}]',
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1),
    4521,
    3456,
    84.0,
    ARRAY['dynamic-programming', 'fibonacci', 'memoization'],
    'dynamic-programming',
    1000,
    128
);

-- Insert additional programming languages data
INSERT INTO public.programming_languages (name, display_name, file_extension, monaco_language_id, piston_language, piston_version, template_code) VALUES
('python', 'Python', '.py', 'python', 'python', '3.10.0', 'def reverse_integer(x):\n    """\n    Reverse the digits of a 32-bit signed integer.\n    Return 0 if the result overflows.\n    """\n    # Write your solution here\n    pass\n\n# Test your solution\nif __name__ == "__main__":\n    test_cases = [123, -123, 120, 1534236469, 0]\n    for x in test_cases:\n        result = reverse_integer(x)\n        print(f"Input: {x}, Output: {result}")'),
('javascript', 'JavaScript', '.js', 'javascript', 'javascript', '18.15.0', '/**\n * Reverse the digits of a 32-bit signed integer.\n * Return 0 if the result overflows.\n * @param {number} x\n * @return {number}\n */\nfunction reverse(x) {\n    // Write your solution here\n    \n}\n\n// Test your solution\nconst testCases = [123, -123, 120, 1534236469, 0];\ntestCases.forEach(x => {\n    const result = reverse(x);\n    console.log(`Input: ${x}, Output: ${result}`);\n});'),
('java', 'Java', '.java', 'java', 'java', '15.0.2', 'public class Solution {\n    /**\n     * Reverse the digits of a 32-bit signed integer.\n     * Return 0 if the result overflows.\n     */\n    public int reverse(int x) {\n        // Write your solution here\n        return 0;\n    }\n    \n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] testCases = {123, -123, 120, 1534236469, 0};\n        \n        for (int x : testCases) {\n            int result = sol.reverse(x);\n            System.out.println("Input: " + x + ", Output: " + result);\n        }\n    }\n}'),
('cpp', 'C++', '.cpp', 'cpp', 'c++', '10.2.0', '#include <iostream>\n#include <vector>\n#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    /**\n     * Reverse the digits of a 32-bit signed integer.\n     * Return 0 if the result overflows.\n     */\n    int reverse(int x) {\n        // Write your solution here\n        return 0;\n    }\n};\n\nint main() {\n    Solution sol;\n    vector<int> testCases = {123, -123, 120, 1534236469, 0};\n    \n    for (int x : testCases) {\n        int result = sol.reverse(x);\n        cout << "Input: " << x << ", Output: " << result << endl;\n    }\n    \n    return 0;\n}')
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    file_extension = EXCLUDED.file_extension,
    monaco_language_id = EXCLUDED.monaco_language_id,
    piston_language = EXCLUDED.piston_language,
    piston_version = EXCLUDED.piston_version,
    template_code = EXCLUDED.template_code;