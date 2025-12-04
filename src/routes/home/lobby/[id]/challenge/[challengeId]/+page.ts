import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params, parent }: { params: Record<string, string>; parent: () => Promise<unknown> }) => {
	const data = await parent();
	
	return {
		challengeId: params.challengeId,
		lobbyId: params.id,
		...data
	};
}