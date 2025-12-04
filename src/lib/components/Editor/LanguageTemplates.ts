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
			template_code: `function solution() {
    // Your code here
    return null;
}`,
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
			template_code: `def solution():
    # Your code here
    return None`,
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
			template_code: `public class Solution {
    public Object solution() {
        // Your code here
        return null;
    }
}`,
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
			template_code: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    auto solution() {
        // Your code here
        return nullptr;
    }
};`,
			is_active: true
		},
		{
			id: 'typescript',
			name: 'typescript',
			display_name: 'TypeScript',
			file_extension: '.ts',
			monaco_language_id: 'typescript',
			piston_language: 'typescript',
			piston_version: '5.0.3',
			template_code: `function solution(): any {
    // Your code here
    return null;
}`,
			is_active: true
		},
		{
			id: 'go',
			name: 'go',
			display_name: 'Go',
			file_extension: '.go',
			monaco_language_id: 'go',
			piston_language: 'go',
			piston_version: '1.16.2',
			template_code: `package main

import "fmt"

func solution() interface{} {
    // Your code here
    return nil
}

func main() {
    result := solution()
    fmt.Println(result)
}`,
			is_active: true
		},
		{
			id: 'rust',
			name: 'rust',
			display_name: 'Rust',
			file_extension: '.rs',
			monaco_language_id: 'rust',
			piston_language: 'rust',
			piston_version: '1.68.2',
			template_code: `fn solution() -> Option<i32> {
    // Your code here
    None
}

fn main() {
    let result = solution();
    println!("{:?}", result);
}`,
			is_active: true
		},
		{
			id: 'csharp',
			name: 'csharp',
			display_name: 'C#',
			file_extension: '.cs',
			monaco_language_id: 'csharp',
			piston_language: 'csharp',
			piston_version: '6.12.0',
			template_code: `using System;

public class Solution 
{
    public object SolutionMethod() 
    {
        // Your code here
        return null;
    }
    
    public static void Main() 
    {
        Solution solution = new Solution();
        var result = solution.SolutionMethod();
        Console.WriteLine(result);
    }
}`,
			is_active: true
		},
		{
			id: 'php',
			name: 'php',
			display_name: 'PHP',
			file_extension: '.php',
			monaco_language_id: 'php',
			piston_language: 'php',
			piston_version: '8.2.3',
			template_code: `<?php

function solution() {
    // Your code here
    return null;
}

// Test the function
$result = solution();
var_dump($result);

?>`,
			is_active: true
		},
		{
			id: 'c',
			name: 'c',
			display_name: 'C',
			file_extension: '.c',
			monaco_language_id: 'c',
			piston_language: 'c',
			piston_version: '10.2.0',
			template_code: `#include <stdio.h>
#include <stdlib.h>

int solution() {
    // Your code here
    return 0;
}

int main() {
    int result = solution();
    printf("%d\\n", result);
    return 0;
}`,
			is_active: true
		},
		{
			id: 'sql',
			name: 'sql',
			display_name: 'SQL',
			file_extension: '.sql',
			monaco_language_id: 'sql',
			piston_language: 'sqlite3',
			piston_version: '3.36.0',
			template_code: `-- Write your SQL query here
-- Example: SELECT * FROM table_name WHERE condition;

`,
			is_active: true
		}
	];
}

export async function getTemplate(languageName: string, challengeId?: string): Promise<string> {
	// If we have a challengeId, try to get challenge-specific template
	if (challengeId) {
		try {
			const response = await fetch(`/api/templates?challengeId=${challengeId}&language=${languageName}`);
			if (response.ok) {
				const data = await response.json();
				if (data.success && data.template) {
					return data.template;
				}
			}
		} catch (error) {
			console.warn('Failed to fetch challenge-specific template:', error);
		}
	}

	// Fallback to language default template
	const languages = await fetchLanguages();
	const language = languages.find(l => l.name === languageName || l.display_name === languageName);
	return language?.template_code || 'function solution() {\n    // Your code here\n    return null;\n}';
}

export async function getMonacoLanguage(languageName: string): Promise<string> {
	const languages = await fetchLanguages();
	const language = languages.find(l => l.name === languageName || l.display_name === languageName);
	return language?.monaco_language_id || 'javascript';
}