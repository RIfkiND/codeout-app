import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './database.types';

export const createSupabaseLoadClient = () => {
	return createBrowserClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY
	);
};

export const createSupabaseServerClient = (fetch: typeof globalThis.fetch) => {
	return createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			global: { fetch },
			cookies: {
				getAll: () => {
					return [];
				},
				setAll: () => {
					// no-op
				}
			}
		}
	);
};

// Browser client for client-side usage
export const supabase = createSupabaseLoadClient();
