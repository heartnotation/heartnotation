import React, { Component } from 'react';
import {
  Form,
  Icon,
  Tabs,
  Select,
  Modal,
  Button,
  List,
  Comment,
  Avatar,
  message
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RouteComponentProps, withRouter } from 'react-router';
import { Tag, api, Annotation } from '../../utils';
import {
  Interval,
  IntervalPayload,
  IntervalCommentPayload,
  IntervalComment
} from '../../utils/objects';
import TextArea from 'antd/lib/input/TextArea';

interface Props extends FormComponentProps, RouteComponentProps {
  start: number | undefined;
  end: number | undefined;
  clickedInterval: Interval | undefined;
  annotation: Annotation;
  selectors: string[];
  confirmCreate: (interval: Interval) => void;
  confirmDelete: (interval: Interval) => void;
  confirmCancel: (interval: Interval) => void;
}

interface DataComment {
  author: string;
  content: any;
  avatar: any;
  datetime: any;
}

interface State {
  tags: Tag[];
  confirmLoading: boolean;
  comments: DataComment[];
  textAreaComment: string;
  selectedTags: number[];
  error: string;
  currentInterval?: Interval;
}

const CommentList = (props: { comments: DataComment[] }) => (
  <div>
    <List
      dataSource={props.comments}
      header={`${props.comments.length} ${
        props.comments.length > 1 ? 'replies' : 'reply'
      }`}
      itemLayout='horizontal'
      renderItem={(p: any) => <Comment {...p} />}
    />
  </div>
);

class FormIntervalSignalAnnotation extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tags: [],
      confirmLoading: false,
      comments: [],
      textAreaComment: '',
      selectedTags: [],
      error: ''
    };
  }

  public handleCommentSubmit = () => {
    if (!this.state.textAreaComment) {
      return;
    }
    if (this.state.currentInterval === undefined) {
      message.error(
        'Comment submission failed because interval is not correctly identified',
        5
      );
      return;
    }
    const intervalCommentPayload: IntervalCommentPayload = {
      interval_id: this.state.currentInterval.id,
      comment: this.state.textAreaComment
    };
    api
      .sendIntervalComment(intervalCommentPayload)
      .then((response: IntervalComment) => {
        this.setState({
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
            ...this.state.comments
          ],
          textAreaComment: ''
        });
        if (this.state.currentInterval) {
          this.state.currentInterval.comments.push(response);
        }
      })
      .catch(err => {
        this.setState({ error: err.data });
      });
  }

  public handleChangeWriteComment = (e: any) => {
    this.setState({
      textAreaComment: e.target.value
    });
  }

  public handleSubmit = (e: any) => {
    this.setState({ confirmLoading: true });
    if (this.state.currentInterval === undefined) {
      message.error(
        'Tag submission failed because interval is not correctly identified',
        5
      );
      return;
    }

    api
      .sendIntervalTags({
        tags: this.state.selectedTags,
        interval_id: this.state.currentInterval.id
      })
      .then(tags => {
        this.setState({ confirmLoading: false });
        this.props.confirmCreate({ ...this.state.currentInterval!, tags });
      })
      .catch(err => {
        this.setState({ error: err.data });
      });
  }

  public handleDelete = () => {
    if (this.state.currentInterval) {
      api.deleteInterval(this.state.currentInterval);
      this.props.confirmDelete(this.state.currentInterval);
    }
  }

  public handleCancel = () => {
    this.props.confirmCancel({ ...this.state.currentInterval! });
  }

  public handleChangeSelectTags = (values: number[]) => {
    this.setState({ selectedTags: values });
  }

  public componentDidMount = () => {
    if (this.props.clickedInterval) {
      let datacomments: DataComment[] = [];
      let tags: number[] = [];
      if (this.props.clickedInterval.comments) {
        datacomments = this.props.clickedInterval.comments.map(
          (comment: IntervalComment) => {
            return {
              author: comment.user.mail,
              avatar: (
                <Avatar
                  style={{ backgroundColor: 'orange', verticalAlign: 'middle' }}
                  size='large'
                >
                  {comment.user.mail[0].toUpperCase()}
                </Avatar>
              ),
              content: <p>{comment.comment}</p>,
              datetime: comment.date.toLocaleString()
            };
          }
        );
      } else {
        this.props.clickedInterval.comments = [];
      }
      if (this.props.clickedInterval.tags) {
        tags = this.props.clickedInterval.tags.map((tag: Tag) => tag.id);
      }
      this.setState({
        comments: datacomments,
        selectedTags: tags,
        currentInterval: this.props.clickedInterval
      });
    } else if (this.props.start && this.props.end) {
      const intervalPayload: IntervalPayload = {
        annotation_id: this.props.annotation.id,
        time_start: Math.round(this.props.start),
        time_end: Math.round(this.props.end)
      };
      api
        .sendInterval(intervalPayload)
        .then(response => {
          response.comments = [];
          this.setState({ currentInterval: response });
        })
        .catch(err => this.setState({ error: err }));
    }
    this.setState({ tags: this.props.annotation.tags });
  }

  public componentDidUpdate = () => {
    this.state.selectedTags.forEach((x: number) => {
      const t = document.getElementById(String(x));
      if (
        t !== null &&
        t.parentNode !== null &&
        t.parentNode.parentNode !== null
      ) {
        const grandparents: HTMLElement = t.parentNode
          .parentNode as HTMLElement;
        grandparents.style.color = '#ffffff';
        grandparents.style.borderColor = '#ffffff';
        grandparents.style.borderWidth = '1px';
        grandparents.style.backgroundColor = String(t.dataset.color);
      }
    });
  }

  public render() {
    const TabPane = Tabs.TabPane;
    const Option = Select.Option;
    const { tags } = this.state;
    const tagValues = tags.map((val: Tag) => (
      <Option key={val.name} value={val.id} style={{ color: val.color }}>
        <span id={String(val.id)} data-color={val.color}>
          {val.name}
        </span>
      </Option>
    ));

    return (
      <div className='popup-comment-tag-container'>
        <Modal
          visible={true}
          onOk={this.handleSubmit}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form>
            <Tabs defaultActiveKey='1'>
              <TabPane
                tab={
                  <span>
                    <Icon type='tags' />
                    Tags
                  </span>
                }
                key='1'
              >
                {!this.props.clickedInterval && (
                  <p className='text-center'>
                    Tags to assignate to annotation task{' '}
                    {this.props.annotation.id} in interval between{' '}
                    {this.props.start} and {this.props.end} :
                  </p>
                )}
                {this.props.clickedInterval && (
                  <p className='text-center'>
                    Tags to assignate to annotation task{' '}
                    {this.props.clickedInterval.annotation_id} in interval
                    between <b>{this.props.clickedInterval.time_start} ms</b>{' '}
                    and <b>{this.props.clickedInterval.time_end} ms</b> :
                  </p>
                )}
                <Select
                  mode='multiple'
                  style={{ width: '100%' }}
                  placeholder='Please select'
                  onChange={this.handleChangeSelectTags}
                  value={this.state.selectedTags}
                >
                  {tagValues}
                </Select>
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <Icon type='form' />
                    Comments
                  </span>
                }
                key='2'
              >
                <div className='modal-comments-container'>
                  {this.state.comments.length > 0 && (
                    <CommentList comments={this.state.comments} />
                  )}
                </div>
                <div className='annotation-popup-comment'>
                  <Form.Item>
                    <TextArea
                      rows={4}
                      onChange={this.handleChangeWriteComment}
                      value={this.state.textAreaComment}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={this.handleCommentSubmit} type='primary'>
                      Add Comment
                    </Button>
                  </Form.Item>
                </div>
              </TabPane>
            </Tabs>
            <div className='modal-signal-footer'>
              <Button key='delete' type='danger' onClick={this.handleDelete}>
                Delete
              </Button>
              <Button
                key='submit'
                type='primary'
                loading={this.state.confirmLoading}
                onClick={this.handleSubmit}
                disabled={this.state.confirmLoading}
              >
                Assign informations
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create({ name: 'register' })(
  withRouter(FormIntervalSignalAnnotation)
);
