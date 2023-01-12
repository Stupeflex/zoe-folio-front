import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginAsAdmin } from '@/api/admin';
import { AdminUser, Token } from '@/api/types';

type LoginSuccessCallback = (credentials: {
  user: AdminUser;
  token: Token;
}) => void;
type ErrorCallback = (reason: string) => void;

interface CallbackOptions {
  onSuccess?: LoginSuccessCallback;
  onError?: ErrorCallback;
}

export interface Credentials {
  email: string;
  password: string;
}

const storeLoginInfo = ({ token, user }: { token: Token; user: AdminUser }) => {
  console.log(token);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const getStoredLoginInfo = (): { token: Token; user: AdminUser } | null => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  console.log(user, token);
  if (user && token)
    return {
      user: JSON.parse(user) as AdminUser,
      token: token as Token,
    };
  return null;
};

const deleteStoredLoginInfo = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const useAdminData = defineStore('adminData', () => {
  const token = ref<string>();
  const user = ref<AdminUser>();
  const previousRoute = ref<string>();

  const login = async (
    credentials: Credentials,
    options: CallbackOptions = {}
  ) => {
    const response = await loginAsAdmin(credentials);
    console.log(response);
    if (response.user === null || response.token === null) {
      console.log('error');
      options.onError && options.onError(response.error.message);
      return response.error;
    }
    token.value = response.token;
    user.value = response.user;
    storeLoginInfo(response);
    options.onSuccess && options.onSuccess(response);
    return response;
  };

  const isLoggedIn = (): boolean => {
    if (token.value && user.value) return true;
    const stored = getStoredLoginInfo();
    console.log(stored);
    if (stored !== null) {
      token.value = stored.token;
      user.value = stored.user;
      return true;
    }
    return false;
  };

  const setPreviousRoute = (route: string) => {
    previousRoute.value = route;
  };

  const logout = () => {
    token.value = undefined;
    user.value = undefined;
    deleteStoredLoginInfo();
  };

  return {
    token,
    user,
    previousRoute,
    login,
    logout,
    isLoggedIn,
    setPreviousRoute,
  };
});
