import { HttpClient } from './src/index.js';

const client = new HttpClient({ baseUrl: 'https://api.github.com' });

type User = {
	id: number;
};

export const result = await client.get('/users/octocat', {
	actions: {
		typeGuard: (data): data is User => true,
	},
});
