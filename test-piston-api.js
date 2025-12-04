// Simple test for the fixed Piston API
import { pistonService } from './src/lib/services/pistonService.js';

async function testPistonAPI() {
    console.log('Testing Piston API fixes...\n');
    
    // Test 1: Simple JavaScript function
    console.log('=== Test 1: JavaScript climbStairs function ===');
    const jsCode = `
function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`;
    
    try {
        const result = await pistonService.runTestCases(jsCode, 'javascript', [
            { input: { n: 2 }, output: 2 },
            { input: { n: 3 }, output: 3 },
            { input: { n: 5 }, output: 8 }
        ]);
        
        console.log('JavaScript test result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('JavaScript test failed:', error.message);
    }
    
    // Test 2: Simple Python function  
    console.log('\n=== Test 2: Python isPalindrome function ===');
    const pyCode = `
def isPalindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`;
    
    try {
        const result = await pistonService.runTestCases(pyCode, 'python', [
            { input: { x: 121 }, output: true },
            { input: { x: -121 }, output: false },
            { input: { x: 10 }, output: false }
        ]);
        
        console.log('Python test result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Python test failed:', error.message);
    }
    
    // Test 3: Simple execution
    console.log('\n=== Test 3: Simple execution test ===');
    try {
        const simpleResult = await pistonService.executeCodeSimple(
            'console.log("Hello from Piston API!");', 
            'javascript'
        );
        console.log('Simple execution result:', simpleResult);
    } catch (error) {
        console.error('Simple execution failed:', error.message);
    }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testPistonAPI().catch(console.error);
}