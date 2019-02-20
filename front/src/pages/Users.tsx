import React, { Component } from 'react';
import { Table, Input, Icon, Tag, Row, Col } from 'antd';
import 'antd/dist/antd.css';
import { ColumnProps } from 'antd/lib/table';
import { User, Organization, Role } from '../utils';
import { withRouter, RouteComponentProps } from 'react-router';
import EditUserForm from './EditUserForm';
import UserCreation from './UserCreation';
import AddButton from '../fragments/fixedButton/AddButton';
export interface State {
  searches: Map<string, string>;
  initialUsers: User[];
  currentUsers: User[];
  user?: User;
  modifyVisible: boolean;
  creationVisible: boolean;
}

interface Props extends RouteComponentProps {
  getOrganizations: () => Promise<Organization[]>;
  getRoles: () => Promise<Role[]>;
  modifyUser: (datas: User) => Promise<User>;
  sendUser: (datas: User) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (datas: User) => Promise<User>;
}

class Users extends Component<Props, State> {
  public state: State = {
    searches: new Map<string, string>(),
    initialUsers: [],
    currentUsers: [],
    modifyVisible: false,
    creationVisible: false
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      initialUsers: data,
      currentUsers: data.slice()
    });
  }

  public async getDatas(): Promise<User[]> {
    const users = await this.props.getAllUsers();
    return users;
  }

  public columns: Array<ColumnProps<User>> = [
    {
      title: () => this.getColumnSearchBox('id', 'ID'),
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          sorter: (a: User, b: User) => a.id - b.id
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('mail', 'Mail'),
      children: [
        {
          title: 'Mail',
          dataIndex: 'mail',
          sorter: (a: User, b: User) =>
            a.mail.localeCompare(b.mail, 'en', {
              sensitivity: 'base'
            })
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('roles', 'Role'),
      children: [
        {
          title: 'Roles',
          dataIndex: 'roles',
          render: (roles: Role[]) => {
            const colors = [
              'geekblue',
              'green',
              'volcano',
              'orange',
              'yellow',
              'gold',
              'lime',
              'cyan',
              'purple',
              'magenta',
              'red'
            ];
            if (roles !== undefined) {
              roles.sort();
              const ui = (
                <span>
                  {roles.map(role => (
                    <Tag
                      color={colors[(role.id % colors.length) - 1]}
                      key={role.name}
                    >
                      {role.name}
                    </Tag>
                  ))}
                </span>
              );
              return ui;
            }
          }
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('organizations', 'Organizations'),
      children: [
        {
          title: 'Organizations',
          dataIndex: 'organizations',
          render: (organizations: Organization[]) => {
            const colors = [
              'geekblue',
              'green',
              'volcano',
              'orange',
              'yellow',
              'gold',
              'lime',
              'cyan',
              'purple',
              'magenta',
              'red'
            ];
            if (organizations !== undefined) {
              organizations.sort();
              const ui = (
                <span>
                  {organizations.map(organization => (
                    <Tag
                      color={colors[(organization.id % colors.length) - 1]}
                      key={organization.name}
                    >
                      {organization.name}
                    </Tag>
                  ))}
                </span>
              );
              return ui;
            }
          }
        }
      ]
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      render: (active: boolean) => (
        <Icon
          type={active ? 'check' : 'close'}
          style={{ color: active ? 'green' : 'red', fontSize: '1.2em' }}
        />
      )
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, user: User) => (
        <Row>
          <Col sm={24} md={12}>
            <Icon
              key={1}
              type='edit'
              theme='twoTone'
              twoToneColor='#6669c9'
              style={{ fontSize: '1.3em' }}
              onClick={() => {
                this.setState({ modifyVisible: true, user });
              }}
            />
          </Col>
          <Col sm={24} md={12}>
            <Icon
              key={2}
              type='delete'
              theme='twoTone'
              twoToneColor='red'
              style={{ fontSize: '1.3em' }}
              onClick={async () => {
                this.props.deleteUser(user).then(async () => {
                  const users = await this.getDatas();
                  this.setState({
                    user: undefined,
                    initialUsers: users,
                    currentUsers: users.slice()
                  });
                });
              }}
            />
          </Col>
        </Row>
      )
    }
  ];

  public getColumnSearchBox = (dataIndex: keyof User, displayText: string) => (
    <div style={{ paddingTop: 8, textAlign: 'center' }}>
      <Input
        className={`search_${dataIndex}`}
        placeholder={`Search by ${displayText}`}
        onChange={e => this.handleChange(dataIndex, e.target.value)}
      />
    </div>
  )

  public handleChange = (dataIndex: keyof User, value: string) => {
    this.state.searches.set(dataIndex, value);
    this.handleSearch();
  }

  public handleSearch = () => {
    const { initialUsers, searches } = this.state;

    const filteredData = initialUsers.slice().filter((record: User) => {
      const id = searches.get('id');
      if (id) {
        if (!record.id.toString().startsWith(id)) {
          return false;
        }
      }
      const mail = searches.get('mail');
      if (mail) {
        if (!record.mail.toLowerCase().startsWith(mail.toLowerCase())) {
          return false;
        }
      }
      const role = searches.get('roles');
      if (role) {
        let found = false;
        for (const r of record.roles) {
          if (r.name.toLowerCase().startsWith(role.toLowerCase())) {
            found = true;
            break;
          }
        }
        if(!found) {
          return false;
        }
      }
      const organization = searches.get('organizations');
      if (organization) {
        let found = false;
        for (const o of record.organizations) {
          if (o.name.toLowerCase().startsWith(organization.toLowerCase())) {
            found = true;
            break;
          }
        }
        if(!found) {
          return false;
        }
      }
      return true;
    });

    this.setState({
      currentUsers: filteredData
    });
  }

  public handleCancelModification = () => {
    this.closeModalModification();
  }

  public handleCancelCreation = () => {
    this.closeModalCreation();
  }

  public handleOkCreation = async () => {
    this.closeModalCreation();
    const users = await this.getDatas();
    this.setState({
      user: undefined,
      initialUsers: users,
      currentUsers: users.slice()
    });
  }

  public handleOkModification = async () => {
    this.closeModalModification();
    const users = await this.getDatas();
    this.setState({
      user: undefined,
      initialUsers: users,
      currentUsers: users.slice()
    });
  }

  public closeModalModification() {
    this.setState({
      user: undefined,
      modifyVisible: false
    });
  }

  public closeModalCreation() {
    this.setState({
      creationVisible: false
    });
  }

  public render() {
    const { currentUsers, user, modifyVisible, creationVisible } = this.state;
    return [
      <Table<User>
        key={1}
        rowKey='id'
        columns={this.columns}
        dataSource={currentUsers}
        pagination={{
          position: 'bottom',
          pageSizeOptions: ['10', '20', '30', '40'],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
        }}
      />,
      user && (
        <EditUserForm
          key={2}
          getOrganizations={this.props.getOrganizations}
          getRoles={this.props.getRoles}
          modifyUser={this.props.modifyUser}
          handleCancel={this.handleCancelModification}
          handleOk={this.handleOkModification}
          user={user}
          modalVisible={modifyVisible}
        />
      ),
      <AddButton
        key={3}
        onClick={() => {
          this.setState({ creationVisible: true });
        }}
      />,
      <UserCreation
        key={4}
        getOrganizations={this.props.getOrganizations}
        getRoles={this.props.getRoles}
        sendUser={this.props.sendUser}
        handleCancel={this.handleCancelCreation}
        handleOk={this.handleOkCreation}
        modalVisible={creationVisible}
      />
    ];
  }
}

export default withRouter(Users);
