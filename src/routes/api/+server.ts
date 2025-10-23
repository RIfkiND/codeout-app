import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiDocs = {
		name: 'CodeOut API',
		version: '1.0.0',
		description: 'API for CodeOut application with authentication and code execution',
		endpoints: {
			authentication: {
				'POST /api/auth/login': {
					description: 'Initiate OAuth login with supported providers',
					body: { provider: 'google | github ' },
					response: 'Redirects to OAuth provider'
				},
				'POST /api/auth/logout': {
					description: 'Logout current user',
					response: 'Redirects to login page'
				},
				'GET /api/auth/user': {
					description: 'Get current user information',
					auth: 'required',
					response: 'User object with profile data'
				}
			},
			code: {
				'POST /api/code/execute': {
					description: 'Execute code using Piston API',
					auth: 'required',
					body: {
						language: 'string',
						version: 'string (optional)',
						code: 'string',
						input: 'string (optional)'
					},
					response: 'Execution result with output'
				},
				'GET /api/code/languages': {
					description: 'Get available programming languages',
					auth: 'required',
					response: 'Array of supported languages and versions'
				}
			},
			user: {
				'GET /api/user/profile': {
					description: 'Get user profile information',
					auth: 'required',
					response: 'User profile object'
				},
				'PUT /api/user/profile': {
					description: 'Update user profile',
					auth: 'required',
					body: { name: 'string' },
					response: 'Updated user object'
				}
			},
			system: {
				'GET /api/health': {
					description: 'Health check endpoint',
					response: 'System status and basic info'
				}
			}
		},
		authentication: {
			type: 'Supabase JWT',
			description: 'Authentication is handled via Supabase JWT tokens in cookies'
		}
	};

	return json(apiDocs);
};