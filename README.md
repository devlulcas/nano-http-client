# MICRO API CLIENT

First, you need to instantiate the client with a base URL.

```ts
const client = new HttpClient({
	baseUrl: 'https://api.example.com',
});
```

By default, the client will use the `fetch` API to make requests. You can pass a custom fetch function to the client constructor.

```ts
const client = new HttpClient({
	baseUrl: 'https://api.example.com',
	customFetch: (url, options) => myCustomFetch(url, options),
});
```

Then you can use the client to make requests. The client has methods for all HTTP methods.

```ts
const getUsersResult = await client.get('/users');

const headUserResult = await client.head('/users/1');

const postUserResult = await client.post('/users', {
	body: { name: 'John' },
});

const putUserResult = await client.put('/users/1', {
	body: { name: 'John' },
});

const patchUserResult = await client.patch('/users/1', {
	body: { name: 'John' },
});

const deleteUserResult = await client.delete('/users/1');
```

You can pass a second argument to the request methods to configure the request.

```ts
const getUsersResult = await client.get('/users', {
	headers: {
		'X-Custom-Header': 'Custom value',
	},
	searchParams: {
		page: 1,
		limit: 10,
	},
	body: {
		name: 'John',
	},
});
```

The client will automatically serialize the body to JSON if the `Content-Type` header is set to `application/json`.
You can pass this header in the HttpClient constructor or in the request options.

```ts
const postUserResult = await client.post('/users', {
	headers: {
		'Content-Type': 'application/json',
	},
	body: {
		name: 'John',
	},
});
```

The client will automatically parse the response body if the `Content-Type` header is set to `application/json`.
You can pass this header in the HttpClient constructor or in the request options.

```ts
const getUsersResult = await client.get('/users', {
	headers: {
		Accept: 'application/json',
	},
});
```

By default the client will not throw on error results.

```ts
// Safe interface - Does not throw, returns a result object with status code and data or error
const result = await client.get('/users'); // { ok: true, data: unknown } | { ok: false, error: HttpError }

if (result.ok) {
	// result.data is unknown, you need to pass a type guard to narrow it down or use a type assertion
	console.log(result.data); // { id: 1, name: 'John' }
} else {
	// result.error is an HttpError object with status code and data
	console.log(result.error); // { status: 404, data: { message: 'Not found' } }
}
```

We don't have opinions on how you do your type assertions, but we recommend using a type guard.

```ts
// Result<{ ok: true, data: User[] }, { ok: false, error: HttpError }>
const result = await client.get('/users', {
	actions: {
		// Type guard for the result data
		typeGuard: (data: unknown): data is User[] =>
			Array.isArray(data) && data.every((item) => typeof item === 'object'),
	},
});

if (result.ok) {
	// result.data is User[]
	console.log(result.data);
} else {
	// result.error is CustomError
	console.log(result.error);
}
```

You can also pass a custom error handler to the client constructor.

```ts
const client = new HttpClient({
	baseUrl: 'https://api.example.com',
	customErrorHandler: (error) => {
		console.log("I'm a custom error handler", error);
	},
});
```

You can also just do a raw request with the `request` method.

```ts
const result = await client.request('/users', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
	},
	body: {
		name: 'John',
	},
});
```
