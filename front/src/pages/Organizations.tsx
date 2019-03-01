import React from 'react';
import { Table, Icon, Row, Col, Input } from 'antd';
import { Organization } from '../utils';
import { withAuth, AuthProps } from '../utils/auth';
import { ColumnProps } from 'antd/lib/table';
import AddButton from '../fragments/fixedButton/AddButton';
import OrganizationForm from '../fragments/organization/OrganizationForm';

interface Props extends AuthProps {
  getOrganizations: () => Promise<Organization[]>;
  deleteOrganization: (o: Organization) => Promise<Organization>;
  changeOrganization: (o: Organization) => Promise<Organization>;
  createOrganization: (o: Organization) => Promise<Organization>;
}

interface State {
  initialOrganizations: Organization[];
  filteredOrganizations: Organization[];
  selectedOrganization?: Organization;
  createVisible: boolean;
  modifyVisible: boolean;
  error: string;
}

interface ConditionnalColumn extends ColumnProps<Organization> {
  roles: string[];
}

class Organizations extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialOrganizations: [],
      filteredOrganizations: [],
      createVisible: false,
      modifyVisible: false,
      error: ''
    };
  }

  public columns: ConditionnalColumn[] = [
    {
      title: (
        <div style={{ paddingTop: 4, textAlign: 'center' }}>
          <Input
            className={`search_id`}
            placeholder={`Search by ID`}
            onChange={e =>
              this.setState({
                filteredOrganizations: this.state.initialOrganizations.filter(
                  o => o.id.toString().startsWith(e.currentTarget.value)
                )
              })
            }
          />
        </div>
      ),
      roles: ['Gestionnaire', 'Admin'],
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          width: '10%',
          sorter: (a: Organization, b: Organization) => a.id - b.id
        }
      ]
    },
    {
      title: (
        <div style={{ paddingTop: 4, textAlign: 'center', width: '30%' }}>
          <Input
            className={`search_name`}
            placeholder={`Search by name`}
            onChange={e =>
              this.setState({
                filteredOrganizations: this.state.initialOrganizations.filter(
                  o => o.name.toLowerCase().startsWith(e.currentTarget.value)
                )
              })
            }
          />
        </div>
      ),
      roles: ['Gestionnaire', 'Admin'],
      children: [
        {
          title: 'Name',
          dataIndex: 'name',
          width: '30%',
          sorter: (a: Organization, b: Organization) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en', {
              sensitivity: 'base',
              ignorePunctuation: true
            })
        }
      ]
    },
    {
      title: 'Is Active',
      dataIndex: 'is_active',
      width: '10%',
      sorter: (a: Organization, b: Organization) => {
        if (a.is_active && !b.is_active) {
          return -1;
        } else if (!a.is_active && b.is_active) {
          return 1;
        } else {
          return 0;
        }
      },
      render: (active: boolean) => (
        <Icon
          type={active ? 'check' : 'close'}
          style={{ color: active ? 'green' : 'red', fontSize: '1.2em' }}
        />
      ),
      roles: ['Gestionnaire', 'Admin']
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: '10%',
      roles: ['Admin'],
      render: (_, organization: Organization) => (
        <Row>
          <Col sm={24} md={3}>
            <Icon
              type='edit'
              theme='twoTone'
              twoToneColor='#6669c9'
              style={{ fontSize: '1.3em' }}
              onClick={() => {
                this.setState({
                  selectedOrganization: organization,
                  modifyVisible: true
                });
              }}
            />
          </Col>
          <Col sm={24} md={3}>
            <Icon
              type='delete'
              theme='twoTone'
              twoToneColor='red'
              style={{ fontSize: '1.3em' }}
              onClick={async () => {
                const { deleteOrganization, getOrganizations } = this.props;
                try {
                  await deleteOrganization(organization);
                } catch (_) {
                  this.setState({ error: 'Failed to delete organization' });
                }
                try {
                  const orgas = await getOrganizations();
                  this.setState({
                    initialOrganizations: orgas,
                    filteredOrganizations: orgas.slice(),
                    selectedOrganization: undefined,
                    error: ''
                  });
                } catch (_) {
                  this.setState({ error: 'Failed to refresh datas' });
                }
              }}
            />
          </Col>
        </Row>
      )
    }
  ];
  public componentDidMount = async () => {
    const { getOrganizations } = this.props;
    try {
      const orgas = await getOrganizations();
      this.setState({
        initialOrganizations: orgas,
        filteredOrganizations: orgas.slice()
      });
    } catch (_) {
      this.setState({ error: 'Failed to load datas' });
    }
  }
  private handleSubmit = async () => {
    const { getOrganizations } = this.props;
    try {
      const orgas = await getOrganizations();
      this.setState({
        initialOrganizations: orgas,
        filteredOrganizations: orgas.slice(),
        createVisible: false,
        error: ''
      });
    } catch (_) {
      this.setState({ error: 'Failed to refresh datas' });
    }
  }
  private handleCancel = () => {
    this.setState({
      modifyVisible: false,
      createVisible: false,
      selectedOrganization: undefined
    });
  }
  public render = () => {
    const {
      filteredOrganizations,
      selectedOrganization,
      modifyVisible,
      createVisible
    } = this.state;
    const { changeOrganization, createOrganization, user } = this.props;
    return [
      <Table
        key={1}
        rowKey='id'
        columns={this.columns.filter(c => c.roles.includes(user.role.name))}
        dataSource={filteredOrganizations}
      />,
      user.role.name === 'Admin' && (
        <AddButton
          key={2}
          onClick={() => this.setState({ createVisible: true })}
        />
      ),
      modifyVisible && (
        <OrganizationForm
          key={3}
          visible={modifyVisible}
          defaultValue={selectedOrganization}
          onSubmit={changeOrganization}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        />
      ),
      createVisible && (
        <OrganizationForm
          key={4}
          visible={createVisible}
          onSubmit={createOrganization}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
        />
      )
    ];
  }
}

export default withAuth(Organizations);
