import React from 'react';
import { Button } from 'antd';

interface Props {
  onClick: () => void;
}

export default (props: Props) => (
  <Button
    type='primary'
    icon='plus'
    size='large'
    className='fixed-bottom-button'
    onClick={props.onClick}
  />
);
