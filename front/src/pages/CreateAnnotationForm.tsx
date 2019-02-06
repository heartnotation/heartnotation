import React, { Component } from 'react';
import { Form, Input, Button, Select } from 'antd';
import 'antd/dist/antd.css';

const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 5 }
};

const formTailLayout = {
  wrapperCol: { span: 5, offset: 5 }
};

class CreateAnnotationForm extends Component {
  public render() {
    return (
      <Form layout='horizontal'>
        <Form.Item {...formItemLayout} label='Annotation' required={true}>
          <Input />
        </Form.Item>
        <Form.Item {...formItemLayout} label='Signal ID' required={true}>
          <Input />
        </Form.Item>
        <Form.Item {...formItemLayout} label='Organization'>
          <Input />
        </Form.Item>
        <Form.Item {...formItemLayout} label='Original annotation'>
          <Select>
            <Option value='v1'>v1</Option>
            <Option value='v2'>v2</Option>
          </Select>
        </Form.Item>
        <Form.Item {...formItemLayout} label='Tags autorisés'>
          <Select>
            <Option value='v3'>v3</Option>
            <Option value='v4'>v4</Option>
          </Select>
        </Form.Item>
        <Form.Item {...formTailLayout}>
          <Button type='primary' htmlType='submit'>
            Create
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default CreateAnnotationForm;
