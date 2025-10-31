// Piston API configuration and language mappings
export const PISTON_CONFIG = {
  baseUrl: process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston',
  
  // Language mappings for Piston API
  languages: {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'cpp', version: '10.2.0' },
    c: { language: 'c', version: '10.2.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    rust: { language: 'rust', version: '1.68.2' },
    go: { language: 'go', version: '1.16.2' }
  }
};

export interface ExecutionResult {
  success: boolean;
  output: string;
  stderr: string;
  stdout: string;
  executionTime: number;
  memory: number;
  testResults?: TestResult[];
  totalTests?: number;
  passedTests?: number;
}

export interface TestCase {
  input: Record<string, unknown>;
  output: unknown;
}

export interface TestResult {
  input: Record<string, unknown>;
  expectedOutput: unknown;
  actualOutput: unknown;
  passed: boolean;
  error?: string;
}

export class CodeExecutor {
  
  static async executeCode(
    code: string, 
    language: string, 
    testCases?: TestCase[],
    timeLimit: number = 5000
  ): Promise<ExecutionResult> {
    
    const pistonLang = PISTON_CONFIG.languages[language as keyof typeof PISTON_CONFIG.languages];
    
    if (!pistonLang) {
      throw new Error(`Language ${language} not supported`);
    }

    try {
      // If we have test cases, run them; otherwise just execute the code
      if (testCases && testCases.length > 0) {
        return await this.runTestCases(code, language, testCases, timeLimit);
      } else {
        return await this.executeSimple(code, pistonLang, timeLimit);
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        stdout: '',
        executionTime: 0,
        memory: 0
      };
    }
  }

  private static async executeSimple(
    code: string, 
    pistonLang: { language: string; version: string },
    timeLimit: number
  ): Promise<ExecutionResult> {
    
    const response = await fetch(`${PISTON_CONFIG.baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLang.language,
        version: pistonLang.version,
        files: [{ content: code }],
        stdin: '',
        args: [],
        compile_timeout: timeLimit / 1000,
        run_timeout: timeLimit / 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.run.code === 0,
      output: result.run.stdout || result.run.stderr || '',
      stderr: result.run.stderr || '',
      stdout: result.run.stdout || '',
      executionTime: result.run.time || 0,
      memory: result.run.memory || 0
    };
  }

  private static async runTestCases(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number
  ): Promise<ExecutionResult> {
    
    const testResults: TestResult[] = [];
    let totalExecutionTime = 0;
    let maxMemory = 0;
    
    for (const testCase of testCases) {
      try {
        // Create test wrapper code based on language
        const testCode = this.wrapCodeWithTest(code, language, testCase);
        
        const pistonLang = PISTON_CONFIG.languages[language as keyof typeof PISTON_CONFIG.languages];
        const result = await this.executeSimple(testCode, pistonLang, timeLimit);
        
        totalExecutionTime += result.executionTime;
        maxMemory = Math.max(maxMemory, result.memory);
        
        // Parse test result from output
        const testResult = this.parseTestResult(result, testCase);
        testResults.push(testResult);
        
      } catch (error) {
        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const passedTests = testResults.filter(t => t.passed).length;
    const success = passedTests === testResults.length;
    
    // Generate summary output
    const output = this.generateTestSummary(testResults, passedTests, testResults.length);
    
    return {
      success,
      output,
      stderr: testResults.filter(t => t.error).map(t => t.error).join('\n'),
      stdout: output,
      executionTime: totalExecutionTime / testResults.length,
      memory: maxMemory,
      testResults,
      totalTests: testResults.length,
      passedTests
    };
  }

  private static wrapCodeWithTest(code: string, language: string, testCase: TestCase): string {
    switch (language) {
      case 'javascript':
        return `
${code}

// Test case execution
try {
  const input = ${JSON.stringify(testCase.input)};
  const expected = ${JSON.stringify(testCase.output)};
  
  let result;
  if (typeof solution === 'function') {
    result = solution(...Object.values(input));
  } else if (typeof solve === 'function') {
    result = solve(...Object.values(input));
  } else {
    throw new Error('No solution function found');
  }
  
  console.log(JSON.stringify({
    input: input,
    expected: expected,
    actual: result,
    passed: JSON.stringify(result) === JSON.stringify(expected)
  }));
} catch (error) {
  console.log(JSON.stringify({
    input: ${JSON.stringify(testCase.input)},
    expected: ${JSON.stringify(testCase.output)},
    actual: null,
    passed: false,
    error: error.message
  }));
}
        `;
        
      case 'python':
        return `
import json
import sys

${code}

# Test case execution
try:
    input_data = ${JSON.stringify(testCase.input).replace(/"/g, '"')}
    expected = ${JSON.stringify(testCase.output).replace(/"/g, '"')}
    
    if 'solution' in globals():
        result = solution(**input_data) if isinstance(input_data, dict) else solution(*input_data)
    elif 'solve' in globals():
        result = solve(**input_data) if isinstance(input_data, dict) else solve(*input_data)
    else:
        raise Exception('No solution function found')
    
    print(json.dumps({
        'input': input_data,
        'expected': expected,
        'actual': result,
        'passed': result == expected
    }))
except Exception as error:
    print(json.dumps({
        'input': ${JSON.stringify(testCase.input).replace(/"/g, '"')},
        'expected': ${JSON.stringify(testCase.output).replace(/"/g, '"')},
        'actual': None,
        'passed': False,
        'error': str(error)
    }))
        `;
        
      default:
        return code; // For other languages, return as-is for now
    }
  }

  private static parseTestResult(executionResult: ExecutionResult, testCase: TestCase): TestResult {
    try {
      const outputLines = executionResult.stdout.trim().split('\n');
      const lastLine = outputLines[outputLines.length - 1];
      const parsed = JSON.parse(lastLine);
      
      return {
        input: parsed.input,
        expectedOutput: parsed.expected,
        actualOutput: parsed.actual,
        passed: parsed.passed,
        error: parsed.error
      };
    } catch {
      return {
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: executionResult.stdout,
        passed: false,
        error: 'Failed to parse test result'
      };
    }
  }

  private static generateTestSummary(testResults: TestResult[], passed: number, total: number): string {
    let summary = `\n=== Test Results ===\n`;
    summary += `Passed: ${passed}/${total} test cases\n\n`;
    
    testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      summary += `Test Case ${index + 1}: ${status}\n`;
      summary += `Input: ${JSON.stringify(result.input)}\n`;
      summary += `Expected: ${JSON.stringify(result.expectedOutput)}\n`;
      summary += `Got: ${JSON.stringify(result.actualOutput)}\n`;
      
      if (result.error) {
        summary += `Error: ${result.error}\n`;
      }
      summary += '\n';
    });
    
    if (passed === total) {
      summary += '🎉 All test cases passed!\n';
    } else {
      summary += `❌ ${total - passed} test case(s) failed. Keep trying!\n`;
    }
    
    return summary;
  }
}