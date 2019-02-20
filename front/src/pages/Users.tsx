import React, { Component } from 'react';
import { Table, Input, Icon, Tag, Row, Col, Alert } from 'antd';
import 'antd/dist/antd.css';
import { ColumnProps } from 'antd/lib/table';
import { User, Organization, Role } from '../utils';
import { withAuth, AuthProps } from '../utils/auth';
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
  error: string;
}

interface Props extends AuthProps {
  getOrganizations: () => Promise<Organization[]>;
  getRoles: () => Promise<Role[]>;
  modifyUser: (datas: User) => Promise<User>;
  sendUser: (datas: User) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (datas: User) => Promise<User>;
}

interface ConditionnalColumn extends ColumnProps<User> {
  roles: string[];
}

class Users extends Component<Props, State> {
  public state: State = {
    searches: new Map<string, string>(),
    initialUsers: [],
    currentUsers: [],
    modifyVisible: false,
    creationVisible: false,
    error: ''
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      initialUsers: data,
      currentUsers: data.slice()
    });
  }

  public async getDatas(): Promise<User[]> {
    const annotations = await this.props.getAllUsers();
    return annotations;
  }

  public columns: ConditionnalColumn[] = [
    {
      title: () => this.getColumnSearchBox('id', 'ID'),
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          sorter: (a: User, b: User) => a.id - b.id
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
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
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('role', 'Role'),
      children: [
        {
          title: 'Role',
          dataIndex: 'role.name',
          sorter: (a: User, b: User) =>
            a.role.name.localeCompare(b.role.name, 'fr', {
              sensitivity: 'base'
            })
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
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
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      render: (active: boolean) => (
        <Icon
          type={active ? 'check' : 'close'}
          style={{ color: active ? 'green' : 'red', fontSize: '1.2em' }}
        />
      ),
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
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
                this.props
                  .deleteUser(user)
                  .then(async () => {
                    const users = await this.getDatas();
                    this.setState({
                      user: undefined,
                      initialUsers: users,
                      currentUsers: users.slice(),
                      error: ''
                    });
                  })
                  .catch(error =>
                    this.setState({
                      error: error.data
                    })
                  );
              }}
            />
          </Col>
        </Row>
      ),
      roles: ['Admin']
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
      const role = searches.get('role');
      if (role) {
        if (!record.role.name.toLowerCase().startsWith(role.toLowerCase())) {
          return false;
        }
      }
      const organizations = searches.get('organizations');
      if (organizations) {
        for (const o of record.organizations) {
          if (o.name.toLowerCase().startsWith(organizations.toLowerCase())) {
            return true;
          }
        }
        return false;
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
    const {
      currentUsers,
      user,
      modifyVisible,
      creationVisible,
      error
    } = this.state;
    return [
      <Table<User>
        key={1}
        rowKey='id'
        columns={this.columns.filter(value =>
          value.roles.includes(this.props.user.role.name)
        )}
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
      this.props.user.role.name === 'Admin' && (
        <AddButton
          key={3}
          onClick={() => {
            this.setState({ creationVisible: true });
          }}
        />
      ),
      <UserCreation
        key={4}
        getOrganizations={this.props.getOrganizations}
        getRoles={this.props.getRoles}
        sendUser={this.props.sendUser}
        handleCancel={this.handleCancelCreation}
        handleOk={this.handleOkCreation}
        modalVisible={creationVisible}
      />,
      error && <Alert key={5} message={error} type='error' showIcon={true} />
    ];
  }
}

export default withAuth(Users);
