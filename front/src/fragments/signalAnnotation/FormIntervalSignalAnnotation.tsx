import React, { Component } from 'react';
import { Form, Icon, Tabs, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { RouteComponentProps, withRouter } from 'react-router';

interface Props extends FormComponentProps, RouteComponentProps {}

class FormIntervalSignalAnnotation extends Component<Props> {
  public state = {
    confirmDirty: false,
    autoCompleteResult: []
  };

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

  public render() {
    const TabPane = Tabs.TabPane;
    const Option = Select.Option;
    const children = [];
    for (let i = 10; i < 36; i++) {
      children.push(
        <Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>
      );
    }

    return (
      <div>
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
              defaultValue={['a10', 'c12']}
              onChange={this.handleChange}
            >
              {children}
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
            ermHazerDDeEee
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
