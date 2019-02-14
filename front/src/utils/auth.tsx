import React from 'react';
import { User, API_URL } from '.';
import Axios from 'axios';

export interface AuthProps {
  user: User;
}

let user: User;

export const authenticate = (token: string): Promise<User> => {
  const form = new FormData();
  form.set('access_token', token);
  return Axios.post(`${API_URL}/auth/callback`, form, {
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
