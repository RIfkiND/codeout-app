import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch, parent }) => {
	const { session } = await parent();
	
	if (!session) {
		throw error(401, 'Authentication required');
	}

	try {
		// Fetch the specific challenge
		const response = await fetch(`/api/challenges/${params.id}`);
		
		if (!response.ok) {
			if (response.status === 404) {
				throw error(404, 'Challenge not found');
			}
			throw error(response.status, 'Failed to load challenge');
		}
		
		const challenge = await response.json();
		
		return {
			challenge,
			session
		};
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load challenge');
	}
};