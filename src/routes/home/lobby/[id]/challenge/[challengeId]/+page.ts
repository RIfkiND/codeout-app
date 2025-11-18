import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent, url }) => {
	const data = await parent();
	
	return {
		challengeId: params.challengeId,
		lobbyId: params.id,
		...data
	};
}) satisfies PageServerLoad;