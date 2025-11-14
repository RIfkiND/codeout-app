import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	
	if (!user) {
		throw new Error('Authentication required');
	}

	// Check if user has admin role
	const { data: userData } = await locals.supabase
		.from('users')
		.select('role')
		.eq('id', user.id)
		.single();

	if (userData?.role !== 'admin') {
		throw new Error('Admin access required');
	}

	// Fetch all challenge templates
	const { data: templates, error: templatesError } = await locals.supabase
		.from('challenge_templates')
		.select(`
			*,
			created_by_user:users!challenge_templates_created_by_fkey (
				id,
				name
			)
		`)
		.order('created_at', { ascending: false });

	if (templatesError) {
		console.error('Templates fetch error:', templatesError);
	}

	// Fetch programming languages
	const { data: languages, error: languagesError } = await locals.supabase
		.from('programming_languages')
		.select('*')
		.eq('is_active', true)
		.order('display_name');

	if (languagesError) {
		console.error('Languages fetch error:', languagesError);
	}

	// Fetch template statistics
	const { count: totalTemplates } = await locals.supabase
		.from('challenge_templates')
		.select('*', { count: 'exact', head: true });

	const { count: publicTemplates } = await locals.supabase
		.from('challenge_templates')
		.select('*', { count: 'exact', head: true })
		.eq('is_public', true);

	return {
		templates: templates || [],
		languages: languages || [],
		stats: {
			total: totalTemplates || 0,
			public: publicTemplates || 0,
			private: (totalTemplates || 0) - (publicTemplates || 0)
		}
	};
}) satisfies PageServerLoad;