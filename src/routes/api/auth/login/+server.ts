import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SUPPORTED_PROVIDERS = ['google', 'github'] as const;
type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		const { provider } = await request.json();

		if (!provider) {
			return json({ error: 'Provider is required' }, { status: 400 });
		}

		if (!SUPPORTED_PROVIDERS.includes(provider)) {
			return json(
				{
					error: `Unsupported provider. Supported providers: ${SUPPORTED_PROVIDERS.join(', ')}`
				},
				{ status: 400 }
			);
		}

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: provider as SupportedProvider,
			options: {
				redirectTo: `${url.origin}/auth/callback`,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				}
			}
		});

		if (error) {
			console.error('OAuth error:', error);
			return json({ error: error.message }, { status: 400 });
		}

		return json({
			url: data.url,
			message: 'OAuth URL generated successfully'
		});
	} catch (error) {
		console.error('Login API error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Login failed'
			},
			{ status: 500 }
		);
	}
};
