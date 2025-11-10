import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get available languages for templates
	const { data: languages } = await locals.supabase
		.from('programming_languages')
		.select('id, name, display_name, template_code')
		.eq('is_active', true)
		.order('display_name');

	return {
		languages: languages || []
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		try {
			const { session, user } = await locals.safeGetSession();
			if (!session || !user) {
				return fail(401, { error: 'Authentication required' });
			}

			// Verify admin role
			const { data: userData } = await locals.supabase
				.from('users')
				.select('role')
				.eq('id', user.id)
				.single();

			if (!userData || userData.role !== 'admin') {
				return fail(403, { error: 'Admin access required' });
			}

			const formData = await request.formData();
			
			// Parse test cases
			let testCases;
			try {
				testCases = JSON.parse(formData.get('test_cases')?.toString() || '[]');
			} catch {
				return fail(400, { error: 'Invalid test cases format' });
			}

			// Prepare challenge data for the API
			const challengeData = {
				title: formData.get('title')?.toString(),
				description: formData.get('description')?.toString(),
				difficulty: formData.get('difficulty')?.toString(),
				time_limit: parseInt(formData.get('time_limit')?.toString() || '1000'),
				memory_limit: parseInt(formData.get('memory_limit')?.toString() || '256'),
				tags: formData.get('tags')?.toString()?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
				starter_code: formData.get('starter_code')?.toString() || '',
				solution_explanation: formData.get('solution_code')?.toString() || '', // Store solution as explanation
				testcases: testCases,
				is_global: true // Admin creates global challenges
			};

			// Validate required fields
			if (!challengeData.title || !challengeData.description || !challengeData.difficulty) {
				return fail(400, { error: 'Title, description, and difficulty are required' });
			}

			// Use the existing API endpoint
			const response = await fetch(`${locals.url?.origin || 'http://localhost:5173'}/api/challenges`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session.access_token}`
				},
				body: JSON.stringify(challengeData)
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, { error: result.error || 'Failed to create challenge' });
			}

			throw redirect(303, `/admin/challenges`);
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			console.error('Challenge creation error:', error);
			return fail(500, { error: 'Failed to create challenge' });
		}
	}
};