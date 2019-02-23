import React from 'react';
import { Table, Icon, Row, Col } from 'antd';
import { Organization } from '../utils';
import { ColumnProps } from 'antd/lib/table';
import AddButton from '../fragments/fixedButton/AddButton';
import OrganizationForm from '../fragments/organization/OrganizationForm';
import { getOrganizations } from '../utils/api';

interface Props {
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
}

class Organizations extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialOrganizations: [],
      filteredOrganizations: [],
      createVisible: false,
      modifyVisible: false
    };
  }

  public columns: Array<ColumnProps<Organization>> = [
    {
      title: 'ID',
      dataIndex: 'id',
      sorter: (a: Organization, b: Organization) => a.id - b.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a: Organization, b: Organization) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en', {
          sensitivity: 'base',
          ignorePunctuation: true
        })
    },
    {
      title: 'Is Active',
      dataIndex: 'is_active',
      width: '10%',
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
      width: '10%',
      render: (_, organization: Organization) => (
        <Row>
          <Col sm={24} md={12}>
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
          <Col sm={24} md={12}>
            <Icon
              type='delete'
              theme='twoTone'
              twoToneColor='red'
              style={{ fontSize: '1.3em' }}
              onClick={async () => {
                await this.props.deleteOrganization(organization);
                const orgas = await this.props.getOrganizations();
                this.setState({
                  initialOrganizations: orgas,
                  filteredOrganizations: orgas.slice(),
                  selectedOrganization: undefined
                });
              }}
            />
          </Col>
        </Row>
      )
    }
  ];
  public componentDidMount = async () => {
    const { getOrganizations } = this.props;
    const orgas = await getOrganizations();
    this.setState({
      initialOrganizations: orgas,
      filteredOrganizations: orgas.slice()
    });
  }
  private handleCreate = async (o: Organization) => {
    const { createOrganization } = this.props;
    await createOrganization(o);
    const orgas = await getOrganizations();
    this.setState({
      initialOrganizations: orgas,
      filteredOrganizations: orgas.slice(),
      createVisible: false
    });
  }
  private handleModify = async (o: Organization) => {
    const { changeOrganization } = this.props;
    await changeOrganization(o);
    const orgas = await getOrganizations();
    this.setState({
      initialOrganizations: orgas,
      filteredOrganizations: orgas.slice(),
      modifyVisible: false
    });
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
    return [
      <Table
        key={1}
        rowKey='id'
        columns={this.columns}
        dataSource={filteredOrganizations}
      />,
      <AddButton
        key={2}
        onClick={() => this.setState({ createVisible: true })}
      />,
      <OrganizationForm
        key={3}
        visible={modifyVisible}
        defaultValue={selectedOrganization}
        onSubmit={this.handleModify}
        onCancel={this.handleCancel}
      />,
      <OrganizationForm
        key={4}
        visible={createVisible}
        onSubmit={this.handleCreate}
        onCancel={this.handleCancel}
      />
    ];
  }
}

export default Organizations;
