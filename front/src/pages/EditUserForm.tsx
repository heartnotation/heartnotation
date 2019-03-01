import React, { Component } from 'react';
import { Form, Input, Button, Select, Row, Col, Alert, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import { Organization, Role, User } from '../utils';
import { AuthProps } from '../utils/auth';

const { Option } = Select;

const ROLE_ADMIN_ID = 3;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

interface States {
  organizations: Organization[];
  organizationsSearch: string[];
  organizationsSelected: Organization[];
  roles: Role[];
  rolesSearch: string[];
  roleSelected?: Role;
  loading: boolean;
  error: string;
  isAdminEditingHimself: boolean;
}

interface Props extends FormComponentProps, AuthProps {
  getOrganizations: () => Promise<Organization[]>;
  getRoles: () => Promise<Role[]>;
  modifyUser: (datas: User) => Promise<User>;
  handleCancel: () => void;
  handleOk: () => void;
  currentUser: User;
  modalVisible: boolean;
}

class EditUserForm extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    const { user, currentUser } = props;
    this.state = {
      organizations: [],
      organizationsSearch: [],
      organizationsSelected: [],
      roles: [],
      rolesSearch: [],
      loading: false,
      error: '',
      isAdminEditingHimself:
        user.role.id === ROLE_ADMIN_ID && currentUser.id === user.id
    };
  }

  public componentDidMount = () => {
    const { getOrganizations, getRoles } = this.props;
    Promise.all([getOrganizations(), getRoles()])
      .then(responses => {
        this.setState({
          organizations: responses[0],
          roles: responses[1],
          loading: false
        });
      })
      .catch(err => this.setState({ error: err, loading: false }));
  }

  private filterNoCaseSensitive = (value: string, items: string[]) => {
    const v = value.toLowerCase();
    return items.filter(i => i.toLowerCase().startsWith(v));
  }

  public handleSearchRole = (value: string) => {
    const { roles } = this.state;
    const rolesSearch = this.filterNoCaseSensitive(
      value,
      roles.map((r: Role) => r.name)
    );
    this.setState({
      rolesSearch: rolesSearch.length !== roles.length ? rolesSearch : []
    });
  }

  public validateOrganization = (_: any, values: number[], callback: any) => {
    const { organizations } = this.state;
    const ids = organizations.map(o => o.id);

    if (
      values &&
      values.filter(v => ids.includes(v)).length !== values.length
    ) {
      callback('This organization doesn\'t exist');
    }
    callback();
  }

  public validateRole = (_: any, value: number, callback: any) => {
    const { roles } = this.state;
    const ids = roles.map(o => o.id);

    if (value && !ids.includes(value)) {
      callback('This role doesn\'t exist');
    }
    callback();
  }

  public filterSearchRole = (
    inputValue: string,
    option: React.ReactElement<OptionProps>
  ) => {
    const v = option.props.children;
    if (v && typeof v === 'string') {
      return v.toLowerCase().startsWith(inputValue.toLowerCase());
    }
    return false;
  }

  public filterSearchOrganization = (
    inputValue: string,
    option: React.ReactElement<OptionProps>
  ) => {
    const v = option.props.children;
    if (v && typeof v === 'string') {
      return v.toLowerCase().startsWith(inputValue.toLowerCase());
    }
    return false;
  }

  public handleChangeRole = (role: Role) => {
    this.setState({ roleSelected: role });
  }

  public handleChangeOrganization = (organization: Organization[]) => {
    this.setState({ organizationsSelected: organization });
  }

  public handleOk = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const {
      form: { validateFieldsAndScroll },
      currentUser,
      handleOk,
      modifyUser
    } = this.props;

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.id = currentUser.id;
        this.setState({ loading: true, error: '' });
        modifyUser(values)
          .then(() => {
            handleOk();
            this.setState({ loading: false });
          })
          .catch(error =>
            this.setState({
              error: error.data,
              loading: false
            })
          );
      }
    });
  }

  public render() {
    const {
      form: { getFieldDecorator },
      modalVisible,
      handleCancel,
      currentUser
    } = this.props;
    const { isAdminEditingHimself } = this.state;
    const {
      roles,
      organizations,
      roleSelected,
      organizationsSelected,
      error,
      loading
    } = this.state;

    const filteredRoles = roleSelected
      ? roles.filter(r => {
          return r.id !== roleSelected.id;
        })
      : roles;

    const filteredOrganizations = organizations.filter(
      o =>
        !organizationsSelected
          .map(organization => organization.id)
          .includes(o.id)
    );

    const msgEmpty = 'This field should not be empty';
    const msgRequired = 'This field is required';
    return (
      <Modal
        key={2}
        title='Edit user'
        visible={modalVisible}
        onCancel={handleCancel}
        confirmLoading={loading}
        onOk={this.handleOk}
      >
        <Row type='flex' justify='center' align='top'>
          <Col span={15}>
            <Form layout='horizontal'>
              <Form.Item {...formItemLayout} label='Email Address'>
                {getFieldDecorator('mail', {
                  initialValue: currentUser.mail,
                  rules: [
                    {
                      type: 'email',
                      message: 'The input is not a valid e-mail.'
                    },
                    {
                      required: true,
                      message: msgRequired
                    }
                  ]
                })(<Input disabled={true} />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Role'>
                {getFieldDecorator('role_id', {
                  initialValue: currentUser.role.id,
                  rules: [
                    {
                      required: true,
                      message: msgRequired
                    },
                    { validator: this.validateRole }
                  ]
                })(
                  <Select<Role>
                    mode='simple'
                    onChange={this.handleChangeRole}
                    filterOption={this.filterSearchRole}
                    disabled={isAdminEditingHimself}
                  >
                    {filteredRoles.map((role: Role) => (
                      <Option key='key' value={role.id}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Organization'>
                {getFieldDecorator('organizations', {
                  initialValue: this.props.currentUser.organizations
                    ? this.props.currentUser.organizations.map(o => o.id)
                    : [],
                  rules: [
                    {
                      required: false,
                      message: msgEmpty
                    },
                    { validator: this.validateOrganization }
                  ]
                })(
                  <Select<Organization[]>
                    mode='multiple'
                    onChange={this.handleChangeOrganization}
                    filterOption={this.filterSearchOrganization}
                  >
                    {filteredOrganizations.map((organization: Organization) => (
                      <Option key='key' value={organization.id}>
                        {organization.name}
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

export default Form.create()(EditUserForm);
