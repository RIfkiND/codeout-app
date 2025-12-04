-- Code templates for the new challenges
-- Update challenges with template_overrides for each language

-- Templates for Climbing Stairs Challenge
UPDATE public.challenges SET template_overrides = jsonb_build_object(
    'javascript', 'function climbStairs(n) {
    // Write your solution here
    
}

// Test the function
console.log(climbStairs(2)); // Expected: 2
console.log(climbStairs(3)); // Expected: 3',
    'python', 'def climbStairs(n):
    """
    Calculate the number of distinct ways to climb n stairs.
    You can climb either 1 or 2 steps at a time.
    """
    # Write your solution here
    pass

# Test the function
print(climbStairs(2))  # Expected: 2
print(climbStairs(3))  # Expected: 3',
    'java', 'public class Solution {
    public static int climbStairs(int n) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test the function
        System.out.println(climbStairs(2)); // Expected: 2
        System.out.println(climbStairs(3)); // Expected: 3
    }
}'
) WHERE title = 'Climbing Stairs';

-- Templates for Maximum Subarray Challenge
UPDATE public.challenges SET template_overrides = jsonb_build_object(
    'javascript', 'function maxSubArray(nums) {
    // Write your solution here
    
}

// Test the function
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // Expected: 6
console.log(maxSubArray([1])); // Expected: 1',
    'python', 'def maxSubArray(nums):
    """
    Find the contiguous subarray with the largest sum.
    """
    # Write your solution here
    pass

# Test the function
print(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))  # Expected: 6
print(maxSubArray([1]))  # Expected: 1',
    'java', 'public class Solution {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test the function
        int[] nums1 = {-2,1,-3,4,-1,2,1,-5,4};
        System.out.println(maxSubArray(nums1)); // Expected: 6
        
        int[] nums2 = {1};
        System.out.println(maxSubArray(nums2)); // Expected: 1
    }
}'
) WHERE title = 'Maximum Subarray';

-- Template for SQL Challenge
UPDATE public.challenges SET template_overrides = jsonb_build_object(
    'sql', '-- Write a query to find the second highest salary
-- Return the result as SecondHighestSalary

SELECT 
    -- Your query here
    
FROM Employee;

-- Example table structure:
-- CREATE TABLE Employee (
--     Id INT,
--     Salary INT
-- );'
) WHERE title = 'Employee Salaries';

-- Templates for Palindrome Number Challenge
UPDATE public.challenges SET template_overrides = jsonb_build_object(
    'javascript', 'function isPalindrome(x) {
    // Write your solution here
    
}

// Test the function
console.log(isPalindrome(121)); // Expected: true
console.log(isPalindrome(-121)); // Expected: false',
    'python', 'def isPalindrome(x):
    """
    Determine if an integer is a palindrome.
    """
    # Write your solution here
    pass

# Test the function
print(isPalindrome(121))  # Expected: True
print(isPalindrome(-121))  # Expected: False',
    'java', 'public class Solution {
    public static boolean isPalindrome(int x) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        // Test the function
        System.out.println(isPalindrome(121)); // Expected: true
        System.out.println(isPalindrome(-121)); // Expected: false
    }
}'
) WHERE title = 'Palindrome Number';

-- Templates for Valid Parentheses Challenge
UPDATE public.challenges SET template_overrides = jsonb_build_object(
    'javascript', 'function isValid(s) {
    // Write your solution here
    
}

// Test the function
console.log(isValid("()")); // Expected: true
console.log(isValid("()[]{}")); // Expected: true
console.log(isValid("(]")); // Expected: false',
    'python', 'def isValid(s):
    """
    Determine if the input string has valid parentheses.
    """
    # Write your solution here
    pass

# Test the function
print(isValid("()"))  # Expected: True
print(isValid("()[]{})"))  # Expected: True
print(isValid("(]"))  # Expected: False',
    'java', 'import java.util.*;

public class Solution {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        // Test the function
        System.out.println(isValid("()")); // Expected: true
        System.out.println(isValid("()[]{}")); // Expected: true
        System.out.println(isValid("(]")); // Expected: false
    }
}'
) WHERE title = 'Valid Parentheses';