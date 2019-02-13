import React, { Component } from 'react';
import { Comment, Tooltip, List, Input, Form, Button, Avatar } from 'antd';
import moment from 'moment';
/*
const data = [
  {
    author: 'Podologs Member',
    avatar:
      'http://www.podiatrestmichel.com/wp-content/uploads/2017/02/pied-dathlete.jpg',
    content: <p>Tkt mm pa on é la team de iep, on vous marche dessus frere</p>,
    datetime: (
      <Tooltip
        title={moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD HH:mm:ss')}
      >
        <span>
          {moment()
            .subtract(1, 'days')
            .fromNow()}
        </span>
      </Tooltip>
    )
  },
  {
    author: 'Cloche Pied',
    avatar:
      'http://www.minutefacile.com/wp-content/uploads/2018/05/01CC010404675196-c1-photo-pied-jpg.jpg',
    content: (
      <p>
        This annotation is our first one, this is a dope application developed
        by Podologs. I appreciate how easy it is to use every tools. Would
        definitely recommend to other podologists.
      </p>
    ),
    datetime: (
      <Tooltip
        title={moment()
          .subtract(4, 'days')
          .format('YYYY-MM-DD HH:mm:ss')}
      >
        <span>
          {moment()
            .subtract(4, 'days')
            .fromNow()}
        </span>
      </Tooltip>
    )
  }
];
*/

const TextArea = Input.TextArea;

const CommentList = (props: { comments: DataComment[] }) => (
  <List
    dataSource={props.comments}
    header={`${props.comments.length} ${
      props.comments.length > 1 ? 'replies' : 'reply'
    }`}
    itemLayout='horizontal'
    renderItem={(p: any) => <Comment {...p} />}
  />
);
/*
const Editor = (
  onChange: (e: any) => void,
  onSubmit: any,
  submitting: boolean,
  value: string
) */

const Editor = (props: {
  onChange: (e: any) => void;
  onSubmit: () => void;
  value: string;
}) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={props.onChange} value={props.value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType='submit' onClick={props.onSubmit} type='primary'>
        Add Comment
      </Button>
    </Form.Item>
  </div>
);

interface DataComment {
  author: string;
  content: any;
}
interface State {
  comments: DataComment[];
  value: string;
}

class CommentChatAnnotation extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      comments: [],
      value: ''
    };
  }

  public handleSubmit = () => {
    if (!this.state.value) {
      return;
    }
    console.log({ comments: this.state.value });
    this.setState({
      value: '',
      comments: [
        {
          author: 'Yann Yolo',
          content: <p>{this.state.value}</p>
        },
        ...this.state.comments
      ]
    });
  }

  public handleChange = (e: any) => {
    this.setState({
      value: e.target.value
    });
  }

  public render() {
    const { comments, value } = this.state;
    console.log(comments);
    return (
      <div>
        {comments.length > 0 && <CommentList comments={comments} />}
        <Comment
          avatar={
            <Avatar
              src='https://storenotrefamilleprod.blob.core.windows.net/images/cms/article/16731/16731_large.jpg'
              alt='Podologs'
            />
          }
          content={
            <Editor
              onChange={this.handleChange}
              onSubmit={this.handleSubmit}
              value={value}
            />
          }
        />
      </div>
    );
  }
}

export default CommentChatAnnotation;
