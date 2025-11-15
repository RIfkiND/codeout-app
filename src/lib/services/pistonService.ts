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
		const response = await fetch(`${this.baseUrl}/execute`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(request)
		});
		
		if (!response.ok) {
			throw new Error('Failed to execute code');
		}
		
		return response.json();
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
			'typescript': '5.0.3'
		};
		
		return languageMap[language] || '1.0.0';
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
				const expectedOutput = JSON.stringify(testCase.output);
				
				const startTime = Date.now();
				
				const result = await this.executeCode({
					language: language === 'javascript' ? 'node' : language,
					version: this.getLanguageVersion(language),
					files: [{
						content: this.wrapCodeForTesting(code, input, language)
					}],
					run_timeout: 5000,
					run_memory_limit: 128000
				});
				
				const endTime = Date.now();
				const executionTime = endTime - startTime;
				results.execution_time += executionTime;
				
				const actualOutput = result.run.stdout.trim();
				const passed = actualOutput === expectedOutput.replace(/"/g, '');
				
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
					stderr: result.run.stderr
				});
			}
		} catch (error) {
			results.error_message = error instanceof Error ? error.message : 'Unknown error';
		}
		
		return results;
	}
	
	private wrapCodeForTesting(code: string, input: string, language: string): string {
		switch (language) {
			case 'javascript':
				return `
					${code}
					
					// Test execution
					try {
						const input = ${input};
						const result = twoSum ? twoSum(input.nums, input.target) : 
									  validParentheses ? validParentheses(input.s) :
									  maxSubArray ? maxSubArray(input.nums) :
									  null;
						console.log(JSON.stringify(result));
					} catch (error) {
						console.error(error.message);
					}
				`;
			case 'python':
				return `
import json

${code}

# Test execution
try:
	input_data = json.loads('${input}')
	# Try common function names
	result = None
	if 'twoSum' in globals():
		result = twoSum(input_data['nums'], input_data['target'])
	elif 'validParentheses' in globals():
		result = validParentheses(input_data['s'])
	elif 'maxSubArray' in globals():
		result = maxSubArray(input_data['nums'])
	
	print(json.dumps(result))
except Exception as e:
	print(f"Error: {str(e)}")
				`;
			default:
				return code;
		}
	}
}

export const pistonService = new PistonService();