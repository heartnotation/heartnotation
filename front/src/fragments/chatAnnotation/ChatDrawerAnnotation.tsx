import React, { Component } from 'react';
import { Drawer, Button } from 'antd';
import CommentChatAnnotation from '../chatAnnotation/CommentChatAnnotation';

class ChatDrawerAnnotation extends Component {
  public state = { visible: false };

  public showDrawer = () => {
    this.setState({
      visible: true
    });
  }

  public onClose = () => {
    this.setState({
      visible: false
    });
  }

  public render() {
    return (
      <div className='chat-drawer-container'>
        <Button
          type='primary'
          icon='message'
          size='large'
          onClick={this.showDrawer}
          className='btn-space btn-heartnotation-primary'
        >
          Comments
        </Button>
        <Drawer
          title='Annotation Comments'
          placement='right'
          width='512'
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <CommentChatAnnotation />
        </Drawer>
      </div>
    );
  }
}

export default ChatDrawerAnnotation;
