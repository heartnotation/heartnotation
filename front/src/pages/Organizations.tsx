import React from 'react';
import { Table, Icon, Row, Col } from 'antd';
import { Organization } from '../utils';
import { ColumnProps } from 'antd/lib/table';

interface Props {
  getOrganizations: () => Promise<Organization[]>;
  deleteOrganization: (o: Organization) => Promise<Organization>;
  changeOrganization: (o: Organization) => Promise<Organization>;
}

interface State {
  initialOrganizations: Organization[];
  filteredOrganizations: Organization[];
  selectedOrganization?: Organization;
}

class Organizations extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialOrganizations: [],
      filteredOrganizations: []
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
                this.setState({ selectedOrganization: organization });
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
  public render = () => {
    const { filteredOrganizations } = this.state;
    return <Table columns={this.columns} dataSource={filteredOrganizations} />;
  }
}

export default Organizations;
