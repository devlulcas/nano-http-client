import {
	BaseHttpClient,
	CustomRequestInit,
	HttpClientOptions,
	HttpClientResult,
	ResponseActions,
} from './base-http-client.js';

type EndpointOptions<T> = Omit<CustomRequestInit, 'method'> & ResponseActions<T>;

export class HttpClient extends BaseHttpClient {
	constructor(options: HttpClientOptions) {
		super(options);
	}

	public async get<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'GET',
		});
	}

	public async post<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'POST',
		});
	}

	public async put<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'PUT',
		});
	}

	public async patch<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'PATCH',
		});
	}

	public async delete<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'DELETE',
		});
	}

	public async head<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'HEAD',
		});
	}

	public async options<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'OPTIONS',
		});
	}

	public async trace<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'TRACE',
		});
	}

	public async connect<T>(url: string, options?: EndpointOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>(url, {
			...options,
			method: 'CONNECT',
		});
	}
}
