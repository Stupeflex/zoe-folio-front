import { Token } from '@/api/types';

export const baseUrl = import.meta.env.VITE_API_URL;

export enum ApiRoots {
  default = '/api',
  auth = '/api/auth/local',
  admin = '/admin',
}

export enum Methods {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
}

export const apiUrl = baseUrl + ApiRoots.default;

export type Headers = Record<string, string>;

export interface ClientOptions {
  body?: Record<string, unknown> | string | FormData;
  headers?: Record<string, string>;
  method?: Methods;
}

/* eslint-disable prettier/prettier */
export const clientFactory =
  (apiRoot: ApiRoots) =>
  async (endpoint = '', options: ClientOptions = {}) => {
    const url = baseUrl + apiRoot + endpoint;
    try {
      const opts = {
        ...options,
        body: options?.body ? stringifyBody(options.body) : undefined,
      };
      const res = await fetch(url, opts);
      if (res.json && res.body) return await res.json();
      if (res.body) return res.body;
      return res;
    } catch (e) {
      console.error(e);
      throw new Error('client error on ' + url);
    }
  };
/* eslint-enable prettier/prettier */

export const authHeaders = (token: Token) => ({
  Authorization: `Bearer ${token}`,
});

export const stringifyBody = (
  data: Record<string, unknown> | string | FormData
): string | FormData => {
  return data instanceof FormData || typeof data === 'string'
    ? data
    : JSON.stringify(data);
};

export default clientFactory(ApiRoots.default);
export const authClient = clientFactory(ApiRoots.auth);
export const adminClient = clientFactory(ApiRoots.admin);

const mergeHeaders = (
  options: Record<string, unknown> = {},
  headers: Headers
) => {
  return {
    ...options,
    headers: {
      ...(options?.headers ? (options.headers as Headers) : {}),
      ...headers,
    },
  };
};

export const authenticatedGuard = async <T>(
  token: Token | undefined,
  cb: (token: Token) => Promise<T>,
  endpoint?: string
) => {
  if (token) {
    return await cb(token);
  }
  console.warn('Unauthenticated call to ' + endpoint);
  return null;
};

/* eslint-disable prettier/prettier */
export const authenticatedClientFactory =
  (apiRoot: ApiRoots = ApiRoots.default) =>
  (endpoint = '', maybeToken: Token | undefined, options = {}) =>
    authenticatedGuard(maybeToken, (token) =>
      clientFactory(apiRoot)(
        endpoint,
        mergeHeaders(options, authHeaders(token))
      )
    );
/* eslint-enable prettier/prettier */
