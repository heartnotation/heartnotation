import React, { Component } from 'react';
import { Form, Input, Button, Select, AutoComplete, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import 'antd/dist/antd.css';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const formTailLayout = {
  wrapperCol: { span: 14, offset: 10 }
};

interface States {
  organizations: string[];
  organizationsSearch: string[];
  tags: string[];
  tagsSelected: string[];
  annotations: number[];
  annotationValidateStatus: '' | 'success' | 'error';
}

class CreateAnnotationForm extends Component<FormComponentProps, States> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      organizations: ['Abcdef', 'ahdec', 'dceff'],
      organizationsSearch: [],
      tags: ['t1', 'T2', 'ab', 'abc', 'é', 'e'],
      tagsSelected: [],
      annotations: [1, 12, 333],
      annotationValidateStatus: ''
    };
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    return items.filter(i => i.toLowerCase().startsWith(value));
  }

  private isStringNumber = (s: string) => {
    return !isNaN(Number(s));
  }

  public validateId = (rule: any, value: any, callback: any) => {
    if (value && !this.isStringNumber(value)) {
      callback('You should write a number');
    }
    callback();
  }

  public handleSearchOrganization = (value: string) => {
    const { organizations } = this.state;
    const organizationsSearch = this.filterNoCaseSensitive(
      value,
      organizations
    );
    this.setState({
      organizationsSearch:
        organizationsSearch.length !== organizations.length
          ? organizationsSearch
          : []
    });
  }

  public handleChangeAnnotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { annotations } = this.state;
    if (e.target.value === '') {
      this.setState({ annotationValidateStatus: '' });
    } else if (
      this.isStringNumber(e.target.value) &&
      annotations.indexOf(parseInt(e.target.value, 10)) !== -1
    ) {
      this.setState({ annotationValidateStatus: 'success' });
    } else {
      this.setState({ annotationValidateStatus: 'error' });
    }
  }

  public filterSearchTag = (
    inputValue: string,
    option: React.ReactElement<OptionProps>
  ) => {
    const v = option.props.children;
    if (v && typeof v === 'string') {
      return v.toLowerCase().startsWith(inputValue.toLowerCase());
    }
    return false;
  }

  public handleChangeTag = (tag: string[]) => {
    this.setState({ tagsSelected: tag });
  }

  public handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values); // à envoyer vers la route du back
      }
    });
  }

  public render() {
    const { getFieldDecorator } = this.props.form;
    const { organizationsSearch } = this.state;
    const { tags } = this.state;
    const { tagsSelected } = this.state;
    const { annotationValidateStatus } = this.state;
    const filteredTags = tags.filter(t => !tagsSelected.includes(t));
    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    return (
      <Row type='flex' justify='center' align='top'>
        <Col span={8}>
          <Form layout='horizontal' onSubmit={this.handleSubmit}>
            <Form.Item {...formItemLayout} label='Annotation title'>
              {getFieldDecorator('title', {
                rules: [
                  {
                    whitespace: true,
                    message: msgEmpty
                  },
                  {
                    required: true,
                    message: msgRequired
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item {...formItemLayout} label='Signal ID'>
              {getFieldDecorator('signal_id', {
                rules: [
                  {
                    whitespace: true,
                    message: msgEmpty
                  },
                  {
                    required: true,
                    message: msgRequired
                  },
                  { validator: this.validateId }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item {...formItemLayout} label='Organization'>
              {getFieldDecorator('organization_id', {
                initialValue: null,
                rules: [
                  {
                    whitespace: true,
                    message: msgEmpty
                  }
                ]
              })(
                <AutoComplete
                  dataSource={organizationsSearch}
                  onSearch={this.handleSearchOrganization}
                />
              )}
            </Form.Item>
            <Form.Item
              {...formItemLayout}
              label='Original annotation'
              hasFeedback={true}
              validateStatus={annotationValidateStatus}
            >
              {getFieldDecorator('annotation_parent_id', {
                initialValue: null,
                rules: [
                  {
                    whitespace: true,
                    message: msgEmpty
                  },
                  { validator: this.validateId }
                ]
              })(<Input onChange={this.handleChangeAnnotation} />)}
            </Form.Item>
            <Form.Item {...formItemLayout} label='Tags autorisés'>
              {getFieldDecorator('authorized_tags', {
                rules: [
                  {
                    required: true,
                    message: msgRequired
                  }
                ]
              })(
                <Select<string[]>
                  mode='multiple'
                  onChange={this.handleChangeTag}
                  filterOption={this.filterSearchTag}
                >
                  {filteredTags.map(tag => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item {...formTailLayout}>
              <Button type='primary' htmlType='submit'>
                Create
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(CreateAnnotationForm);
