-- Sample challenges for testing the editor

-- Two Sum Challenge
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
    'Two Sum',
    '<div class="prose max-w-none">
        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
        
        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
        
        <p>You can return the answer in any order.</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: nums = [3,2,4], target = 6
Output: [1,2]
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: nums = [3,3], target = 6
Output: [0,1]
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>2 ≤ nums.length ≤ 10⁴</code></li>
            <li><code>-10⁹ ≤ nums[i] ≤ 10⁹</code></li>
            <li><code>-10⁹ ≤ target ≤ 10⁹</code></li>
            <li><strong>Only one valid answer exists.</strong></li>
        </ul>
    </div>',
    'nums = [2,7,11,15], target = 9',
    '[0,1]',
    '[
        {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
        {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
        {"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
    ]',
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Valid Parentheses
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
        <p>Given a string <code>s</code> containing just the characters <code>''(''</code>, <code>'')''</code>, <code>''{''</code>, <code>''}''</code>, <code>''[''</code> and <code>'']''</code>, determine if the input string is valid.</p>
        
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
    ]',
    'easy',
    100,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Merge Two Sorted Lists
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
    'Merge Two Sorted Lists',
    '<div class="prose max-w-none">
        <p>You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.</p>
        
        <p>Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.</p>
        
        <p>Return <em>the head of the merged linked list</em>.</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: list1 = [], list2 = []
Output: []
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: list1 = [], list2 = [0]
Output: [0]
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li>The number of nodes in both lists is in the range <code>[0, 50]</code>.</li>
            <li><code>-100 ≤ Node.val ≤ 100</code></li>
            <li>Both <code>list1</code> and <code>list2</code> are sorted in <strong>non-decreasing</strong> order.</li>
        </ul>
    </div>',
    'list1 = [1,2,4], list2 = [1,3,4]',
    '[1,1,2,3,4,4]',
    '[
        {"input": {"list1": [1,2,4], "list2": [1,3,4]}, "output": [1,1,2,3,4,4]},
        {"input": {"list1": [], "list2": []}, "output": []},
        {"input": {"list1": [], "list2": [0]}, "output": [0]}
    ]',
    'medium',
    150,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Maximum Subarray
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
        <p>Given an integer array <code>nums</code>, find the <strong>subarray</strong> with the largest sum, and return <em>its sum</em>.</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
</code></pre>
        
        <h3>Example 3:</h3>
        <pre><code>Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>1 ≤ nums.length ≤ 10⁵</code></li>
            <li><code>-10⁴ ≤ nums[i] ≤ 10⁴</code></li>
        </ul>
        
        <p><strong>Follow up:</strong> If you have figured out the O(n) solution, try coding another solution using the <strong>divide and conquer</strong> approach, which is more subtle.</p>
    </div>',
    'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    '6',
    '[
        {"input": {"nums": [-2,1,-3,4,-1,2,1,-5,4]}, "output": 6},
        {"input": {"nums": [1]}, "output": 1},
        {"input": {"nums": [5,4,-1,7,8]}, "output": 23}
    ]',
    'medium',
    150,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- N-Queens (Hard Problem)
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
    'N-Queens',
    '<div class="prose max-w-none">
        <p>The <strong>n-queens</strong> puzzle is the problem of placing <code>n</code> queens on an <code>n x n</code> chessboard such that no two queens attack each other.</p>
        
        <p>Given an integer <code>n</code>, return <em>all distinct solutions to the <strong>n-queens puzzle</strong></em>. You may return the answer in <strong>any order</strong>.</p>
        
        <p>Each solution contains a distinct board configuration of the n-queens'' placement, where <code>''Q''</code> and <code>''.''</code> both indicate a queen and an empty space, respectively.</p>
        
        <h3>Example 1:</h3>
        <pre><code>Input: n = 4
Output: [
  [".Q..",
   "...Q",
   "Q...",
   "..Q."],
  ["..Q.",
   "Q...",
   "...Q",
   ".Q.."]
]
Explanation: There exist two distinct solutions to the 4-queens puzzle.
</code></pre>
        
        <h3>Example 2:</h3>
        <pre><code>Input: n = 1
Output: [["Q"]]
</code></pre>
        
        <h3>Constraints:</h3>
        <ul>
            <li><code>1 ≤ n ≤ 9</code></li>
        </ul>
    </div>',
    'n = 4',
    '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
    '[
        {"input": {"n": 4}, "output": [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]},
        {"input": {"n": 1}, "output": [["Q"]]},
        {"input": {"n": 2}, "output": []},
        {"input": {"n": 3}, "output": []}
    ]',
    'hard',
    200,
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- Associate challenges with categories
INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Two Sum' AND cat.name = 'Array';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Two Sum' AND cat.name = 'Hash Table';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Valid Parentheses' AND cat.name = 'Stack';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Valid Parentheses' AND cat.name = 'String';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Merge Two Sorted Lists' AND cat.name = 'Linked List';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Maximum Subarray' AND cat.name = 'Array';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'Maximum Subarray' AND cat.name = 'Dynamic Programming';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'N-Queens' AND cat.name = 'Backtracking';

INSERT INTO public.challenge_categories (challenge_id, category_id)
SELECT c.id, cat.id
FROM public.challenges c, public.categories cat
WHERE c.title = 'N-Queens' AND cat.name = 'Array';