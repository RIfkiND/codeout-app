import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// This file exists to define the route and can be empty since data loading
	// is handled by +page.server.ts
	return {};
};