import { NanoHttpClientBase } from './base.js';
import { HttpClientOptions, HttpClientResult, SpecificRequestOptions } from './types.js';

export class NanoHttpClient extends NanoHttpClientBase {
	constructor(options: HttpClientOptions) {
		super(options);
	}

	public async get<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'GET',
		});
	}

	public async post<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'POST',
		});
	}

	public async put<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'PUT',
		});
	}

	public async patch<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'PATCH',
		});
	}

	public async delete<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'DELETE',
		});
	}

	public async head<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'HEAD',
		});
	}

	public async options<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'OPTIONS',
		});
	}

	public async trace<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'TRACE',
		});
	}

	public async connect<T>(options: SpecificRequestOptions<T>): Promise<HttpClientResult<T>> {
		return this.request<T>({
			...options,
			method: 'CONNECT',
		});
	}
}
