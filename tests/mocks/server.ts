import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { FakeRemoteService, PORT } from '../mocks/data.js';

const app = new Hono();

const fakeRemoteService = new FakeRemoteService();

app.get('/', async (c) => {
	const users = fakeRemoteService.getUsers();
	console.log(users);
	return c.json({ users });
});

app.get('/search', async (c) => {
	const id = Number(c.req.query('id'));
	return c.json({ user: fakeRemoteService.getUser(id) });
});

app.post('/', async (c) => {
	const user = await c.req.json();
	return c.json({ user: fakeRemoteService.createUser(user) });
});

app.put('/', async (c) => {
	const user = await c.req.json();
	return c.json({ user: fakeRemoteService.updateUser(user) });
});

app.delete('/:id', async (c) => {
	const id = Number(c.req.param('id'));
	fakeRemoteService.deleteUser(id);
	return c.json({ message: 'User deleted' });
});

serve({ fetch: app.fetch, port: PORT });

console.log(`Server listening on port ${PORT}`);
