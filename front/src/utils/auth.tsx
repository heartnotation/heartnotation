import React from 'react';
import { User, API_URL } from '.';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface AuthProps {
  user: User;
}

let user: User;

axios.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (config.url && !config.url.includes('auth')) {
      const jwt = localStorage.getItem('auth_token');
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  }
);

axios.interceptors.response.use(
  request => request,
  error => {
    if (error.request !== undefined) {
      if (error.request.responseURL.includes('login')) {
        return Promise.reject(error);
      }
    }
  }
);

export const authenticate = (token: string): Promise<User> => {
  const form = new FormData();
  form.set('access_token', token);
  return axios
    .post(`${API_URL}/auth/callback`, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(res => res.data)
    .then(auth => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('auth_token', auth.token);
      return auth.user;
    })
    .catch(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_token');
    });
};

export const withAuth = <OriginalProps extends AuthProps>(
  Component: React.ComponentType<OriginalProps>
): React.SFC<
  Pick<OriginalProps, Exclude<keyof OriginalProps, keyof AuthProps>>
> => (
  props: Pick<OriginalProps, Exclude<keyof OriginalProps, keyof AuthProps>>
) => {
  Component.displayName = `withAuth(${Component.displayName})`;
  return <Component {...props as OriginalProps} user={user} />;
};

export class Authenticated extends React.Component<AuthProps> {
  constructor(props: AuthProps) {
    super(props);
    user = props.user;
  }
  public render = () => {
    return this.props.children;
  }
}
