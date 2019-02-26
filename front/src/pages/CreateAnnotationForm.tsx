import React, { Component } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  AutoComplete,
  Row,
  Col,
  Modal,
  Alert
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import { RouteComponentProps, withRouter } from 'react-router';
import { Organization, Tag, Annotation } from '../utils';
import { finished } from 'stream';

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
  annotations: Annotation[];
  annotationsFinished: Annotation[];
  potentialParents: Annotation[];
  parentCallback: any;
  parentValue: string;
  signalCallback: any;
  signalValue: string;
  annotationValidateStatus: '' | 'success' | 'error';
  loading: boolean;
  error: string;
}

interface Props extends FormComponentProps, RouteComponentProps {
  getTags: () => Promise<Tag[]>;
  getOrganizations: () => Promise<Organization[]>;
  getAnnotations: () => Promise<Annotation[]>;
  checkSignal: (id: number) => Promise<any>;
  sendAnnotation: (datas: Annotation) => Promise<Annotation>;
  creationVisible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
}

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
      annotationsFinished: [],
      potentialParents: [],
      parentCallback: undefined,
      parentValue: '',
      signalCallback: undefined,
      signalValue: '',
      annotationValidateStatus: '',
      loading: false,
      error: ''
    };
  }

  public componentDidMount = () => {
    const { getTags, getOrganizations, getAnnotations } = this.props;
    Promise.all([getTags(), getOrganizations(), getAnnotations()]).then(
      responses => {
        this.setState({
          tags: responses[0],
          organizations: responses[1],
          annotations: responses[2],
          annotationsFinished: responses[2].filter(
            (a: Annotation) => a.last_status.enum_status.id > 4
          )
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

  public validateIdInt = (_: any, value: any, callback: any) => {
    this.setState({
      signalValue: value
    });

    this.setState(
      {
        potentialParents: this.state.annotations.filter(
          (a: Annotation) => a.signal_id === value
        )
      },
      () => {
        if (this.state.parentCallback) {
          this.validateParent(
            _,
            this.state.parentValue,
            this.state.parentCallback
          );
        }
      }
    );

    this.validateId(_, value, callback);

    if (!this.state.signalCallback) {
      this.setState({
        signalCallback: callback
      });
    }
  }

  public validateId = (_: any, value: any, callback: any) => {
    this.props
      .checkSignal(value)
      .then(() => {
        callback();
      })
      .catch(() => {
        callback(`Signal n°${value} not found`);
      });
  }

  public handleSignal = (value: string) => {
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

  public validateParentInt = (_: any, value: any, callback: any) => {
    this.setState({
      parentValue: value
    });
    this.validateParent(_, value, callback);

    if (!this.state.parentCallback) {
      this.setState({
        parentCallback: callback
      });
    }
    if (this.state.signalCallback) {
      this.validateId(_, this.state.signalValue, this.state.signalCallback);
    }
  }

  public validateParent = (_: any, value: any, callback: any) => {
    if (value === '') {
      this.setState({ annotationValidateStatus: '' });
      callback();
      return;
    }

    if (value && !this.isStringNumber(value)) {
      this.validateParentError('You should write a number', callback);
      return;
    }

    const { annotations, annotationsFinished, potentialParents } = this.state;

    if (value && !annotations.map(a => a.id).includes(parseInt(value, 10))) {
      this.validateParentError('This annotations doesn\'t exist', callback);
      return;
    }
    if (!potentialParents.map(a => a.id).includes(parseInt(value, 10))) {
      this.validateParentError(
        'This parent has not the same signal ID',
        callback
      );
      return;
    }
    if (!annotationsFinished.map(a => a.id).includes(parseInt(value, 10))) {
      this.validateParentError(
        'This annotations isn\'t in a finished state (Cancelled of Validated)',
        callback
      );
      return;
    }
    this.validateParentSucces(callback);
  }

  public validateParentSucces = (callback: any) => {
    const parentIdValue = this.props.form.getFieldValue('parent_id');
    this.props.form.setFieldsValue({
      parent_id: parentIdValue
    });
    this.setState({ annotationValidateStatus: 'success' }, () => {
      callback();
    });
  }
  public validateParentError = (error: string, callback: any) => {
    const parentIdValue = this.props.form.getFieldValue('parent_id');
    this.props.form.setFieldsValue({
      parent_id: parentIdValue
    });
    this.setState({ annotationValidateStatus: 'error' }, () => {
      callback(error);
    });
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
      const { organizations } = this.state;
      if (!err) {
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
        // this.setState({ loading: true, error: '' });
        this.props
          .sendAnnotation(values)
          .then(() => {
            this.props.handleOk();
          })
          .catch(() =>
            this.setState({
              error: 'Problem while sending datas, please retry later...'
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
      <Modal
        key={2}
        visible={this.props.creationVisible}
        onOk={this.handleOk}
        onCancel={this.props.handleCancel}
        title='Create annotation'
      >
        <Row type='flex' justify='center' align='top'>
          <Col>
            <Form layout='horizontal'>
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
                    { validator: this.validateIdInt }
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
                    { validator: this.validateParentInt }
                  ]
                })(<Input />)}
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
              {error && <Alert message={error} type='error' showIcon={true} />}
            </Form>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default Form.create()(withRouter(CreateAnnotationForm));
