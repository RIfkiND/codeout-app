// Language templates from database
export interface ProgrammingLanguage {
	id: string;
	name: string;
	display_name: string;
	file_extension: string;
	monaco_language_id: string;
	piston_language: string;
	piston_version: string;
	template_code: string;
	is_active: boolean;
}

let languageCache: ProgrammingLanguage[] = [];
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchLanguages(): Promise<ProgrammingLanguage[]> {
	if (languageCache.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
		return languageCache;
	}

	try {
		const response = await fetch('/api/languages');
		if (!response.ok) throw new Error('Failed to fetch languages');
		
		const data = await response.json();
		languageCache = data.languages || [];
		cacheTime = Date.now();
		
		return languageCache;
	} catch (error) {
		console.error('Error fetching languages:', error);
		return getDefaultLanguages();
	}
}

export function getDefaultLanguages(): ProgrammingLanguage[] {
	return [
		{
			id: 'javascript',
			name: 'javascript',
			display_name: 'JavaScript',
			file_extension: '.js',
			monaco_language_id: 'javascript',
			piston_language: 'javascript',
			piston_version: '18.15.0',
			template_code: 'function solution() {\n    // Your code here\n    return null;\n}',
			is_active: true
		},
		{
			id: 'python',
			name: 'python',
			display_name: 'Python',
			file_extension: '.py',
			monaco_language_id: 'python',
			piston_language: 'python',
			piston_version: '3.10.0',
			template_code: 'def solution():\n    # Your code here\n    return None',
			is_active: true
		},
		{
			id: 'java',
			name: 'java',
			display_name: 'Java',
			file_extension: '.java',
			monaco_language_id: 'java',
			piston_language: 'java',
			piston_version: '15.0.2',
			template_code: 'public class Solution {\n    public Object solution() {\n        // Your code here\n        return null;\n    }\n}',
			is_active: true
		},
		{
			id: 'cpp',
			name: 'cpp',
			display_name: 'C++',
			file_extension: '.cpp',
			monaco_language_id: 'cpp',
			piston_language: 'cpp',
			piston_version: '10.2.0',
			template_code: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    auto solution() {\n        // Your code here\n        return nullptr;\n    }\n};',
			is_active: true
		}
	];
}

export async function getTemplate(languageName: string): Promise<string> {
	const languages = await fetchLanguages();
	const language = languages.find(l => l.name === languageName || l.display_name === languageName);
	return language?.template_code || 'function solution() {\n    // Your code here\n    return null;\n}';
}

export async function getMonacoLanguage(languageName: string): Promise<string> {
	const languages = await fetchLanguages();
	const language = languages.find(l => l.name === languageName || l.display_name === languageName);
	return language?.monaco_language_id || 'javascript';
}