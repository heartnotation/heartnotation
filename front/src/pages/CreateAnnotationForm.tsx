import React, { Component } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  Row,
  Col,
  Alert
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../utils';
import { RouteComponentProps } from 'react-router';

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
  name: string;
  is_active: boolean;
}

interface Annotation {
  id: number;
}

interface States {
  organizations: Organization[];
  organizationsSearch: string[];
  tags: Tag[];
  tagsSearch: string[];
  tagsSelected: Tag[];
  annotations: Annotation[];
  annotationValidateStatus: '' | 'success' | 'error';
  loading: boolean;
  error: string;
}

interface Props extends FormComponentProps, RouteComponentProps {}

class CreateAnnotationForm extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizations: [],
      organizationsSearch: [],
      tags: [],
      tagsSearch: [],
      tagsSelected: [],
      annotations: [],
      annotationValidateStatus: '',
      loading: false,
      error: ''
    };
  }

  public componentDidMount = () => {
    const organizationsAjax: Promise<Organization[]> = axios
      .get<Organization[]>(`${API_URL}/organizations`)
      .then((res: AxiosResponse<Organization[]>) => {
        return res.data;
      });

    const tagsAjax: Promise<Tag[]> = axios
      .get<Tag[]>(`${API_URL}/tags`)
      .then((res: AxiosResponse<Tag[]>) => {
        return res.data;
      });

    const annotationsAjax: Promise<Annotation[]> = axios
      .get<Annotation[]>('/annotations')
      .then((res: AxiosResponse<Annotation[]>) => {
        return res.data;
      });

    Promise.all([tagsAjax, organizationsAjax, annotationsAjax]).then(
      responses => {
        this.setState({
          tags: responses[0],
          organizations: responses[1],
          annotations: responses[2]
        });
      }
    );
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    const v = value.toLowerCase();
    return items.filter(i => i.toLowerCase().startsWith(v.toLowerCase()));
  }

  private isStringNumber = (s: string) => {
    return !isNaN(Number(s));
  }

  public validateId = (_: any, value: any, callback: any) => {
    if (value && !this.isStringNumber(value)) {
      callback('You should write a number');
    } else {
      axios
        .get(`${API_URL}/signal/${value}`)
        .then(() => {
          callback();
        })
        .catch(() => {
          callback(`Signal n°${value} not found`);
        });
    }
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

  public handleSearchTag = (value: string) => {
    const { tags } = this.state;
    const tagsSearch = this.filterNoCaseSensitive(
      value,
      tags.map((t: Tag) => t.name)
    );
    this.setState({
      tagsSearch: tagsSearch.length !== tags.length ? tagsSearch : []
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

  public validateTag = (_: any, values: number[], callback: any) => {
    const { tags } = this.state;
    const ids = tags.map(t => t.id);

    if (
      values &&
      values.filter(v => ids.includes(v)).length !== values.length
    ) {
      callback('This tag doesn\'t exist');
    }
    callback();
  }

  public handleChangeAnnotation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { annotations } = this.state;
    if (e.target.value === '') {
      this.setState({ annotationValidateStatus: '' });
    } else if (
      this.isStringNumber(e.target.value) &&
      annotations.map(a => a.id).includes(parseInt(e.target.value, 10))
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
    if (value && !annotations.map(a => a.id).includes(parseInt(value, 10))) {
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

  public handleChangeTag = (tag: Tag[]) => {
    this.setState({ tagsSelected: tag });
  }

  public handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { organizations } = this.state;
      if (!err) {
        values.signal_id = parseInt(values.signal_id, 10);
        values.parent_id = values.parent_id
          ? parseInt(values.parent_id, 10)
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
        axios
          .post(`${API_URL}/annotations`, values)
          .then(() => {
            this.props.history.push('/');
          })
          .catch(() =>
            this.setState({
              error: 'Problem while sending datas, please retry later...',
              loading: false
            })
          );
      }
    });
  }

  public render() {
    const { getFieldDecorator } = this.props.form;
    const {
      tags,
      organizationsSearch,
      annotationValidateStatus,
      tagsSelected,
      error,
      loading
    } = this.state;

    const filteredTags = tags.filter(
      t => !tagsSelected.map(tag => tag.id).includes(t.id)
    );

    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    return (
      <Row type='flex' justify='center' align='top'>
        <Col span={8}>
          <Form layout='horizontal' onSubmit={this.handleSubmit}>
            <Form.Item {...formItemLayout} label='Annotation title'>
              {getFieldDecorator('name', {
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
              {getFieldDecorator('parent_id', {
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
              {getFieldDecorator('tags', {
                rules: [
                  {
                    required: true,
                    message: msgRequired
                  },
                  { validator: this.validateTag }
                ]
              })(
                <Select<Tag[]>
                  mode='multiple'
                  onChange={this.handleChangeTag}
                  filterOption={this.filterSearchTag}
                >
                  {filteredTags.map((tag: Tag) => (
                    <Option key='key' value={tag.id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item {...formTailLayout}>
              <Button type='primary' htmlType='submit' disabled={loading}>
                Create
              </Button>
            </Form.Item>
            {error && <Alert message={error} type='error' showIcon={true} />}
          </Form>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(CreateAnnotationForm);
