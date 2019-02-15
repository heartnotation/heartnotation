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
  Avatar
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RouteComponentProps, withRouter } from 'react-router';
import CommentChatAnnotation from '../chatAnnotation/CommentChatAnnotation';
import { Tag, api, Annotation } from '../../utils';
import { Interval } from '../../utils/objects';
import TextArea from 'antd/lib/input/TextArea';
import { cpus } from 'os';

interface Props extends FormComponentProps, RouteComponentProps {
  start: number;
  end: number;
  annotation: Annotation;
  confirmCreate: () => void;
  confirmDelete: () => void;
  confirmReturn: () => void;
}

interface DataComment {
  author: string;
  content: any;
  avatar: any;
}

interface States {
  tags: Tag[];
  confirmLoading: boolean;
  comments: DataComment[];
  textAreaContent: string;
  selectedTags: number[];
  error: string;
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

class FormIntervalSignalAnnotation extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tags: [],
      confirmLoading: false,
      comments: [],
      textAreaContent: '',
      selectedTags: [],
      error: ''
    };
  }

  public handleCommentSubmit = () => {
    this.setState({
      comments: [
        {
          author: 'Yann Yolo',
          avatar: (
            <Avatar src='https://i0.wp.com/www.bicarbonatedesoude.fr/wp-content/uploads/2010/10/pieds-264x300.jpg?ssl=1' />
          ),
          content: <p>{this.state.textAreaContent}</p>
        },
        ...this.state.comments
      ],
      textAreaContent: ''
    });
  }

  public handleChangeWriteComment = (e: any) => {
    this.setState({
      textAreaContent: e.target.value
    });
  }

  public handleSubmit = (e: any) => {

    const interval: Interval = {
      annotation_id: this.props.annotation.id,
      start: Math.round(this.props.start),
      end: Math.round(this.props.end)
    };
    api.sendInterval(interval).then(response => console.log(response));

    /*
    e.preventDefault();
    console.log(this.state.selectedTags);
    console.log(this.state.comments);
    console.log(
      Math.round(this.props.start) + '     ' + Math.round(this.props.end)
    );

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ confirmLoading: true, error: '' });*/
        
        
        /*
        console.log(values);*/
        /* this.props
          .sendUser(values)
          .then(() => {
            this.props.history.push('/users');
          })
          .catch(() =>
            this.setState({
              error: 'Problem while sending datas, please retry later...',
              loading: false
            })
          );*/
  
    /*
    console.log(this.state.selectedTags);
    console.log(this.state.comments);
    console.log(
      Math.round(this.props.start) + '     ' + Math.round(this.props.end)
    );
    this.setState({
      confirmLoading: true
    });
    setTimeout(() => {
      this.setState({
        confirmLoading: false
      });
      this.props.confirmCreate();
    }, 2000);*/
  }

  public handleReturn = () => {
    this.props.confirmReturn();
  }

  public handleDelete = () => {
    this.props.confirmDelete();
  }

  public handleChangeSelectTags = (values: number[]) => {
    this.setState({ selectedTags: values });
  }

  public componentDidMount = () => {
    api.getTags().then(res => this.setState({ tags: res }));
  }

  public render() {
    const TabPane = Tabs.TabPane;
    const Option = Select.Option;
    const { tags } = this.state;
    const tagValues = tags.map((val: Tag) => (
      <Option key={val.name} value={val.id}>
        {val.name}
      </Option>
    ));

    return (
      <div className='popup-comment-tag-container'>
        <Modal
          visible={true}
          onOk={this.handleSubmit}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.props.confirmDelete}
          footer={null}
        >
          <Form onSubmit={this.handleSubmit}>
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
                <p className='text-center'>
                  Tags to assignate to annotation task{' '}
                  {this.props.annotation.id} in interval between{' '}
                  {Math.round(this.props.start)} and{' '}
                  {Math.round(this.props.end)} :
                </p>
                <Select
                  mode='multiple'
                  style={{ width: '100%' }}
                  placeholder='Please select'
                  onChange={this.handleChangeSelectTags}
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
                      value={this.state.textAreaContent}
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
              <Button key='back' onClick={this.handleReturn}>
                Return
              </Button>
              <Button
                key='submit'
                type='primary'
                htmlType='submit'
                loading={this.state.confirmLoading}
                onClick={this.handleSubmit}
              >
                Assign informations
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
    return <Form onSubmit={this.handleSubmit} />;
  }
}

export default Form.create({ name: 'register' })(
  withRouter(FormIntervalSignalAnnotation)
);
