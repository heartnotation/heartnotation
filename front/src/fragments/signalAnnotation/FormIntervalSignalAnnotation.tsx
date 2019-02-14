import React, { Component } from 'react';
import { Form, Icon, Tabs, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RouteComponentProps, withRouter } from 'react-router';
import CommentChatAnnotation from '../chatAnnotation/CommentChatAnnotation';
import { Tag, api } from '../../utils';

interface Props extends FormComponentProps, RouteComponentProps {}

interface States {
  tags: Tag[];
}

class FormIntervalSignalAnnotation extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tags: []
    };
  }

  public handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }

  public handleChange(value: any) {
    console.log(`selected ${value}`);
  }

  public componentDidMount = () => {
    console.log('yoooo');
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
    /*for (let i = 10; i < 36; i++) {
      children.push(
        <Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>
      );
    }*/

    return (
      <div className='popup-comment-tag-container'>
        {' '}
        <Tabs defaultActiveKey='2'>
          <TabPane
            tab={
              <span>
                <Icon type='tags' />
                Tags
              </span>
            }
            key='1'
          >
            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder='Please select'
              onChange={this.handleChange}
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
            <div className='popup-comment'>
              <CommentChatAnnotation />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
    return <Form onSubmit={this.handleSubmit} />;
  }
}

export default Form.create({ name: 'register' })(
  withRouter(FormIntervalSignalAnnotation)
);
