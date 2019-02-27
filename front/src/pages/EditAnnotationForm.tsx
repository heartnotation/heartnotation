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
import { Organization, Tag, Annotation, Status } from '../utils';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
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
  editVisible: boolean;
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
      loading: true,
      error: ''
    };
  }

  public componentDidMount = () => {
    const { getTags, getOrganizations, getAnnotations } = this.props;
    Promise.all([getTags(), getOrganizations(), getAnnotations()])
      .then(responses => {
        this.setState({
          tags: responses[0].filter((t: Tag) => t.is_active),
          organizations: responses[1],
          annotationsParents: responses[2],
          loading: false
        });
      })
      .catch(err => this.setState({ error: err, loading: false }));
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    const v = value.toLowerCase();
    return items.filter(i => i.toLowerCase().startsWith(v.toLowerCase()));
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
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        this.setState({
          error:
            'Some fields seems to be invalid, please fix them before trying to click'
        });
        return;
      }

      const a = { ...this.props.annotation };

      const o = this.state.organizations.find(
        orga => orga.name === values.organization
      );
      if(o) {
        a.organization = o;
        a.name = values.name;
        a.tags = this.state.tags.filter(t => values.tags.includes(t.id));

        this.props
          .changeAnnotation(a)
          .then(() => {
            this.props.handleOk();
          })
          .catch(() => {
            this.setState({ error: 'Error while sending datas' });
          });
      } else {
        this.setState({
          error:
            'Organization is invalid'
        });
      }
    });
  }

  public render() {
    const {
      form: { getFieldDecorator },
      annotation,
      editVisible,
      handleCancel
    } = this.props;
    const { tags, organizationsSearch, tagsSelected, error } = this.state;

    const filteredTags = tags.filter(
      t => !tagsSelected.map(tag => tag.id).includes(t.id)
    );

    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    const started = annotation.last_status.enum_status.id > 2;

    return (
      <Modal
        key={2}
        visible={editVisible}
        onOk={this.handleOk}
        onCancel={handleCancel}
        title='Edit annotation'
      >
        <Row type='flex' justify='center' align='top'>
          <Col span={20}>
            <Form layout='horizontal'>
              <Form.Item {...formItemLayout} label='Annotation ID'>
                {getFieldDecorator('id', {
                  initialValue: annotation.id
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Annotation title'>
                {getFieldDecorator('name', {
                  initialValue: annotation.name,
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
              <Form.Item {...formItemLayout} label='Current status'>
                {getFieldDecorator('status', {
                  initialValue: annotation.last_status.enum_status.name
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Signal ID'>
                {getFieldDecorator('signal_id', {
                  initialValue: annotation.signal_id
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Organization'>
                {getFieldDecorator('organization', {
                  initialValue: annotation.organization
                    ? annotation.organization.name
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
                    disabled={started}
                  />
                )}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Original annotation'>
                {getFieldDecorator('parent_id', {
                  initialValue: annotation.parent ? annotation.parent.id : ''
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Tags autorisés'>
                {getFieldDecorator('tags', {
                  initialValue: annotation.tags
                    ? annotation.tags.map(t => t.id)
                    : [],
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
                    disabled={started}
                  >
                    {filteredTags.map((tag: Tag) => (
                      <Option key='key' value={tag.id}>
                        {tag.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              {error && <Alert message={error} type='error' showIcon={true} />}
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(withRouter(EditAnnotationForm));
