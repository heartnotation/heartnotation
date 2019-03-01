import React, { Component } from 'react';
import { Comment, List, Input, Form, Button, Avatar } from 'antd';
import { api, AnnotationComment, AnnotationCommentPayload } from '../../utils';

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
  error: string;
}
interface Props {
  annotation_id: number;
}
class CommentChatAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      comments: [],
      currentComment: '',
      error: ''
    };
  }

  public componentDidMount = () => {
    api
      .getCommentsOnAnnotationById(this.props.annotation_id)
      .then((response: AnnotationComment[]) => {
        const commentList = response.map(element => ({
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
        }));
        this.setState({ comments: commentList });
      })
      .catch(() => {
        this.setState({ error: 'Fail to load previous comments' });
      });
  }

  public handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { currentComment, comments } = this.state;
    const { annotation_id } = this.props;
    if (!currentComment) {
      return;
    }
    const commentPayload: AnnotationCommentPayload = {
      annotation_id,
      comment: currentComment
    };
    api
      .sendAnnotationComment(commentPayload)
      .then((response: AnnotationComment) => {
        this.setState({
          currentComment: '',
          comments: [
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
            },
            ...comments
          ]
        });
      })
      .catch(err => this.setState({ error: err.data }));
  }

  public handleChange = (e: any) => {
    this.setState({
      currentComment: e.target.value
    });
  }

  public render() {
    const { comments, currentComment } = this.state;
    return (
      <div>
        <div className='comments-container'>
          {comments.length > 0 && <CommentList comments={comments} />}
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
                value={currentComment}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default CommentChatAnnotation;
