import React, { Component } from 'react';
import { Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {
  url: string;
}
/*
class AddButton extends Component<Props> {
  public handleClick = () => {
    const { history, url } = this.props;
    history.push(url);
  }

  public render() {
    return (
      <Button
        type='primary'
        icon='plus'
        size='large'
        className='fixed-bottom-button'
        onClick={this.handleClick}
      />
    );
  }
}
*/
const AddButton = (props: Props) => (
  <Button
    type='primary'
    icon='plus'
    size='large'
    className='fixed-bottom-button'
    onClick={() => props.history.push(props.url)}
  />
);

export default withRouter(AddButton);
