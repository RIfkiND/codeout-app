/**
 * AI Service for code analysis and improvement suggestions
 */

export interface AIAnalysisResult {
	score: number; // 0-100
	suggestions: Suggestion[];
	codeQuality: {
		readability: number;
		performance: number;
		maintainability: number;
		bestPractices: number;
	};
	summary: string;
}

export interface Suggestion {
	type: 'improvement' | 'warning' | 'error' | 'optimization';
	line?: number;
	message: string;
	description?: string;
	severity: 'low' | 'medium' | 'high';
}

export interface CodeExecutionResult {
	success: boolean;
	output?: string;
	error?: string;
	testResults?: TestResult[];
	executionTime?: number;
}

export interface TestResult {
	passed: boolean;
	input: unknown;
	expected: unknown;
	actual: unknown;
	name?: string;
}

/**
 * Analyzes code and provides AI-powered feedback
 */
export async function analyzeCode(
	code: string, 
	language: string = 'javascript',
	challengeId?: string
): Promise<AIAnalysisResult> {
	try {
		const response = await fetch('/api/ai/analyze', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				code,
				language,
				challengeId
			})
		});

		if (!response.ok) {
			throw new Error(`AI analysis failed: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('AI analysis error:', error);
		// Fallback analysis
		return generateFallbackAnalysis(code, language);
	}
}

/**
 * Runs code with test cases and returns execution results
 */
export async function executeCodeWithTests(
	code: string,
	language: string = 'javascript',
	challengeId?: string
): Promise<CodeExecutionResult> {
	try {
		const response = await fetch('/api/code/execute', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				code,
				language,
				challengeId
			})
		});

		if (!response.ok) {
			throw new Error(`Code execution failed: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Code execution error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Execution failed'
		};
	}
}

/**
 * Fallback analysis when AI service is unavailable
 */
function generateFallbackAnalysis(code: string, language: string): AIAnalysisResult {
	const suggestions: Suggestion[] = [];
	let score = 70;

	// Basic static analysis
	if (code.length < 10) {
		suggestions.push({
			type: 'warning',
			message: 'Code is very short - consider adding more implementation',
			severity: 'medium'
		});
		score -= 20;
	}

	if (language === 'javascript' || language === 'typescript') {
		// Check for console.log (basic check)
		if (code.includes('console.log')) {
			suggestions.push({
				type: 'improvement',
				message: 'Consider removing console.log statements in production code',
				severity: 'low'
			});
		}

		// Check for var usage
		if (code.includes('var ')) {
			suggestions.push({
				type: 'improvement',
				message: 'Use let or const instead of var for better scoping',
				severity: 'medium'
			});
			score -= 10;
		}

		// Check for function declarations
		if (!code.includes('function') && !code.includes('=>')) {
			suggestions.push({
				type: 'warning',
				message: 'No functions detected - consider organizing code into functions',
				severity: 'medium'
			});
		}
	}

	// Basic readability checks
	const lines = code.split('\n');
	const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
	
	if (avgLineLength > 100) {
		suggestions.push({
			type: 'improvement',
			message: 'Some lines are quite long - consider breaking them up for better readability',
			severity: 'low'
		});
	}

	return {
		score: Math.max(score, 20),
		suggestions,
		codeQuality: {
			readability: Math.max(score - 10, 20),
			performance: Math.max(score, 20),
			maintainability: Math.max(score - 5, 20),
			bestPractices: Math.max(score - 15, 20)
		},
		summary: suggestions.length > 0 
			? `Found ${suggestions.length} improvement suggestions. Focus on ${suggestions[0].message.toLowerCase()}`
			: 'Code looks good! Consider adding more functionality or optimizations.'
	};
}

/**
 * Get suggestions based on common programming patterns
 */
export function getPatternSuggestions(code: string, language: string): Suggestion[] {
	const suggestions: Suggestion[] = [];

	if (language === 'javascript' || language === 'typescript') {
		// Check for common patterns
		if (code.includes('for (let i = 0')) {
			suggestions.push({
				type: 'optimization',
				message: 'Consider using modern array methods like forEach, map, or filter',
				description: 'Modern JavaScript provides more readable and functional alternatives to traditional for loops',
				severity: 'low'
			});
		}

		if (code.includes('== ') && !code.includes('=== ')) {
			suggestions.push({
				type: 'improvement',
				message: 'Use strict equality (===) instead of loose equality (==)',
				description: 'Strict equality prevents unexpected type coercion',
				severity: 'medium'
			});
		}
	}

	return suggestions;
}