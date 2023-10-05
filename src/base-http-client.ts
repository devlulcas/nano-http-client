/**
 * A custom error class that represents an error response from the server.
 * The response property contains the response from the server.
 */
export class HttpError extends Error {
	constructor(public response?: Response) {
		super(response?.statusText);
	}
}

/**
 * A custom RequestInit interface that allows for the `searchParams` property and the `body` property to be of type `Record<string, any>`.
 */
export type CustomRequestInit = Omit<RequestInit, 'searchParams' | 'body'> & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	searchParams?: Record<string, any> | URLSearchParams;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	body?: Record<string, any> | FormData | URLSearchParams | string;
};

/**
 * A simplified RequestInit interface that only contains the properties that can be passed to the HttpClient constructor.
 */
export type CommonRequestInit = Pick<
	RequestInit,
	| 'headers'
	| 'cache'
	| 'credentials'
	| 'integrity'
	| 'keepalive'
	| 'mode'
	| 'redirect'
	| 'referrer'
	| 'referrerPolicy'
>;

/**
 * Options that can be passed to the HttpClient constructor.
 * Every request will use these options unless overridden.
 * The `baseUrl` option is the only required option. Every other option is based on the RequestInit interface from the Fetch Api.
 * You can pass a custom fetch function to the `customFetch` option. This can be useful for testing.
 */
export type HttpClientOptions = {
	baseUrl: string;
	customFetch?: typeof fetch;
	customErrorHandler?: (error: HttpError) => void;
} & CommonRequestInit;

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
	error: HttpError;
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
		typeGuard?: (data: unknown) => data is T;
		mapOk?: <MT>(data: T) => MT;
		mapError?: <ME>(error: HttpError) => ME;
	};
};

export class BaseHttpClient {
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
	private getBodyFromRequestInit(requestInit: CustomRequestInit): BodyInit | undefined {
		// Skip if body is already a valid BodyInit object
		if (
			requestInit.body instanceof FormData ||
			requestInit.body instanceof URLSearchParams ||
			typeof requestInit.body === 'string' ||
			requestInit.body === undefined
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
	private mergeRequestInit(options?: RequestInit): RequestInit {
		return {
			...this.requestInit,
			...options,
			headers: {
				...this.requestInit.headers,
				...options?.headers,
			},
		};
	}

	private async mapResponse<T>(
		response: Response,
		actions?: ResponseActions<T>['actions'],
	): Promise<HttpClientResult<T>> {
		const shouldParseAsJson = response.headers?.get('content-type')?.includes('application/json');

		const data = shouldParseAsJson ? await response.json() : await response.text();

		if (actions) {
			let mappedData = data;

			if (actions.typeGuard && !actions.typeGuard(data)) {
				return {
					ok: false,
					error: new HttpError(response),
				};
			}

			if (actions.mapOk) {
				mappedData = actions.mapOk(data);
			}

			return {
				ok: true,
				data: mappedData,
				response,
			};
		}

		return {
			ok: true,
			data,
			response,
		};
	}

	/**
	 * Makes a request to the specified url.
	 * @param url the url to make the request to
	 * @param options options that override the default options
	 * @returns a promise that resolves to the result of the request
	 */
	public async request<T>(
		url: string,
		options?: CustomRequestInit & ResponseActions<T>,
	): Promise<HttpClientResult<T>> {
		const { actions, ...requestInit } = options ?? {};

		// Get the body from the request init
		const body = this.getBodyFromRequestInit(requestInit);
		const requestOptions = this.mergeRequestInit({ ...requestInit, body });

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

			const error = new HttpError(response);

			// If a custom error handler is provided, call it
			if (this.customErrorHandler) {
				this.customErrorHandler(error);
			}

			return {
				ok: false,
				error: actions?.mapError ? actions.mapError(error) : error,
			};
		} catch (error) {
			return {
				ok: false,
				error: new HttpError(),
			};
		}
	}
}
