import { CodeExecutor } from './codeExecutor.js';
import type { TestCase, TestResult as BaseTestResult } from './codeExecutor.js';

export interface ExtendedTestResult extends BaseTestResult {
  isHidden?: boolean;
  executionTime?: number;
  description?: string;
}

export type TestResult = ExtendedTestResult;

export interface ExecutionOutput {
  success: boolean;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  executionTime: number;
  memoryUsed?: number;
  overallStatus: 'passed' | 'failed' | 'error' | 'timeout';
  errorMessage?: string;
  compilationError?: string;
  runtimeError?: string;
  debugInfo?: {
    pistonOutput?: Record<string, unknown>;
    mockExecution?: boolean;
    languageInfo?: Record<string, unknown>;
  };
}

export interface OutputDisplayConfig {
  showExecutionTime: boolean;
  showMemoryUsage: boolean;
  showDebugInfo: boolean;
  showHiddenTests: boolean;
  maxOutputLength: number;
  formatOutput: boolean;
}

export class OutputHandler {
  private static defaultConfig: OutputDisplayConfig = {
    showExecutionTime: true,
    showMemoryUsage: true,
    showDebugInfo: false,
    showHiddenTests: false,
    maxOutputLength: 1000,
    formatOutput: true
  };

  /**
   * Execute code and format output for display
   */
  static async executeAndFormatOutput(
    code: string,
    language: string,
    testCases: TestCase[],
    config: Partial<OutputDisplayConfig> = {}
  ): Promise<ExecutionOutput> {
    const displayConfig = { ...this.defaultConfig, ...config };
    
    try {
      const startTime = performance.now();
      
      // Execute code using CodeExecutor
      const executionResult = await CodeExecutor.executeCode(code, language, testCases);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Get test results
      const results = executionResult.testResults || [];
      
      // Count passed tests
      const passedTests = results.filter((r: TestResult) => r.passed).length;
      const totalTests = results.length;

      // Determine overall status
      let overallStatus: 'passed' | 'failed' | 'error' | 'timeout' = 'passed';
      let errorMessage: string | undefined;
      let compilationError: string | undefined;
      let runtimeError: string | undefined;

      // Check for errors in results
      const hasErrors = results.some(r => r.error);
      const hasTimeouts = results.some((r: TestResult) => r.executionTime && r.executionTime > 10000);
      
      if (hasErrors) {
        overallStatus = 'error';
        const errorResults = results.filter(r => r.error);
        if (errorResults.length > 0) {
          const firstError = errorResults[0].error;
          if (firstError?.includes('compilation') || firstError?.includes('syntax')) {
            compilationError = firstError;
          } else {
            runtimeError = firstError;
          }
          errorMessage = firstError;
        }
      } else if (hasTimeouts) {
        overallStatus = 'timeout';
        errorMessage = 'Code execution timed out';
      } else if (passedTests < totalTests) {
        overallStatus = 'failed';
      }

      // Format results for display
      const formattedResults = this.formatTestResults(results, displayConfig);

      return {
        success: overallStatus === 'passed',
        results: formattedResults,
        totalTests,
        passedTests,
        executionTime,
        overallStatus,
        errorMessage,
        compilationError,
        runtimeError,
        debugInfo: {
          mockExecution: true, // Will be false when real Piston is used
          languageInfo: { language }
        }
      };

    } catch (error) {
      return {
        success: false,
        results: [],
        totalTests: testCases.length,
        passedTests: 0,
        executionTime: 0,
        overallStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown execution error',
        debugInfo: {
          mockExecution: true
        }
      };
    }
  }

  /**
   * Format test results for display
   */
  private static formatTestResults(
    results: TestResult[], 
    config: OutputDisplayConfig
  ): TestResult[] {
    return results.map(result => {
      let formattedResult = { ...result };

      // Truncate long outputs
      const actualOutputStr = String(result.actualOutput || '');
      if (actualOutputStr.length > config.maxOutputLength) {
        formattedResult.actualOutput = 
          actualOutputStr.substring(0, config.maxOutputLength) + '\n... (output truncated)';
      }

      // Format output if enabled
      if (config.formatOutput && actualOutputStr) {
        formattedResult.actualOutput = this.formatCodeOutput(actualOutputStr);
      }

      // Hide sensitive information from hidden tests
      if (result.isHidden && !config.showHiddenTests) {
        formattedResult = {
          ...formattedResult,
          input: { value: '[Hidden Test Case]' } as Record<string, unknown>,
          expectedOutput: '[Hidden]',
          actualOutput: result.passed ? '[Passed]' : '[Failed]'
        };
      }

      return formattedResult;
    });
  }

  /**
   * Format code output for better readability
   */
  private static formatCodeOutput(output: string): string {
    try {
      // Try to parse as JSON for pretty formatting
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, just clean up the output
      return output
        .trim()
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
    }
  }

  /**
   * Generate execution summary for display
   */
  static generateSummary(output: ExecutionOutput): string {
    const { passedTests, totalTests, executionTime, overallStatus } = output;
    
    let summary = `${passedTests}/${totalTests} tests passed`;
    
    if (executionTime > 0) {
      summary += ` • ${Math.round(executionTime)}ms`;
    }

    switch (overallStatus) {
      case 'passed':
        summary += ' • ✅ All tests passed!';
        break;
      case 'failed':
        summary += ' • ❌ Some tests failed';
        break;
      case 'error':
        summary += ' • 🚫 Execution error';
        break;
      case 'timeout':
        summary += ' • ⏱️ Execution timeout';
        break;
    }

    return summary;
  }

  /**
   * Generate detailed console output for debugging
   */
  static generateConsoleOutput(output: ExecutionOutput, config: OutputDisplayConfig): string {
    let consoleOutput = '';

    // Add execution summary
    consoleOutput += `=== Execution Summary ===\n`;
    consoleOutput += `Status: ${output.overallStatus}\n`;
    consoleOutput += `Tests: ${output.passedTests}/${output.totalTests} passed\n`;
    consoleOutput += `Execution Time: ${Math.round(output.executionTime)}ms\n`;
    
    if (output.memoryUsed) {
      consoleOutput += `Memory Used: ${output.memoryUsed}MB\n`;
    }
    
    consoleOutput += '\n';

    // Add error information if present
    if (output.errorMessage) {
      consoleOutput += `=== Error Information ===\n`;
      if (output.compilationError) {
        consoleOutput += `Compilation Error: ${output.compilationError}\n`;
      }
      if (output.runtimeError) {
        consoleOutput += `Runtime Error: ${output.runtimeError}\n`;
      }
      if (output.errorMessage && !output.compilationError && !output.runtimeError) {
        consoleOutput += `Error: ${output.errorMessage}\n`;
      }
      consoleOutput += '\n';
    }

    // Add test results
    consoleOutput += `=== Test Results ===\n`;
    output.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      consoleOutput += `Test ${index + 1}: ${status}\n`;
      
      if (!result.isHidden || config.showHiddenTests) {
        consoleOutput += `  Input: ${JSON.stringify(result.input)}\n`;
        consoleOutput += `  Expected: ${String(result.expectedOutput)}\n`;
        consoleOutput += `  Actual: ${String(result.actualOutput)}\n`;
      } else {
        consoleOutput += `  Hidden test case\n`;
      }
      
      if (result.executionTime) {
        consoleOutput += `  Time: ${result.executionTime}ms\n`;
      }
      
      if (result.error) {
        consoleOutput += `  Error: ${result.error}\n`;
      }
      
      consoleOutput += '\n';
    });

    // Add debug information if enabled
    if (config.showDebugInfo && output.debugInfo) {
      consoleOutput += `=== Debug Information ===\n`;
      consoleOutput += `Mock Execution: ${output.debugInfo.mockExecution}\n`;
      
      if (output.debugInfo.languageInfo) {
        consoleOutput += `Language: ${JSON.stringify(output.debugInfo.languageInfo)}\n`;
      }
      
      if (output.debugInfo.pistonOutput) {
        consoleOutput += `Piston Output: ${JSON.stringify(output.debugInfo.pistonOutput, null, 2)}\n`;
      }
    }

    return consoleOutput;
  }

  /**
   * Format output for web display (HTML-friendly)
   */
  static formatForWeb(output: ExecutionOutput): {
    html: string;
    summary: string;
    consoleText: string;
  } {
    const summary = this.generateSummary(output);
    const consoleText = this.generateConsoleOutput(output, this.defaultConfig);

    let html = `<div class="execution-output">`;
    
    // Summary section
    html += `<div class="summary ${output.overallStatus}">`;
    html += `<h3>${summary}</h3>`;
    html += `</div>`;

    // Test results section
    html += `<div class="test-results">`;
    output.results.forEach((result, index) => {
      const statusClass = result.passed ? 'passed' : 'failed';
      html += `<div class="test-result ${statusClass}">`;
      html += `<h4>Test ${index + 1} ${result.passed ? '✅' : '❌'}</h4>`;
      
      if (!result.isHidden) {
        html += `<div class="test-details">`;
        html += `<div><strong>Input:</strong> <code>${this.escapeHtml(JSON.stringify(result.input))}</code></div>`;
        html += `<div><strong>Expected:</strong> <code>${this.escapeHtml(String(result.expectedOutput))}</code></div>`;
        html += `<div><strong>Actual:</strong> <code>${this.escapeHtml(String(result.actualOutput || ''))}</code></div>`;
        html += `</div>`;
      }
      
      if (result.error) {
        html += `<div class="error"><strong>Error:</strong> ${this.escapeHtml(result.error)}</div>`;
      }
      
      html += `</div>`;
    });
    html += `</div>`;

    // Error section
    if (output.errorMessage) {
      html += `<div class="error-section">`;
      html += `<h4>Error Details</h4>`;
      html += `<pre>${this.escapeHtml(output.errorMessage)}</pre>`;
      html += `</div>`;
    }

    html += `</div>`;

    return { html, summary, consoleText };
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Create output configuration for different contexts
   */
  static createConfig(context: 'development' | 'production' | 'debug'): OutputDisplayConfig {
    switch (context) {
      case 'development':
        return {
          ...this.defaultConfig,
          showDebugInfo: true,
          showHiddenTests: true,
          maxOutputLength: 5000
        };
      
      case 'debug':
        return {
          ...this.defaultConfig,
          showDebugInfo: true,
          showHiddenTests: true,
          showExecutionTime: true,
          showMemoryUsage: true,
          maxOutputLength: 10000,
          formatOutput: false // Raw output for debugging
        };
      
      case 'production':
      default:
        return {
          ...this.defaultConfig,
          showDebugInfo: false,
          showHiddenTests: false
        };
    }
  }
}

// CSS classes for styling (to be added to your global CSS)
export const outputStyles = `
.execution-output {
  font-family: 'JetBrains Mono', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #333;
}

.execution-output .summary {
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
  margin-bottom: 1rem;
}

.execution-output .summary.passed h3 {
  color: #4ade80;
}

.execution-output .summary.failed h3 {
  color: #f87171;
}

.execution-output .summary.error h3 {
  color: #fbbf24;
}

.execution-output .test-result {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border-left: 4px solid;
}

.execution-output .test-result.passed {
  background: rgba(74, 222, 128, 0.1);
  border-left-color: #4ade80;
}

.execution-output .test-result.failed {
  background: rgba(248, 113, 113, 0.1);
  border-left-color: #f87171;
}

.execution-output .test-details div {
  margin: 0.25rem 0;
}

.execution-output code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.execution-output .error {
  color: #fbbf24;
  margin-top: 0.5rem;
}

.execution-output .error-section {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 0.375rem;
  border-left: 4px solid #f87171;
}

.execution-output pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}
`;