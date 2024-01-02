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

const Err = <T>(error: NanoHttpClientError): HttpClientResult<T> => ({
  ok: false,
  error,
});

/**
 * A custom error class that represents an error response from the server.
 * The response property contains the response from the server.
 */
export class NanoHttpClientError extends Error {
  constructor(public override message: string, public response?: Response) {
    super(message ?? response?.statusText ?? 'Unknown error');
  }
}

export class NanoHttpClientBase {
  private baseURL: URL;
  private defaultRequestInit: RequestInit;

  constructor({ baseURL, ...requestInit }: HttpClientOptions) {
    this.baseURL = baseURL;
    this.defaultRequestInit = requestInit;
  }

  /**
   * Makes a request to the specified url.
   * @param options options that override the default options and the url to make the request to
   * @returns a promise that resolves to the result of the request
   */
  public async request<T>(
    options: RequestOptions<T> = { method: 'GET', pathname: '/' }
  ): Promise<HttpClientResult<T>> {
    const {
      pathname,
      method,
      actions,
      body,
      searchParams,
      headers,
      ...requestInit
    } = options;

    // Merge the headers if they are passed to the request method
    const mergedHeaders = headers
      ? mergeHeaders(this.defaultRequestInit.headers ?? {}, headers)
      : this.defaultRequestInit.headers;

    // Get the body from the request init
    const serializedBody = this.getBody({ body, headers });

    // Create a new URL object with the url and the baseURL
    const urlObj = new URL(pathname, this.baseURL);

    // Add the search parameters to the url
    urlObj.search = this.getSearchParams({ searchParams }).toString();

    try {
      // Make the request
      const response = await fetch(urlObj, {
        ...this.defaultRequestInit,
        ...requestInit,
        method,
        body: serializedBody,
        headers,
      });

      // If the request was successful, return the result
      if (response.ok) {
        return this.mapResponse<T>(response, actions);
      }

      // Sad path - the request was not successful
      throw new NanoHttpClientError(
        'Request failed: ' + response.status,
        response
      );
    } catch (error) {
      if (error instanceof NanoHttpClientError) {
        throw error;
      }

      const newError = new NanoHttpClientError('Request failed');

      if (error instanceof NanoHttpClientError || error instanceof Error) {
        newError.stack =
          newError.stack?.split('\n').slice(0, 2).join('\n') +
          '\n' +
          error.stack;
      } else {
        newError.stack =
          newError.stack?.split('\n').slice(0, 2).join('\n') +
          '\n' +
          String(error);
      }

      return Err(newError);
    }
  }

  /**
   * Transforms the query parameters into a URLSearchParams object.
   * @param requestInit a request init object
   * @returns a URLSearchParams object that can be passed to the fetch api
   */
  private getSearchParams(
    requestInit: Pick<CustomRequestInit, 'searchParams'>
  ): URLSearchParams {
    if (requestInit.searchParams instanceof URLSearchParams)
      return requestInit.searchParams;

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
  private getBody(
    requestInit: Pick<CustomRequestInit, 'body' | 'headers'>
  ): BodyInit | undefined {
    // Skip if body is already a valid BodyInit object
    if (
      requestInit.body instanceof FormData ||
      requestInit.body instanceof URLSearchParams ||
      requestInit.body instanceof ReadableStream ||
      requestInit.body instanceof Blob ||
      requestInit.body instanceof ArrayBuffer ||
      typeof requestInit.body === 'string' ||
      typeof requestInit.body === 'undefined'
    ) {
      return requestInit.body;
    }

    const headers = new Headers(requestInit.headers);
    const contentType = headers.get('content-type') ?? '';

    if (
      contentType.includes('application/json') ||
      contentType.includes('text/plain')
    ) {
      return JSON.stringify(requestInit.body);
    }

    if (contentType.includes('multipart/form-data')) {
      return Object.entries(requestInit.body as Record<string, string>).reduce(
        (formData, [key, value]) => {
          formData.append(key, value);
          return formData;
        },
        new FormData()
      );
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      return new URLSearchParams(requestInit.body as Record<string, string>);
    }

    if (contentType.includes('text/html')) {
      return String(requestInit.body);
    }

    return undefined;
  }

  /**
   * Maps the response to the specified type.
   * @param response response from the server
   * @param actions actions to perform on the response
   * @returns a promise that resolves to the result of the request
   */
  private async mapResponse<T>(
    response: Response,
    actions?: ResponseActions<T>['actions']
  ): Promise<HttpClientResult<T>> {
    const contentType =
      response.headers.get('content-type') ?? 'application/json';

    // Parse the response
    const data = await (contentType.includes('application/json')
      ? response.json()
      : response.text());

    // If the response is not of the specified type, return an error
    if (actions?.typeGuard && !actions.typeGuard(data)) {
      return Err(new NanoHttpClientError("TypeGuard didn't pass", response));
    }

    return Ok(data, response);
  }
}

function mergeHeaders(...sources: HeadersInit[]) {
  const result: Record<string, string> = {};

  for (const source of sources) {
    if (!(source !== null && typeof source === 'object')) {
      throw new TypeError('All header arguments must be of type object');
    }

    const headers: Headers = new Headers(source);

    const headersEntries = Object.entries(headers);

    for (const [key, value] of headersEntries) {
      if (value === undefined) {
        delete result[key];
      } else {
        result[key] = value;
      }
    }
  }

  return new Headers(result);
}
