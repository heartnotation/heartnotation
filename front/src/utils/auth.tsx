import React from 'react';
import { User, API_URL } from '.';
import Axios from 'axios';

interface AuthProps {
  user: User;
}

let user: User;

export const authenticate = () => {
  return Axios.get<{ user: User; token: string }>(`${API_URL}/login`).then(
    res => res.data
  );
};

export const withAuth = () => <OriginalProps extends {}>(
  Component:
    | React.ComponentClass<OriginalProps & AuthProps>
    | React.StatelessComponent<OriginalProps & AuthProps>
) => {
  type ResultProps = OriginalProps & AuthProps;
  const authComponent = class AuthorizedComponent extends React.Component<
    ResultProps
  > {
    public static displayName = `withAuth(${Component.displayName})`;
    constructor(props: ResultProps) {
      super(props);
      this.state = {
        user: undefined
      };
    }
    public render = () => <Component {...this.props} user={user} />;
  };
  return authComponent;
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
