import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { FakeRemoteService, PORT } from '../mocks/data.js';

const app = new Hono();

const fakeRemoteService = new FakeRemoteService();

app.get('/', async (c) => {
	return c.json({ users: await fakeRemoteService.getUsers() });
});

app.get('/search', async (c) => {
	const id = Number(c.req.query('id'));
	return c.json({ user: await fakeRemoteService.getUser(id) });
});

app.post('/', async (c) => {
	console.log(c.req);
	const user = await c.req.json().catch((e) => {
		console.log(e);
		return {};
	});
	return c.json({ user: await fakeRemoteService.createUser(user) });
});

app.put('/', async (c) => {
	const user = await c.req.json();
	return c.json({ user: await fakeRemoteService.updateUser(user) });
});

app.delete('/:id', async (c) => {
	const id = Number(c.req.param('id'));
	await fakeRemoteService.deleteUser(id);
	return c.json({ message: 'User deleted' });
});

app.post('/reset', async (c) => {
	await fakeRemoteService.reset();
	return c.json({ message: 'Database reset' });
})

serve({ fetch: app.fetch, port: PORT });

console.log(`Server listening on port ${PORT}`);
