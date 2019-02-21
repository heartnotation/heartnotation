import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
import { Role } from '../utils';
// TODO

class Tags extends Component<AuthProps> {
  public render() {
    return (
      this.props.user.roles.map((r: Role) => r.name).includes('Admin') && (
        <AddButton
          onClick={() => {
            return;
          }}
        />
      )
    );
  }
}
export default withAuth(Tags);
