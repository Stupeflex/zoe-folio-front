import { Credentials } from '@/store/adminData';
import { authClient, Methods } from '@/api/client';
import { AdminUser, ApiError, Token } from '@/api/types';

interface LoginResponse {
  user?: AdminUser;
  jwt?: Token;
  error?: ApiError;
}

export const loginAsAdmin = async (
  credentials: Credentials
): Promise<
  | {
      user: AdminUser;
      token: Token;
    }
  | {
      user: null;
      token: null;
      error: ApiError;
    }
> =>
  authClient('', {
    method: Methods.post,
    body: JSON.stringify({
      identifier: credentials.email,
      password: credentials.password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response: LoginResponse) => {
      if (response.user !== undefined && response.jwt !== undefined) {
        return { user: response.user, token: response.jwt };
      }
      return {
        user: null,
        token: null,
        error: response.error ?? {
          details: {},
          message: 'Unknown Login Error',
          name: 'LoginError',
          status: 500,
        },
      };
    })
    .catch((e) => {
      console.error(e);
      return {
        user: null,
        token: null,
        error: {
          details: {},
          message: 'Invalid credentials',
          name: 'LoginError',
          status: 400,
        },
      };
    });
