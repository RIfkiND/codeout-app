import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { AIAnalysisResult, Suggestion } from '$lib/services/aiService';

// OpenAI integration - add your API key to environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_AI_SERVICE = !!OPENAI_API_KEY;

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { code, language = 'javascript', challengeId } = await request.json();

		if (!code || code.trim().length === 0) {
			return json({
				error: 'Code is required'
			}, { status: 400 });
		}

		// Get user for personalized analysis (optional)
		const { data: { user } } = await locals.supabase.auth.getUser();

		// Use real AI if available, otherwise fallback to static analysis
		const analysis = USE_AI_SERVICE 
			? await analyzeCodeWithOpenAI(code, language, challengeId, user?.id)
			: await analyzeCodeWithStaticAnalysis(code, language, challengeId, user?.id);

		return json(analysis);
	} catch (error) {
		console.error('AI analysis error:', error);
		return json({
			error: 'Failed to analyze code'
		}, { status: 500 });
	}
};

/**
 * Real AI integration using OpenAI GPT-4
 */
async function analyzeCodeWithOpenAI(
	code: string, 
	language: string, 
	challengeId?: string,
	userId?: string
): Promise<AIAnalysisResult> {
	try {
		const prompt = `Analyze this ${language} code for a coding challenge. Provide detailed feedback on:
1. Code quality and readability
2. Performance optimizations
3. Best practices
4. Potential bugs or issues
5. Overall score (0-100)

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object containing:
- score (number 0-100)
- suggestions (array of {type, message, description, severity, line?})
- codeQuality ({readability, performance, maintainability, bestPractices})
- summary (string)`;

		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'gpt-4',
				messages: [{
					role: 'system',
					content: 'You are an expert code reviewer. Provide detailed, constructive feedback in JSON format.'
				}, {
					role: 'user',
					content: prompt
				}],
				temperature: 0.7,
				max_tokens: 1500
			})
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content;
		
		if (!content) {
			throw new Error('No response from OpenAI');
		}

		// Parse AI response
		try {
			const aiAnalysis = JSON.parse(content);
			return {
				score: Math.min(Math.max(aiAnalysis.score || 70, 0), 100),
				suggestions: (aiAnalysis.suggestions || []).map((s: unknown) => ({
					type: (s as {type?: string}).type || 'improvement',
					message: (s as {message?: string}).message || 'No message',
					description: (s as {description?: string}).description,
					severity: (s as {severity?: string}).severity || 'low',
					line: (s as {line?: number}).line
				})),
				codeQuality: aiAnalysis.codeQuality || {
					readability: 70,
					performance: 70,
					maintainability: 70,
					bestPractices: 70
				},
				summary: aiAnalysis.summary || 'AI analysis completed'
			};
		} catch {
			// If JSON parsing fails, use static analysis as fallback
			return analyzeCodeWithStaticAnalysis(code, language, challengeId, userId);
		}

	} catch (error) {
		console.error('OpenAI analysis error:', error);
		// Fallback to static analysis
		return analyzeCodeWithStaticAnalysis(code, language, challengeId, userId);
	}
}

/**
 * Static code analysis fallback when AI service is unavailable
 */
async function analyzeCodeWithStaticAnalysis(
	code: string, 
	language: string, 
	challengeId?: string,
	userId?: string
): Promise<AIAnalysisResult> {
	// Suppress unused parameter warnings - kept for future use
	void challengeId;
	void userId;
	
	const suggestions: Suggestion[] = [];
	let baseScore = 80;

	// Language-specific analysis
	if (language === 'javascript' || language === 'typescript') {
		const jsAnalysis = analyzeJavaScript(code);
		suggestions.push(...jsAnalysis.suggestions);
		baseScore = Math.min(baseScore, jsAnalysis.score);
	} else if (language === 'python') {
		const pyAnalysis = analyzePython(code);
		suggestions.push(...pyAnalysis.suggestions);
		baseScore = Math.min(baseScore, pyAnalysis.score);
	}

	// General code quality checks
	const generalAnalysis = analyzeGeneral(code);
	suggestions.push(...generalAnalysis.suggestions);
	baseScore = Math.min(baseScore, generalAnalysis.score);

	// Calculate quality metrics
	const codeQuality = calculateQualityMetrics(code, language, suggestions);
	
	// Generate summary
	const summary = generateSummary(baseScore, suggestions);

	return {
		score: Math.max(baseScore, 20),
		suggestions,
		codeQuality,
		summary
	};
}

function analyzeJavaScript(code: string): { suggestions: Suggestion[], score: number } {
	const suggestions: Suggestion[] = [];
	let score = 80;

	// Check for modern syntax
	if (code.includes('var ')) {
		suggestions.push({
			type: 'improvement',
			message: 'Use let or const instead of var',
			description: 'Modern JavaScript recommends let/const for better scoping',
			severity: 'medium'
		});
		score -= 10;
	}

	// Check for arrow functions vs regular functions
	const regularFunctionCount = (code.match(/function\s+\w+/g) || []).length;
	const arrowFunctionCount = (code.match(/=>\s*{?/g) || []).length;
	
	if (regularFunctionCount > arrowFunctionCount && arrowFunctionCount === 0) {
		suggestions.push({
			type: 'improvement',
			message: 'Consider using arrow functions for conciseness',
			description: 'Arrow functions provide cleaner syntax for simple functions',
			severity: 'low'
		});
	}

	// Check for equality operators
	if (code.includes('==') && !code.includes('===')) {
		suggestions.push({
			type: 'improvement',
			message: 'Use strict equality (===) instead of loose equality (==)',
			description: 'Strict equality prevents unexpected type coercion',
			severity: 'medium'
		});
		score -= 5;
	}

	// Check for console statements
	if (code.includes('console.log')) {
		suggestions.push({
			type: 'warning',
			message: 'Remove console.log statements in production',
			description: 'Debug statements should be removed from final code',
			severity: 'low'
		});
	}

	// Check for error handling
	if (code.includes('try') || code.includes('catch')) {
		suggestions.push({
			type: 'improvement',
			message: 'Good use of error handling!',
			description: 'Try-catch blocks improve code reliability',
			severity: 'low'
		});
		score += 5;
	}

	return { suggestions, score };
}

function analyzePython(code: string): { suggestions: Suggestion[], score: number } {
	const suggestions: Suggestion[] = [];
	const baseScore = 80;

	// Check for PEP 8 compliance (basic)
	const lines = code.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.length > 79) {
			suggestions.push({
				type: 'improvement',
				line: i + 1,
				message: 'Line too long (PEP 8 recommends max 79 characters)',
				description: 'Break long lines for better readability',
				severity: 'low'
			});
		}
	}

	// Check for list comprehensions vs loops
	if (code.includes('for ') && code.includes('append(')) {
		suggestions.push({
			type: 'optimization',
			message: 'Consider using list comprehension instead of append in loop',
			description: 'List comprehensions are more Pythonic and often faster',
			severity: 'medium'
		});
	}

	// Check for f-strings
	if (code.includes('.format(') || code.includes('% ')) {
		suggestions.push({
			type: 'improvement',
			message: 'Consider using f-strings for string formatting',
			description: 'F-strings are more readable and performant in Python 3.6+',
			severity: 'low'
		});
	}

	return { suggestions, score: baseScore };
}

function analyzeGeneral(code: string): { suggestions: Suggestion[], score: number } {
	const suggestions: Suggestion[] = [];
	let score = 80;

	// Check code length
	if (code.length < 20) {
		suggestions.push({
			type: 'warning',
			message: 'Code seems very short',
			description: 'Consider adding more implementation or comments',
			severity: 'medium'
		});
		score -= 15;
	}

	// Check for comments
	const commentCount = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
	if (commentCount === 0 && code.length > 100) {
		suggestions.push({
			type: 'improvement',
			message: 'Add comments to explain complex logic',
			description: 'Comments help other developers understand your code',
			severity: 'low'
		});
		score -= 5;
	}

	// Check for long lines
	const lines = code.split('\n');
	const longLines = lines.filter(line => line.length > 120);
	if (longLines.length > 0) {
		suggestions.push({
			type: 'improvement',
			message: 'Some lines are quite long',
			description: 'Consider breaking long lines for better readability',
			severity: 'low'
		});
		score -= 5;
	}

	// Check for nested complexity
	const openBraces = (code.match(/{/g) || []).length;
	if (openBraces > 5) {
		suggestions.push({
			type: 'improvement',
			message: 'High code complexity detected',
			description: 'Consider extracting functions to reduce nesting',
			severity: 'medium'
		});
		score -= 10;
	}

	return { suggestions, score };
}

function calculateQualityMetrics(
	code: string, 
	language: string, 
	suggestions: Suggestion[]
): AIAnalysisResult['codeQuality'] {
	const errorCount = suggestions.filter(s => s.severity === 'high').length;
	const warningCount = suggestions.filter(s => s.severity === 'medium').length;
	const infoCount = suggestions.filter(s => s.severity === 'low').length;

	const baseScore = 80;
	const errorPenalty = errorCount * 15;
	const warningPenalty = warningCount * 8;
	const infoPenalty = infoCount * 3;

	const adjustedScore = Math.max(baseScore - errorPenalty - warningPenalty - infoPenalty, 20);

	return {
		readability: Math.max(adjustedScore - (code.split('\n').some(line => line.length > 120) ? 10 : 0), 20),
		performance: Math.max(adjustedScore - (suggestions.some(s => s.type === 'optimization') ? 5 : 0), 20),
		maintainability: Math.max(adjustedScore - (errorCount * 10), 20),
		bestPractices: Math.max(adjustedScore - (warningCount * 5), 20)
	};
}

function generateSummary(score: number, suggestions: Suggestion[]): string {
	if (score >= 90) {
		return 'Excellent code quality! Your implementation follows best practices and is well-structured.';
	} else if (score >= 75) {
		const mainIssue = suggestions.find(s => s.severity === 'high' || s.severity === 'medium');
		return mainIssue 
			? `Good code overall. Focus on: ${mainIssue.message.toLowerCase()}`
			: 'Good code quality with room for minor improvements.';
	} else if (score >= 50) {
		const issueCount = suggestions.filter(s => s.severity === 'high' || s.severity === 'medium').length;
		return `Code needs improvement. Address ${issueCount} key issues for better quality.`;
	} else {
		return 'Significant improvements needed. Review the suggestions to enhance code quality.';
	}
}