import React, { Component } from 'react';
import {
  Comment,
  Tooltip,
  List,
  Input,
  Form,
  Button,
  Avatar,
  Layout
} from 'antd';
import {
  AnnotationCommentPayload,
  AnnotationComment
} from '../../utils/objects';
import { api } from '../../utils';

const { Header, Footer, Content } = Layout;

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

const Editor = (props: {
  onChange: (e: any) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  value: string;
}) => (
  <Form onSubmit={props.onSubmit}>
    <Form.Item>
      <TextArea rows={4} onChange={props.onChange} value={props.value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType='submit' type='primary'>
        Add Comment
      </Button>
    </Form.Item>
  </Form>
);

interface DataComment {
  author: string;
  content: any;
  avatar: any;
  datetime: any;
}
interface State {
  comments: DataComment[];
  currentComment: string;
}
interface Props {
  annotation_id: number;
}
class CommentChatAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      comments: [],
      currentComment: ''
    };
  }

  public componentDidMount = () => {
    api
      .getCommentsOnAnnotationById(this.props.annotation_id)
      .then((response: AnnotationComment[]) => {
        const commentList: DataComment[] = [];
        response.forEach(element => {
          commentList.push({
            author: element.user.mail,
            avatar: (
              <Avatar
                style={{ backgroundColor: 'orange', verticalAlign: 'middle' }}
                size='large'
              >
                {element.user.mail[0].toUpperCase()}
              </Avatar>
            ),
            content: <p>{element.comment}</p>,
            datetime: element.date.toLocaleString()
          });
        });
        this.setState({ comments: commentList });
      });
  }

  public handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!this.state.currentComment) {
      return;
    }
    const commentPayload: AnnotationCommentPayload = {
      annotation_id: this.props.annotation_id,
      comment: this.state.currentComment
    };
    api
      .sendAnnotationComment(commentPayload)
      .then((response: AnnotationComment) => {
        this.setState({
          currentComment: '',
          comments: [
            ...this.state.comments,
            {
              author: response.user.mail,
              avatar: (
                <Avatar
                  style={{ backgroundColor: 'orange', verticalAlign: 'middle' }}
                  size='large'
                >
                  {response.user.mail[0].toUpperCase()}
                </Avatar>
              ),
              content: <p>{response.comment}</p>,
              datetime: response.date.toLocaleString()
            }
          ]
        });
      });
  }

  public handleChange = (e: any) => {
    this.setState({
      currentComment: e.target.value
    });
  }

  public render() {
    return (
      <div>
        <div className='comments-container'>
          {this.state.comments.length > 0 && (
            <CommentList comments={this.state.comments} />
          )}
        </div>
        <div>
          <Comment
            avatar={
              <Avatar
                style={{ backgroundColor: 'orange', verticalAlign: 'middle' }}
                size='large'
              />
            }
            content={
              <Editor
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
                value={this.state.currentComment}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default CommentChatAnnotation;
