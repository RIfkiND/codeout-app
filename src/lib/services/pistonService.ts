interface PistonLanguage {
	language: string;
	version: string;
	aliases: string[];
}

interface TestCase {
	input: Record<string, unknown>;
	output: unknown;
}

interface TestCaseResult {
	id: number;
	passed: boolean;
	time: string;
	input: string;
	expected: string;
	actual: string;
	stderr: string;
}

interface TestResult {
	total_test_cases: number;
	test_cases_passed: number;
	test_cases: TestCaseResult[];
	execution_time: number;
	memory_used: number;
	error_message: string | null;
}

interface PistonExecuteRequest {
	language: string;
	version: string;
	files: Array<{
		name?: string;
		content: string;
	}>;
	stdin?: string;
	args?: string[];
	compile_timeout?: number;
	run_timeout?: number;
	compile_memory_limit?: number;
	run_memory_limit?: number;
}

interface PistonExecuteResponse {
	language: string;
	version: string;
	run: {
		stdout: string;
		stderr: string;
		code: number;
		signal: string | null;
		output: string;
	};
	compile?: {
		stdout: string;
		stderr: string;
		code: number;
		signal: string | null;
		output: string;
	};
}

class PistonService {
	private baseUrl = 'https://emkc.org/api/v2/piston';
	
	async getLanguages(): Promise<PistonLanguage[]> {
		const response = await fetch(`${this.baseUrl}/runtimes`);
		if (!response.ok) {
			throw new Error('Failed to fetch supported languages');
		}
		return response.json();
	}
	
	async executeCode(request: PistonExecuteRequest): Promise<PistonExecuteResponse> {
		try {
			// Ensure request has required fields and valid values
			const validatedRequest = {
				language: request.language,
				version: request.version,
				files: request.files.map(file => ({
					name: file.name || 'main',
					content: file.content
				})),
				stdin: request.stdin || '',
				args: request.args || [],
				compile_timeout: request.compile_timeout || 10000,
				run_timeout: request.run_timeout || 5000,
				compile_memory_limit: request.compile_memory_limit || 128000000,
				run_memory_limit: request.run_memory_limit || 128000000
			};
			
			console.log('Piston API request:', JSON.stringify(validatedRequest, null, 2));
			
			const response = await fetch(`${this.baseUrl}/execute`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': 'CodeOut-App/1.0'
				},
				body: JSON.stringify(validatedRequest)
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error('Piston API error response:', {
					status: response.status,
					statusText: response.statusText,
					body: errorText
				});
				throw new Error(`Piston API error ${response.status}: ${errorText}`);
			}
			
			const result = await response.json();
			console.log('Piston API response:', result);
			return result;
		} catch (error) {
			console.error('Piston API request failed:', error);
			throw error;
		}
	}
	
	async executeCodeSimple(code: string, language: string, input?: string): Promise<{ stdout: string; stderr: string; success: boolean }> {
		try {
			const result = await this.executeCode({
				language: language === 'javascript' ? 'node' : language === 'sql' ? 'sqlite3' : language,
				version: this.getLanguageVersion(language),
				files: [{
					name: this.getFileName(language),
					content: input ? this.wrapCodeForTesting(code, input, language) : code
				}],
				run_timeout: 5000,
				run_memory_limit: 128000000 // 128MB in bytes
			});
			
			return {
				stdout: result.run.stdout,
				stderr: result.run.stderr,
				success: result.run.code === 0
			};
		} catch (error) {
			return {
				stdout: '',
				stderr: error instanceof Error ? error.message : 'Unknown error',
				success: false
			};
		}
	}
	
	getLanguageVersion(language: string): string {
		const languageMap: Record<string, string> = {
			'javascript': '18.15.0',
			'python': '3.10.0', 
			'java': '15.0.2',
			'cpp': '10.2.0',
			'c': '10.2.0',
			'go': '1.16.2',
			'rust': '1.68.2',
			'typescript': '5.0.3',
			'sql': '3.36.0', // SQLite version
			'csharp': '6.0.201',
			'php': '8.2.3',
			'ruby': '3.0.1'
		};
		
		return languageMap[language] || '1.0.0';
	}
	
	getFileName(language: string): string {
		const fileExtensions: Record<string, string> = {
			'javascript': 'main.js',
			'python': 'main.py',
			'java': 'Main.java',
			'cpp': 'main.cpp',
			'c': 'main.c',
			'go': 'main.go',
			'rust': 'main.rs',
			'typescript': 'main.ts',
			'sql': 'main.sql',
			'csharp': 'main.cs',
			'php': 'main.php',
			'ruby': 'main.rb'
		};
		
		return fileExtensions[language] || 'main.txt';
	}
	
	async runTestCases(code: string, language: string, testCases: TestCase[]): Promise<TestResult> {
		const results = {
			total_test_cases: testCases.length,
			test_cases_passed: 0,
			test_cases: [] as TestCaseResult[],
			execution_time: 0,
			memory_used: 0,
			error_message: null as string | null
		};
		
		try {
			for (let i = 0; i < testCases.length; i++) {
				const testCase = testCases[i];
				const input = JSON.stringify(testCase.input);
				
				const startTime = Date.now();
				
				const result = await this.executeCode({
					language: language === 'javascript' ? 'node' : language === 'sql' ? 'sqlite3' : language,
					version: this.getLanguageVersion(language),
					files: [{
						name: this.getFileName(language),
						content: this.wrapCodeForTesting(code, input, language)
					}],
					run_timeout: 5000,
					run_memory_limit: 128000000 // 128MB in bytes
				});
				
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				results.execution_time += executionTime;
				
				// Get actual output from Piston response
				const actualOutput = result.run.stdout.trim();
				const stderrOutput = result.run.stderr.trim();
				
				// Handle expected output formatting
				let expectedOutput: string;
				if (typeof testCase.output === 'string') {
					expectedOutput = testCase.output;
				} else {
					// For non-string expected outputs, stringify them
					expectedOutput = JSON.stringify(testCase.output);
				}
				
				// Normalize outputs for comparison
				const normalizedActual = this.normalizeOutput(actualOutput);
				const normalizedExpected = this.normalizeOutput(expectedOutput);
				
				// Check if test passed
				const passed = normalizedActual === normalizedExpected && stderrOutput === '';
				
				if (passed) {
					results.test_cases_passed++;
				}
				
				results.test_cases.push({
					id: i + 1,
					passed,
					time: `${executionTime}ms`,
					input: input,
					expected: expectedOutput,
					actual: actualOutput,
					stderr: stderrOutput
				});
			}
		} catch (error) {
			results.error_message = error instanceof Error ? error.message : 'Unknown error';
		}
		
		return results;
	}

	private normalizeOutput(output: string): string {
		// Remove extra whitespace and normalize common formatting
		return output
			.trim()
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.replace(/",\s*"/g, '","') // Normalize JSON comma spacing
			.replace(/\[\s+/g, '[') // Remove spaces after opening brackets
			.replace(/\s+\]/g, ']') // Remove spaces before closing brackets
			.replace(/{\s+/g, '{') // Remove spaces after opening braces
			.replace(/\s+}/g, '}'); // Remove spaces before closing braces - Keep case sensitive for better accuracy
	}
	
	private wrapCodeForTesting(code: string, input: string, language: string): string {
		switch (language) {
			case 'javascript':
				// Improved JavaScript function execution
				return `
// User's code
${code}

// Test execution wrapper
(function executeTest() {
    try {
        const input = ${input};
        const inputValues = Object.values(input);
        
        let result = null;
        let functionFound = false;
        
        // Strategy 1: Look for 'solution' function
        if (typeof solution !== 'undefined') {
            result = solution(...inputValues);
            functionFound = true;
        }
        
        // Strategy 2: Look for function declarations
        if (!functionFound) {
            const functionMatches = \`${code.replace(/'/g, "\\'")}\`.match(/function\\s+(\\w+)\\s*\\(/);
            if (functionMatches && functionMatches[1]) {
                const funcName = functionMatches[1];
                try {
                    if (typeof eval(funcName) === 'function') {
                        result = eval(funcName)(...inputValues);
                        functionFound = true;
                    }
                } catch (e) {
                    // Function might not be accessible in this scope
                }
            }
        }
        
        // Strategy 3: Look for const/let/var function assignments
        if (!functionFound) {
            const constMatches = \`${code.replace(/'/g, "\\'")}\`.match(/(const|let|var)\\s+(\\w+)\\s*=\\s*(?:function|\\(.*?\\)\\s*=>|\\w+\\s*=>)/);
            if (constMatches && constMatches[2]) {
                const funcName = constMatches[2];
                try {
                    if (typeof eval(funcName) === 'function') {
                        result = eval(funcName)(...inputValues);
                        functionFound = true;
                    }
                } catch (e) {
                    // Function might not be accessible in this scope
                }
            }
        }
        
        // Strategy 4: Try to find any function in global scope
        if (!functionFound && typeof global !== 'undefined') {
            for (const key in global) {
                try {
                    if (typeof global[key] === 'function' && 
                        !key.startsWith('_') && 
                        !['console', 'require', 'eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI'].includes(key)) {
                        result = global[key](...inputValues);
                        functionFound = true;
                        break;
                    }
                } catch (e) {
                    // Continue searching
                }
            }
        }
        
        // Output result
        if (functionFound) {
            if (result === null) {
                console.log('null');
            } else if (result === undefined) {
                console.log('undefined');
            } else {
                // Always stringify for consistent output format
                console.log(JSON.stringify(result));
            }
        } else {
            console.error('Error: No callable function found. Please define a function that can be called with the given inputs.');
        }
        
    } catch (error) {
        console.error('Execution error:', error.message);
    }
})();`;
			case 'python':
				return `
import json
import sys

${code}

# Test execution
try:
    input_data = json.loads('''${input.replace(/'/g, "\\'")}''')
    input_values = list(input_data.values())
    
    result = None
    function_found = False
    
    # Strategy 1: Try to call 'solution' function
    if 'solution' in globals():
        result = solution(*input_values)
        function_found = True
    else:
        # Strategy 2: Find any user-defined function
        for name, obj in globals().items():
            if (callable(obj) and 
                not name.startswith('_') and 
                name not in ['json', 'sys', 'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple']):
                try:
                    result = obj(*input_values)
                    function_found = True
                    break
                except Exception as e:
                    # Continue searching if this function doesn't work
                    continue
    
    # Output result
    if function_found:
        print(json.dumps(result))
    else:
        print('Error: No callable function found', file=sys.stderr)
        
except Exception as e:
    print(f'Error: {str(e)}', file=sys.stderr)
				`;
			case 'java':
				return `
import java.util.*;
import java.lang.reflect.*;

public class Main {
${code}

    public static void main(String[] args) {
        try {
            // Parse input - simplified approach
            String input = "${input.replace(/"/g, '\\"')}";
            
            // Try to find and call user-defined methods
            Class<?> clazz = Main.class;
            Method[] methods = clazz.getDeclaredMethods();
            
            boolean methodFound = false;
            Object result = null;
            
            for (Method method : methods) {
                String methodName = method.getName();
                if (!methodName.equals("main") && 
                    Modifier.isStatic(method.getModifiers()) &&
                    Modifier.isPublic(method.getModifiers())) {
                    
                    try {
                        // Simple parameter handling - this would need to be more sophisticated
                        Class<?>[] paramTypes = method.getParameterTypes();
                        
                        if (paramTypes.length == 1) {
                            if (paramTypes[0] == int.class) {
                                // Try to extract integer parameter
                                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"n\"\\s*:\\s*(\\d+)");
                                java.util.regex.Matcher matcher = pattern.matcher(input);
                                if (matcher.find()) {
                                    int param = Integer.parseInt(matcher.group(1));
                                    result = method.invoke(null, param);
                                    methodFound = true;
                                    break;
                                }
                            } else if (paramTypes[0] == int[].class) {
                                // Try to extract array parameter
                                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"nums\"\\s*:\\s*\\[(.*?)\\]");
                                java.util.regex.Matcher matcher = pattern.matcher(input);
                                if (matcher.find()) {
                                    String[] parts = matcher.group(1).split(",");
                                    int[] array = new int[parts.length];
                                    for (int i = 0; i < parts.length; i++) {
                                        array[i] = Integer.parseInt(parts[i].trim());
                                    }
                                    result = method.invoke(null, (Object) array);
                                    methodFound = true;
                                    break;
                                }
                            }
                        }
                    } catch (Exception e) {
                        // Continue to next method
                    }
                }
            }
            
            if (methodFound) {
                // Output result in JSON format
                if (result instanceof Boolean) {
                    System.out.println(((Boolean) result).toString().toLowerCase());
                } else {
                    System.out.println(result.toString());
                }
            } else {
                System.err.println("Error: No suitable method found to execute");
            }
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
				`;
			case 'cpp':
				return `
#include <iostream>
#include <string>
#include <vector>

${code}

int main() {
	try {
		// C++ test execution would need JSON parsing library
		// For now, just execute the code
		std::cout << "C++ execution" << std::endl;
	} catch (const std::exception& e) {
		std::cerr << "Error: " << e.what() << std::endl;
	}
	return 0;
}
				`;
			case 'sql':
				// For SQL, we'll create a simple setup with test data and run the query
				return `
-- Setup test data based on input
${this.generateSQLTestSetup(input)}

-- User's SQL query
${code}
				`;
			default:
				return code;
		}
	}

	private generateSQLTestSetup(input: string): string {
		// Parse input to create test tables
		try {
			const inputObj = JSON.parse(input);
			let setupSQL = '';
			
			// Create tables based on input structure
			Object.keys(inputObj).forEach(key => {
				const value = inputObj[key];
				if (Array.isArray(value) && value.length > 0) {
					// Create table for array data
					if (typeof value[0] === 'object') {
						// Array of objects - create table with columns
						const columns = Object.keys(value[0]).map(col => `${col} TEXT`).join(', ');
						setupSQL += `CREATE TABLE ${key} (${columns});\n`;
						
						// Insert data
						value.forEach(row => {
							const values = Object.values(row).map(v => `'${v}'`).join(', ');
							setupSQL += `INSERT INTO ${key} VALUES (${values});\n`;
						});
					} else {
						// Array of primitives - create simple table
						setupSQL += `CREATE TABLE ${key} (value TEXT);\n`;
						value.forEach(val => {
							setupSQL += `INSERT INTO ${key} VALUES ('${val}');\n`;
						});
					}
				}
			});
			
			return setupSQL;
		} catch {
			return '-- Could not parse input for SQL test setup\n';
		}
	}
}

export const pistonService = new PistonService();