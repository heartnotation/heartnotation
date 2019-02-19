import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
// TODO

class Tags extends Component<AuthProps> {
  public render() {
    return (
      this.props.user.role.name === 'Admin' && (
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
