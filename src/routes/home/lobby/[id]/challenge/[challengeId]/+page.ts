export async function load({ params, parent }) {
	const data = await parent();
	
	return {
		challengeId: params.challengeId,
		lobbyId: params.id,
		...data
	};
}