import React, { useState } from 'react';
import { Drawer, Button, Icon } from 'antd';
import CommentChatAnnotation from '../chatAnnotation/CommentChatAnnotation';
import Message from '../../assets/images/Message';

interface Props {
  annotation_id: number;
}

export default (props: Props) => {
  const { annotation_id } = props;
  const [visible, setVisible] = useState(false);
  return (
    <div className='chat-drawer-container'>
      <Button
        type='primary'
        size='large'
        onClick={() => setVisible(true)}
        className='btn-space'
      >
        <Icon component={Message} />
        Comments
      </Button>
      <Drawer
        title='Annotation Comments'
        placement='right'
        width='512'
        closable={false}
        onClose={() => setVisible(false)}
        visible={visible}
      >
        <CommentChatAnnotation annotation_id={annotation_id} />
      </Drawer>
    </div>
  );
};
