import { describe, expectTypeOf, test } from 'vitest';
import { NanoHttpClient } from '../src';
import { PORT } from './mocks/data';

const client = new NanoHttpClient({
	baseUrl: `http://127.0.0.1:${PORT}`,
	headers: {
		'Content-Type': 'application/json', // transforms the body to JSON and sets the header
		Accept: 'application/json', // transforms the response to JSON and sets the header
	},
});

describe('nano-http-client against local api', async () => {
	test('should request all users at / and the data type should be unknown', async ({ expect }) => {
		const result = await client.get({
			url: '/',
		});

		console.log(result);

		expect(result.ok).toBe(true);

		if (result.ok) {
			expectTypeOf(result.data).toEqualTypeOf<unknown>();
		} else {
			throw new Error('This should be impossible - Result is not ok');
		}
	});

	test('should request all users at / and run the typeGuard, then the data type should be known', async ({
		expect,
	}) => {
		const result = await client.get({
			url: '/',
			actions: {
				typeGuard: (data): data is { users: { id: number; name: string }[] } => {
					return typeof data === 'object' && data !== null && 'users' in data;
				},
			},
		});

		expect(result.ok).toBe(true);

		if (result.ok) {
			expectTypeOf(result.data).toEqualTypeOf<{ users: { id: number; name: string }[] }>();
		} else {
			throw new Error('This should be impossible - Result is not ok');
		}
	});

	test('should request a single user at /search?id=1', async ({ expect }) => {
		const result = await client.get({
			url: '/search',
			searchParams: {
				id: '1',
			},
			actions: {
				typeGuard: (data): data is { user: { id: number; name: string } } => {
					return typeof data === 'object' && data !== null && 'user' in data;
				},
			},
		});

		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.data.user.id).toBe(1);
			expectTypeOf(result.data).toEqualTypeOf<{ user: { id: number; name: string } }>();
		} else {
			throw new Error('This should be impossible - Result is not ok');
		}
	});

	test('should create a user', async ({ expect }) => {
		const result = await client.post({
			url: '/',
			body: {
				id: 3,
				name: 'John Smith',
			},
			actions: {
				typeGuard: (data): data is { user: { id: number; name: string } } => {
					return typeof data === 'object' && data !== null && 'user' in data;
				},
			},
		});

		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.data.user.id).toBe(3);
			expectTypeOf(result.data).toEqualTypeOf<{ user: { id: number; name: string } }>();
		} else {
			throw new Error('This should be impossible - Result is not ok');
		}
	});

	test('should update a user', async ({ expect }) => {
		const result = await client.put({
			url: '/',
			body: {
				id: 1,
				name: 'Updated John Smith',
			},
			actions: {
				typeGuard: (data): data is { user: { id: number; name: string } } => {
					return typeof data === 'object' && data !== null && 'user' in data;
				},
			},
		});

		expect(result.ok).toBe(true);

		if (result.ok) {
			expect(result.data.user.name).toBe('Updated John Smith');
			expectTypeOf(result.data).toEqualTypeOf<{ user: { id: number; name: string } }>();
		} else {
			throw new Error('This should be impossible - Result is not ok');
		}
	});

	test('should delete a user', async ({ expect }) => {
		const result = await client.delete({
			url: '/1',
		});

		expect(result.ok).toBe(true);
	});
});
