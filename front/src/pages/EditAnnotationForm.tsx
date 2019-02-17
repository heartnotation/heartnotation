import React, { Component } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  Row,
  Col,
  Alert,
  Modal
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import { RouteComponentProps, withRouter } from 'react-router';
import { Organization, Tag, Annotation, api } from '../utils';
import { isNull } from 'util';
import { getTags } from '../utils/api';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

const formTailLayout = {
  wrapperCol: { span: 14, offset: 10 }
};

interface States {
  organizations: Organization[];
  organizationsSearch: string[];
  tags: Tag[];
  tagsSearch: string[];
  tagsSelected: Tag[];
  annotationsParents: Annotation[];
  annotationValidateStatus: '' | 'success' | 'error';
  loading: boolean;
  error: string;
}

interface Props extends FormComponentProps, RouteComponentProps {
  getAnnotations: () => Promise<Annotation[]>;
  changeAnnotation: (data: Annotation) => Promise<Annotation>;
  getTags: () => Promise<Tag[]>;
  getOrganizations: () => Promise<Organization[]>;
  annotation: Annotation;
  checkSignal: (id: number) => Promise<any>;
  handleOk: () => void;
  handleCancel: () => void;
  modalVisibility: boolean;
}

class EditAnnotationForm extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizations: [],
      organizationsSearch: [],
      tags: [],
      tagsSearch: [],
      tagsSelected: [],
      annotationsParents: [],
      annotationValidateStatus: '',
      loading: false,
      error: ''
    };
  }

  public componentDidMount = () => {
    // console.log('bite', this.props.annotation);
    const { getTags, getOrganizations, getAnnotations } = this.props;
    Promise.all([getTags(), getOrganizations(), getAnnotations()]).then(
      responses => {
        this.setState({
          tags: responses[0].filter((t: Tag) => t.is_active),
          organizations: responses[1],
          annotationsParents: responses[2]
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
    if (!isNaN(parseInt(value, 10))) {
      this.props
        .checkSignal(value)
        .then(() => {
          callback();
        })
        .catch(() => {
          callback(`Signal n°${value} not found`);
        });
    } else {
      callback('You should write numbers');
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
      tags.filter((t: Tag) => t.is_active).map((t: Tag) => t.name)
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
    const { annotationsParents } = this.state;
    if (e.target.value === '') {
      this.setState({ annotationValidateStatus: '' });
    } else if (
      this.isStringNumber(e.target.value) &&
      annotationsParents.map(a => a.id).includes(parseInt(e.target.value, 10))
    ) {
      // this.props.annotation.parent.id = parseInt(e.target.value, 10);
      this.setState({ annotationValidateStatus: 'success' });
    } else {
      this.setState({ annotationValidateStatus: 'error' });
    }
  }

  public validateAnnotation = (_: any, value: any, callback: any) => {
    if (value && !this.isStringNumber(value)) {
      callback('You should write a number');
    }
    const { annotationsParents } = this.state;
    if (
      value &&
      !annotationsParents.map(a => a.id).includes(parseInt(value, 10))
    ) {
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

  public handleOk = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((_, values) => {
      const a = { ...this.props.annotation };
      console.log(values);
      const o = this.state.organizations.find(
        orga => orga.name === values.organization
      );
      a.organization = o ? o : this.props.annotation.organization;
      a.name = values.name;
      a.tags = this.state.tags
        .filter(t => values.tags.includes(t.id))
       ;
      console.log('annotation', a);
      this.props.changeAnnotation(a).then(() => {
        this.props.handleOk();
      });
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
    // console.log(this.state.tags);
    return (
      <Modal
        key={2}
        visible={this.props.modalVisibility}
        onOk={this.handleOk}
        onCancel={this.props.handleCancel}
      >
        <Row type='flex' justify='center' align='top'>
          <Col span={20}>
            <Form layout='horizontal'>
              <Form.Item
                {...formItemLayout}
                label='Annotation ID'
                hasFeedback={true}
                validateStatus={annotationValidateStatus}
              >
                {getFieldDecorator('id', {
                  initialValue: this.props.annotation.id
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Annotation title'>
                {getFieldDecorator('name', {
                  initialValue: this.props.annotation.name,
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
                  initialValue: this.props.annotation.signal_id
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Organization'>
                {getFieldDecorator('organization', {
                  initialValue: this.props.annotation.organization
                    ? this.props.annotation.organization.name
                    : '',
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
                  initialValue: this.props.annotation.parent
                    ? this.props.annotation.parent.id
                    : ''
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Tags autorisés'>
                {getFieldDecorator('tags', {
                  initialValue: this.props.annotation.tags.map(t => t.id),
                  rules: [
                    {
                      required: false,
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
              {/* <Form.Item {...formTailLayout}>
                <Button type='primary' htmlType='submit' disabled={loading}>
                  Edit
                </Button>
              </Form.Item> */}
              {error && <Alert message={error} type='error' showIcon={true} />}
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(withRouter(EditAnnotationForm));
