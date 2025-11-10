-- Fix code templates with proper formatting and line breaks
-- This migration updates the template_code field with properly formatted templates

-- Update JavaScript template
UPDATE public.programming_languages 
SET template_code = E'function solution() {\n    // Your code here\n    return null;\n}'
WHERE name = 'javascript';

-- Update Python template  
UPDATE public.programming_languages 
SET template_code = E'def solution():\n    # Your code here\n    return None'
WHERE name = 'python';

-- Update Java template
UPDATE public.programming_languages 
SET template_code = E'public class Solution {\n    public Object solution() {\n        // Your code here\n        return null;\n    }\n}'
WHERE name = 'java';

-- Update C++ template
UPDATE public.programming_languages 
SET template_code = E'#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto solution() {\n        // Your code here\n        return nullptr;\n    }\n};'
WHERE name = 'cpp';

-- Update C template
UPDATE public.programming_languages 
SET template_code = E'#include <stdio.h>\n#include <stdlib.h>\n\nint solution() {\n    // Your code here\n    return 0;\n}'
WHERE name = 'c';

-- Update TypeScript template
UPDATE public.programming_languages 
SET template_code = E'function solution(): any {\n    // Your code here\n    return null;\n}'
WHERE name = 'typescript';

-- Update Rust template
UPDATE public.programming_languages 
SET template_code = E'fn solution() -> Option<i32> {\n    // Your code here\n    None\n}'
WHERE name = 'rust';

-- Update Go template
UPDATE public.programming_languages 
SET template_code = E'package main\n\nimport "fmt"\n\nfunc solution() interface{} {\n    // Your code here\n    return nil\n}\n\nfunc main() {\n    result := solution()\n    fmt.Println(result)\n}'
WHERE name = 'go';

-- Add PHP if it doesn't exist
INSERT INTO public.programming_languages (name, display_name, file_extension, monaco_language_id, piston_language, piston_version, template_code) 
VALUES ('php', 'PHP', '.php', 'php', 'php', '8.2.3', E'<?php\n\nfunction solution() {\n    // Your code here\n    return null;\n}\n\n?>')
ON CONFLICT (name) DO UPDATE SET 
template_code = E'<?php\n\nfunction solution() {\n    // Your code here\n    return null;\n}\n\n?>';

-- Add Ruby if it doesn't exist
INSERT INTO public.programming_languages (name, display_name, file_extension, monaco_language_id, piston_language, piston_version, template_code) 
VALUES ('ruby', 'Ruby', '.rb', 'ruby', 'ruby', '3.0.1', E'def solution\n    # Your code here\n    return nil\nend')
ON CONFLICT (name) DO UPDATE SET 
template_code = E'def solution\n    # Your code here\n    return nil\nend';

-- Update challenge with starter code for "Reverse Integer" problem (if it exists)
UPDATE public.challenges 
SET starter_code = jsonb_build_object(
    'javascript', E'/**\n * @param {number} x\n * @return {number}\n */\nfunction reverse(x) {\n    // Your code here\n    return 0;\n}',
    'python', E'def reverse(x):\n    """\n    :type x: int\n    :rtype: int\n    """\n    # Your code here\n    return 0',
    'java', E'public class Solution {\n    /**\n     * @param x: an integer\n     * @return: the reverse of x\n     */\n    public int reverse(int x) {\n        // Your code here\n        return 0;\n    }\n}',
    'cpp', E'#include <climits>\nusing namespace std;\n\nclass Solution {\npublic:\n    /**\n     * @param x: an integer\n     * @return: the reverse of x\n     */\n    int reverse(int x) {\n        // Your code here\n        return 0;\n    }\n};'
)
WHERE title ILIKE '%reverse%integer%' OR title ILIKE '%reverse integer%';

-- Add generic starter codes for other common problems
-- Two Sum problem
UPDATE public.challenges 
SET starter_code = jsonb_build_object(
    'javascript', E'/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your code here\n    return [];\n}',
    'python', E'def twoSum(nums, target):\n    """\n    :type nums: List[int]\n    :type target: int\n    :rtype: List[int]\n    """\n    # Your code here\n    return []',
    'java', E'import java.util.*;\n\npublic class Solution {\n    /**\n     * @param nums: an array of integers\n     * @param target: target sum\n     * @return: indices of the two numbers\n     */\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[0];\n    }\n}',
    'cpp', E'#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    /**\n     * @param nums: an array of integers\n     * @param target: target sum\n     * @return: indices of the two numbers\n     */\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};'
)
WHERE title ILIKE '%two%sum%' OR title = 'Two Sum';