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
import { Tag, api, Annotation } from '../../utils';
import {
  Interval,
  IntervalPayload,
  IntervalCommentPayload,
  IntervalComment
} from '../../utils/objects';
import TextArea from 'antd/lib/input/TextArea';

interface Props extends FormComponentProps {
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
  <List
    dataSource={props.comments}
    header={`${props.comments.length} ${
      props.comments.length > 1 ? 'replies' : 'reply'
    }`}
    itemLayout='horizontal'
    renderItem={(p: any) => <Comment {...p} />}
  />
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
    const { textAreaComment, currentInterval, comments } = this.state;
    if (!textAreaComment) {
      return;
    }
    if (!currentInterval) {
      message.error(
        'Comment submission failed because interval is not correctly identified',
        5
      );
      return;
    }
    const intervalCommentPayload: IntervalCommentPayload = {
      interval_id: currentInterval.id,
      comment: textAreaComment
    };
    api
      .sendIntervalComment(intervalCommentPayload)
      .then((response: IntervalComment) => {
        this.setState({
          comments: [
            ...comments,
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
          ],
          textAreaComment: ''
        });
        if (currentInterval) {
          currentInterval.comments.push(response);
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
    e.preventDefault();

    const { currentInterval, selectedTags } = this.state;
    const { confirmCreate } = this.props;

    if (!currentInterval) {
      message.error(
        'Tag submission failed because interval is not correctly identified',
        5
      );
      return;
    }

    this.setState({ confirmLoading: true });
    api
      .sendIntervalTags({
        tags: selectedTags,
        interval_id: currentInterval.id
      })
      .then(tags => {
        this.setState({ confirmLoading: false });
        confirmCreate({ ...currentInterval, tags });
      })
      .catch(err => {
        this.setState({ error: err.data });
      });
  }

  public handleDelete = async () => {
    const { currentInterval } = this.state;
    const { confirmDelete } = this.props;
    if (currentInterval) {
      try {
        await api.deleteInterval(currentInterval);
        confirmDelete(currentInterval);
      } catch (_) {
        this.setState({ error: 'Failed to delete' });
      }
    }
  }

  public handleCancel = () => {
    const { confirmCancel } = this.props;
    const { currentInterval } = this.state;
    confirmCancel({ ...currentInterval! });
  }

  public handleChangeSelectTags = (values: number[]) => {
    this.setState({ selectedTags: values });
  }

  public componentDidMount = () => {
    const { clickedInterval, start, end, annotation } = this.props;
    if (clickedInterval) {
      let datacomments: DataComment[] = [];
      let tags: number[] = [];
      if (clickedInterval.comments) {
        datacomments = clickedInterval.comments.map(
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
        clickedInterval.comments = [];
      }
      if (clickedInterval.tags) {
        tags = clickedInterval.tags.map((tag: Tag) => tag.id);
      }
      this.setState({
        comments: datacomments,
        selectedTags: tags,
        currentInterval: clickedInterval
      });
    } else if (start && end) {
      const intervalPayload: IntervalPayload = {
        annotation_id: annotation.id,
        time_start: Math.round(start),
        time_end: Math.round(end)
      };
      api
        .sendInterval(intervalPayload)
        .then(response => {
          response.comments = [];
          this.setState({ currentInterval: response });
        })
        .catch(err => this.setState({ error: err }));
    }
    this.setState({ tags: annotation.tags });
  }

  public componentDidUpdate = () => {
    const { selectedTags } = this.state;
    selectedTags.forEach((x: number) => {
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
        grandparents.style.opacity = '0.85';
        grandparents.style.backgroundColor = String(t.dataset.color);
      }
    });
  }

  public render() {
    const TabPane = Tabs.TabPane;
    const Option = Select.Option;
    const {
      tags,
      confirmLoading,
      error,
      currentInterval,
      selectedTags,
      comments,
      textAreaComment
    } = this.state;
    const { annotation, end, start, clickedInterval } = this.props;
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
          confirmLoading={confirmLoading}
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
                {!clickedInterval && (
                  <p className='text-center'>
                    Tags to assignate to annotation task {annotation.id} in
                    interval between {start} and {end} :
                  </p>
                )}
                {clickedInterval && (
                  <p className='text-center'>
                    Tags to assignate to annotation task{' '}
                    {clickedInterval.annotation_id} in interval between{' '}
                    <b>{clickedInterval.time_start} ms</b> and{' '}
                    <b>{clickedInterval.time_end} ms</b> :
                  </p>
                )}
                <Select
                  mode='multiple'
                  style={{ width: '100%' }}
                  placeholder='Please select'
                  onChange={this.handleChangeSelectTags}
                  value={selectedTags}
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
                  {comments.length > 0 && <CommentList comments={comments} />}
                </div>
                <div className='annotation-popup-comment'>
                  <Form.Item>
                    <TextArea
                      rows={4}
                      onChange={this.handleChangeWriteComment}
                      value={textAreaComment}
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
                loading={confirmLoading}
                onClick={this.handleSubmit}
                disabled={confirmLoading}
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

export default Form.create({ name: 'register' })(FormIntervalSignalAnnotation);
