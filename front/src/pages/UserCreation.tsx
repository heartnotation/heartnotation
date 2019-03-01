import React, { Component } from 'react';
import { Form, Input, Select, Row, Col, Alert, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { OptionProps } from 'antd/lib/select';
import { Organization, Role, User } from '../utils';
import { getAllUsers } from '../utils/api';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 }
};

interface States {
  organizations: Organization[];
  users: User[];
  organizationsSearch: string[];
  organizationsSelected: Organization[];
  roles: Role[];
  rolesSearch: string[];
  roleSelected?: Role;
  loading: boolean;
  error: string;
}

interface Props extends FormComponentProps {
  getOrganizations: () => Promise<Organization[]>;
  getRoles: () => Promise<Role[]>;
  sendUser: (datas: User) => Promise<User>;
  handleCancel: () => void;
  handleOk: () => void;
  modalVisible: boolean;
}

class UserCreation extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      organizations: [],
      users: [],
      organizationsSearch: [],
      organizationsSelected: [],
      roles: [],
      rolesSearch: [],
      loading: true,
      error: ''
    };
  }

  public componentDidMount = () => {
    const { getOrganizations, getRoles } = this.props;
    Promise.all([getOrganizations(), getRoles(), getAllUsers()])
      .then(responses => {
        this.setState({
          organizations: responses[0],
          roles: responses[1],
          users: responses[2],
          loading: false
        });
      })
      .catch(err => this.setState({ error: err, loading: false }));
  }

  public handleOk = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const {
      form: { validateFields },
      sendUser,
      handleOk
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        values.mail = values.mail.toLowerCase();
        this.setState({ loading: true, error: '' });
        sendUser(values)
          .then(() => {
            handleOk();
            this.setState({ loading: false, error: '' });
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

  public validateMail = (_: any, mail: string, callback: any) => {
    const { users } = this.state;
    const mails = users.map(u => u.mail);
    if (mails.includes(mail)) {
      callback('This email already exists');
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

  public render() {
    const {
      form: { getFieldDecorator },
      modalVisible,
      handleCancel
    } = this.props;
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
        title='Create user'
        visible={modalVisible}
        onOk={this.handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Row type='flex' justify='center' align='top'>
          <Col span={15}>
            <Form layout='horizontal'>
              <Form.Item {...formItemLayout} label='Email Address'>
                {getFieldDecorator('mail', {
                  rules: [
                    {
                      type: 'email',
                      message: 'The input is not a valid e-mail.'
                    },
                    {
                      required: true,
                      message: msgRequired
                    },
                    { validator: this.validateMail }
                  ]
                })(<Input />)}
              </Form.Item>
              <Form.Item {...formItemLayout} label='Role'>
                {getFieldDecorator('role_id', {
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

export default Form.create()(UserCreation);
