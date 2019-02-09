import React, { Component } from 'react';
import { Form, Input, Button, Select, AutoComplete, Row, Col } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../utils';
import 'antd/dist/antd.css';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const formTailLayout = {
  wrapperCol: { span: 14, offset: 10 }
};

interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

interface Tag {
  id: number;
  label: string;
}

interface Annotation {
  id: number;
}

interface States {
  organizations: Organization[];
  organizationsSearch: string[];
  tags: number[];
  tagsAjax: Tag[];
  tagsSelected: number[];
  annotations: number[];
  annotationsAjax: Annotation[];
  annotationValidateStatus: '' | 'success' | 'error';
}

class CreateAnnotationForm extends Component<FormComponentProps, States> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      organizations: [],
      organizationsSearch: [],
      tags: [1, 2, 3, 12, 34, 45],
      tagsAjax: [],
      tagsSelected: [],
      annotations: [1, 12, 333],
      annotationsAjax: [],
      annotationValidateStatus: ''
    };
  }

  public componentDidMount = () => {
    const organizationsAjax: Promise<Organization[]> = axios
      .get<Organization[]>(`${API_URL}/organizations`)
      .then((res: AxiosResponse<Organization[]>) => {
        return res.data;
      });

    Promise.all([organizationsAjax]).then((allResponse: Organization[][]) => {
      this.setState({
        organizations: allResponse[0]
      });
    });
    /*
    const tagsAjax: Promise<Tag[]> = axios
      .get<Tag[]>('/tags')
      .then((res: AxiosResponse<Tag[]>) => {
        return res.data;
      });

    const annotationsAjax: Promise<Annotation[]> = axios
      .get<Annotation[]>('/annotations')
      .then((res: AxiosResponse<Annotation[]>) => {
        return res.data;
      }); 

    Promise.all([organizationsAjax, tagsAjax, annotationsAjax]).then(
      (allResponse: [Organization[], Tag[], Annotation[]]) => {
        console.log(allResponse);
        this.setState({
          organizationsAjax: allResponse[0],
          tagsAjax: allResponse[1],
          annotationsAjax: allResponse[2]
        });
      }
    );*/
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    const v = value.toLowerCase();
    return items.filter(i => i.toLowerCase().startsWith(v));
  }

  private isStringNumber = (s: string) => {
    return !isNaN(Number(s));
  }

  public validateId = (_: any, value: any, callback: any) => {
    if (value && !this.isStringNumber(value)) {
      callback('You should write a number');
    }
    callback();
  }

  public handleSearchOrganization = (value: string) => {
    const { organizations } = this.state;
    const organizationsSearch = this.filterNoCaseSensitive(
      value,
      organizations.map((o: Organization) => o.name)
    );
    this.setState({
      organizationsSearch:
        organizationsSearch.length !== organizations.length
          ? organizationsSearch
          : []
    });
  }

  public validateOrganization = (_: any, value: any, callback: any) => {
    const { organizations } = this.state;
    if (
      value &&
      !organizations.map((o: Organization) => o.name).includes(value)
    ) {
      callback('This organization doesn\'t exist');
    }
    callback();
  }

  public handleChangeAnnotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { annotations } = this.state;
    if (e.target.value === '') {
      this.setState({ annotationValidateStatus: '' });
    } else if (
      this.isStringNumber(e.target.value) &&
      annotations.includes(parseInt(e.target.value, 10))
    ) {
      this.setState({ annotationValidateStatus: 'success' });
    } else {
      this.setState({ annotationValidateStatus: 'error' });
    }
  }

  public validateAnnotation = (_: any, value: any, callback: any) => {
    if (value && !this.isStringNumber(value)) {
      callback('You should write a number');
    }
    const { annotations } = this.state;
    if (value && !annotations.includes(parseInt(value, 10))) {
      callback('This annotations doesn\'t exist');
    }
    callback();
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

  public handleChangeTag = (tag: number[]) => {
    this.setState({ tagsSelected: tag });
  }

  public handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { organizations } = this.state;
      if (!err) {
        values.signal_id = parseInt(values.signal_id, 10);
        values.annotation_parent_id = values.annotation_parent_id
          ? parseInt(values.annotation_parent_id, 10)
          : null;
        if (values.organization_id) {
          const findOrgaId = organizations.find(
            (o: Organization) => o.name === values.organization_id
          );
          values.organization_id =
            findOrgaId === undefined ? null : findOrgaId.id;
        } else {
          values.organization_id = null;
        }
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
                  },
                  { validator: this.validateOrganization }
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
                  { validator: this.validateAnnotation }
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
                <Select<number[]>
                  mode='multiple'
                  onChange={this.handleChangeTag}
                  filterOption={this.filterSearchTag}
                >
                  {filteredTags.map(tag => (
                    <Option key='key' value={tag}>
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
