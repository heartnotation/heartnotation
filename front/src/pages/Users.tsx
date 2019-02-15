import React, { Component } from 'react';
import { Table, Input, Icon, Tag } from 'antd';
import 'antd/dist/antd.css';
import { ColumnProps } from 'antd/lib/table';
import { User, Organization, Role } from '../utils';
import { withRouter, RouteComponentProps } from 'react-router';
import EditUserForm from './EditUserForm';
export interface State {
  searches: Map<string, string>;
  initialUsers: User[];
  currentUsers: User[];
  user?: User;
  modalVisible: boolean;
}

interface Props extends RouteComponentProps {
  getOrganizations: () => Promise<Organization[]>;
  getRoles: () => Promise<Role[]>;
  modifyUser: (datas: User) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (datas: User) => Promise<User>;
}

class Users extends Component<Props, State> {
  public state: State = {
    searches: new Map<string, string>(),
    initialUsers: [],
    currentUsers: [],
    modalVisible: false
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
          style={{ color: active ? 'green' : 'red' }}
        />
      )
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, user: User) => [
        <Icon
          key={1}
          type='edit'
          theme='twoTone'
          style={{ marginLeft: 10 }}
          onClick={() => {
            this.setState({ modalVisible: true, user });
          }}
        />,
        <Icon
          key={2}
          type='delete'
          theme='twoTone'
          style={{ marginLeft: 10 }}
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
      ]
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

  public handleCancel = () => {
    this.closeModal();
  }

  public handleOk = async () => {
    this.closeModal();
    const users = await this.getDatas();
    this.setState({
      user: undefined,
      initialUsers: users,
      currentUsers: users.slice()
    });
  }

  public closeModal() {
    this.setState({
      user: undefined,
      modalVisible: false
    });
  }

  public render() {
    const { currentUsers, user, modalVisible } = this.state;
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
        onRow={a => ({
          //   onClick: () => this.props.history.push(`/annotations/${a.id}`)
        })}
      />,
      user && (
        <EditUserForm
          key={2}
          getOrganizations={this.props.getOrganizations}
          getRoles={this.props.getRoles}
          modifyUser={this.props.modifyUser}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
          user={user}
          modalVisible={modalVisible}
        />
      )
    ];
  }
}

export default withRouter(Users);
