import type { PageData } from './$types';

export interface PageData {
	lobby: any;
	activeChallenge: any;
	submissions: any[];
	standings: any[];
	user: any;
	isParticipant: boolean;
	isOwner: boolean;
}