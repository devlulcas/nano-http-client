import type {
	CustomRequestInit,
	HttpClientOptions,
	HttpClientResult,
	RequestOptions,
	ResponseActions,
} from './types.js';

const Ok = <T>(data: T, response: Response): HttpClientResult<T> => ({
	ok: true,
	data,
	response,
});

const Err = <T>(error: HttpError): HttpClientResult<T> => ({
	ok: false,
	error,
});

/**
 * A custom error class that represents an error response from the server.
 * The response property contains the response from the server.
 */
class HttpError extends Error {
	constructor(public response?: Response) {
		super(response?.statusText);
	}
}

class NanoHttpClientBase {
	private requestInit: RequestInit;
	private baseUrl: string;
	private fetch: typeof fetch;
	private customErrorHandler?: (error: HttpError) => void;

	constructor(options: HttpClientOptions) {
		const { baseUrl, customErrorHandler, customFetch, ...requestInit } = options;

		this.baseUrl = baseUrl;
		this.requestInit = requestInit;
		this.fetch = customFetch ?? fetch;
		this.customErrorHandler = customErrorHandler;
	}

	/**
	 * Makes a request to the specified url.
	 * @param options options that override the default options and the url to make the request to
	 * @returns a promise that resolves to the result of the request
	 */
	public async request<T>(
		options: RequestOptions<T> = { method: 'GET', url: '/' },
	): Promise<HttpClientResult<T>> {
		const { actions, url, ...requestInit } = options;

		// Get the body from the request init
		const mergedRequestInit = this.mergeRequestInit(options);
		const body = this.getBody(mergedRequestInit);

		// Create a new URL object with the url and the baseUrl
		const urlObj = new URL(url, this.baseUrl);

		// Add the search parameters to the url
		const searchParams = this.getSearchParamsFromRequestInit(requestInit);
		urlObj.search = searchParams.toString();

		try {
			// Make the request
			const response = await this.fetch(urlObj, requestOptions);

			// If the request was successful, return the result
			if (response.ok) {
				return this.mapResponse<T>(response, actions);
			}

			// Sad path - the request was not successful
			const error = new HttpError(response);

			// If a custom error handler is provided, call it
			if (this.customErrorHandler) {
				this.customErrorHandler(error);
			}

			return Err(error);
		} catch (error) {
			return Err(new HttpError());
		}
	}

	/**
	 * Transforms the query parameters into a URLSearchParams object.
	 * @param requestInit a request init object
	 * @returns a URLSearchParams object that can be passed to the fetch api
	 */
	private getSearchParamsFromRequestInit(requestInit: CustomRequestInit): URLSearchParams {
		if (requestInit.searchParams instanceof URLSearchParams) return requestInit.searchParams;

		const searchParams = new URLSearchParams();

		for (const key in requestInit.searchParams) {
			searchParams.append(key, requestInit.searchParams[key]);
		}

		return searchParams;
	}

	/**
	 * Tranforms the body into a BodyInit object.
	 * @param requestInit a request init object
	 * @returns a BodyInit object that can be passed to the fetch api
	 */
	private getBody(requestInit: Pick<CustomRequestInit, "body" | "headers">): BodyInit | undefined {
		// Skip if body is already a valid BodyInit object
		if (
			requestInit.body instanceof FormData ||
			requestInit.body instanceof URLSearchParams ||
			typeof requestInit.body === 'string' ||
			typeof requestInit.body === 'undefined'
		) {
			return requestInit.body;
		}

		const contentType = new Headers(requestInit.headers).get('content-type') ?? '';

		if (contentType.includes('application/json') || contentType.includes('text/plain')) {
			return JSON.stringify(requestInit.body);
		}

		if (contentType.includes('multipart/form-data')) {
			return Object.entries(requestInit.body as Record<string, string>).reduce(
				(formData, [key, value]) => {
					formData.append(key, value);
					return formData;
				},
				new FormData(),
			);
		}

		if (contentType.includes('application/x-www-form-urlencoded')) {
			return new URLSearchParams(requestInit.body as Record<string, string>);
		}

		return undefined;
	}

	/**
	 * Merge the default request options with the options passed to the request method.
	 */
	private mergeRequestInit(options?: RequestOptions<unknown>): RequestOptions<unknown> {
		return {
			...this.requestInit,
			...options,
			method: options?.method ?? "GET",
			headers: {
				...this.requestInit.headers,
				...options?.headers,
			},
		};
	}

	/**
	 * Maps the response to the specified type.
	 * @param response response from the server
	 * @param actions actions to perform on the response
	 * @returns a promise that resolves to the result of the request
	 */
	private async mapResponse<T>(
		response: Response,
		actions?: ResponseActions<T>['actions'],
	): Promise<HttpClientResult<T>> {
		const contentType = response.headers?.get('content-type') ?? '';

		const data = contentType.includes('application/json')
			? await response.json()
			: await response.text();

		if (actions && actions.typeGuard && actions.typeGuard(data) === false) {
			return Err(new HttpError(response));
		}

		return Ok(data, response);
	}
}

export { NanoHttpClientBase, HttpError };
