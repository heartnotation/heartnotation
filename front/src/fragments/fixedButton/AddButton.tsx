import React, { Component } from 'react';
import { Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

interface Props extends RouteComponentProps {
  onClick: () => void;
}

const AddButton = (props: Props) => (
  <Button
    type='primary'
    icon='plus'
    size='large'
    className='fixed-bottom-button'
    onClick={props.onClick}
  />
);

export default withRouter(AddButton);
