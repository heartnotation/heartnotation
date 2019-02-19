import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
import { withRouter, RouteComponentProps } from 'react-router';
// TODO

interface Props extends RouteComponentProps, AuthProps {}

class Tags extends Component<Props> {
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
export default withRouter(withAuth(Tags));
