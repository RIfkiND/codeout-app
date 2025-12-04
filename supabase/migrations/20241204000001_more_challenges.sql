-- Additional challenges including SQL and algorithmic problems

-- Climbing Stairs Challenge
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
    created_by
) VALUES (
    gen_random_uuid(),
    'Climbing Stairs',
    '<div class="prose max-w-none">
        <p>You are climbing a staircase. It takes <code>n</code> steps to reach the top.</p>
        
        <p>Each time you can either climb <strong>1</strong> or <strong>2</strong> steps. In how many distinct ways can you climb to the top?</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>1 ≤ n ≤ 45</code></li>
        </ul>
    </div>',
    'n = 2',
    '2',
    '[
        {"input": {"n": 2}, "output": 2},
        {"input": {"n": 3}, "output": 3},
        {"input": {"n": 4}, "output": 5},
        {"input": {"n": 5}, "output": 8},
        {"input": {"n": 1}, "output": 1}
    ]'::json,
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Maximum Subarray Challenge
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
    created_by
) VALUES (
    gen_random_uuid(),
    'Maximum Subarray',
    '<div class="prose max-w-none">
        <p>Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) which has the largest sum and return <em>its sum</em>.</p>
        
        <p>A <strong>subarray</strong> is a contiguous part of an array.</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: nums = [1]
Output: 1
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: nums = [5,4,-1,7,8]
Output: 23
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>1 ≤ nums.length ≤ 10⁵</code></li>
            <li><code>-10⁴ ≤ nums[i] ≤ 10⁴</code></li>
        </ul>
    </div>',
    'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    '6',
    '[
        {"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6},
        {"input": {"nums": [1]}, "output": 1},
        {"input": {"nums": [5,4,-1,7,8]}, "output": 23},
        {"input": {"nums": [-1]}, "output": -1},
        {"input": {"nums": [-2,-1]}, "output": -1}
    ]'::json,
    'medium',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- SQL: Employee Salaries Challenge
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
    created_by
) VALUES (
    gen_random_uuid(),
    'Employee Salaries',
    '<div class="prose max-w-none">
        <p>Write a SQL query to find the <strong>second highest salary</strong> from the <code>Employee</code> table.</p>
        
        <p>If there is no second highest salary, the query should return <code>null</code>.</p>
        
        <h3>Table: Employee</h3>
        <pre><code>+----+--------+
| Id | Salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+
</code></pre>
        
        <h3>Expected Output:</h3>
        <pre><code>+---------------------+
| SecondHighestSalary |
+---------------------+
| 200                 |
+---------------------+
</code></pre>
        
        <h3>Requirements:</h3>
        <ul>
            <li>Return the column name as <code>SecondHighestSalary</code></li>
            <li>Handle the case where there is no second highest salary</li>
        </ul>
    </div>',
    'Employee table with Id and Salary columns',
    'SecondHighestSalary = 200',
    '[
        {
            "input": {
                "table": "Employee",
                "data": [
                    {"Id": 1, "Salary": 100},
                    {"Id": 2, "Salary": 200},
                    {"Id": 3, "Salary": 300}
                ]
            },
            "output": "200"
        },
        {
            "input": {
                "table": "Employee",
                "data": [
                    {"Id": 1, "Salary": 100}
                ]
            },
            "output": null
        }
    ]'::json,
    'medium',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Palindrome Number Challenge
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
    created_by
) VALUES (
    gen_random_uuid(),
    'Palindrome Number',
    '<div class="prose max-w-none">
        <p>Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is palindrome integer.</p>
        
        <p>An integer is a <strong>palindrome</strong> when it reads the same backward as forward.</p>
        
        <ul>
            <li>For example, <code>121</code> is a palindrome while <code>123</code> is not.</li>
        </ul>
        
        <h3>Example 1:</h3>
        <pre><code>Input: x = 121
Output: true
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>-2³¹ ≤ x ≤ 2³¹ - 1</code></li>
        </ul>
        
        <h3>Follow up:</h3>
        <p>Could you solve it without converting the integer to a string?</p>
    </div>',
    'x = 121',
    'true',
    '[
        {"input": {"x": 121}, "output": true},
        {"input": {"x": -121}, "output": false},
        {"input": {"x": 10}, "output": false},
        {"input": {"x": 0}, "output": true},
        {"input": {"x": 1221}, "output": true}
    ]'::json,
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Valid Parentheses Challenge
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
    created_by
) VALUES (
    gen_random_uuid(),
    'Valid Parentheses',
    '<div class="prose max-w-none">
        <p>Given a string <code>s</code> containing just the characters <code>''('')'', ''{}''</code> and <code>''[]''</code>, determine if the input string is valid.</p>
        
        <p>An input string is valid if:</p>
        <ol>
            <li>Open brackets must be closed by the same type of brackets.</li>
            <li>Open brackets must be closed in the correct order.</li>
            <li>Every close bracket has a corresponding open bracket of the same type.</li>
        </ol>
        
        <h3>Example 1:</h3>
        <pre><code>Input: s = "()"
Output: true
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: s = "()[]{}"
Output: true
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: s = "(]"
Output: false
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>1 ≤ s.length ≤ 10⁴</code></li>
            <li><code>s</code> consists of parentheses only <code>''()[]{}''</code>.</li>
        </ul>
    </div>',
    's = "()"',
    'true',
    '[
        {"input": {"s": "()"}, "output": true},
        {"input": {"s": "()[]{}"}, "output": true},
        {"input": {"s": "(]"}, "output": false},
        {"input": {"s": "([)]"}, "output": false},
        {"input": {"s": "{[]}"}, "output": true}
    ]'::json,
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);