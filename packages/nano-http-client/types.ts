import type { NanoHttpClientError } from './base.js';

/**
 * A custom RequestInit interface that allows for the `searchParams` property and the `body` property to be of type `Record<string, any>`.
 */
export type CustomRequestInit = Omit<RequestInit, 'searchParams' | 'body' | 'method' | "headers"> & {
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
	headers?: Headers
	searchParams?: Record<string, any> | URLSearchParams;
	body?: Record<string, any> | BodyInit;
};

/**
 * A simplified RequestInit interface that only contains the properties that can be passed to the HttpClient constructor.
 */
export type HttpClientOptionsRequestInit = Pick<
	RequestInit,
	'headers' | 'cache' | 'credentials' | 'integrity' | 'keepalive' | 'mode' | 'redirect' | 'referrer' | 'referrerPolicy'
>;

/**
 * Options that can be passed to the HttpClient constructor.
 * Every request will use these options unless overridden.
 * The `baseURL` option is the only required option. Every other option is based on the RequestInit interface from the Fetch Api.
 * You can pass a custom fetch function to the `customFetch` option. This can be useful for testing.
 */
export type HttpClientOptions = {
	baseURL: URL;
} & HttpClientOptionsRequestInit;

/**
 * The successful result of a HttpClient request.
 */
export type HttpClientSuccessfulResult<T> = {
	data: T;
	response: Response;
};

/**
 * The error result of a HttpClient request.
 */
export type HttpClientErrorResult = {
	error: NanoHttpClientError;
};

/**
 * The result of a HttpClient request. The `ok` property indicates whether the request was successful or not.
 */
export type HttpClientResult<T> =
	| ({ ok: true } & HttpClientSuccessfulResult<T>)
	| ({ ok: false } & HttpClientErrorResult);

/**
 * Actions that can be performed on a response.
 */
export type ResponseActions<T> = {
	actions?: {
		typeGuard: (data: unknown) => data is T;
	};
};

/**
 * Options that can be passed to the request method.
 */
export type RequestOptions<T> = CustomRequestInit & ResponseActions<T> & { pathname: string };

/**
 * Options that can be passed to the request method when the method is known.
 */
export type SpecificRequestOptions<T> = Omit<RequestOptions<T>, 'method'>;
