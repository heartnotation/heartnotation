import React, { Component, MouseEvent } from 'react';
import { Table, Input, Icon, Tag } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { Annotation, Organization, api } from '../utils';
import { withRouter, RouteComponentProps } from 'react-router';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
import EditAnnotationForm from './EditAnnotationForm';
import { createCipheriv } from 'crypto';
import CreateAnnotationForm from './CreateAnnotationForm';

export interface State {
  searches: Map<string, string>;
  initialAnnotations: Annotation[];
  currentAnnotations: Annotation[];
  annotation?: Annotation;
  editVisible: boolean;
  creationVisible: boolean;
}

interface Props extends RouteComponentProps, AuthProps {
  getAnnotations: () => Promise<Annotation[]>;
}

interface ConditionnalColumn extends ColumnProps<Annotation> {
  roles: string[];
}

class Dashboard extends Component<Props, State> {
  public state: State = {
    searches: new Map<string, string>(),
    initialAnnotations: [],
    currentAnnotations: [],
    editVisible: false,
    creationVisible: false
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      initialAnnotations: data,
      currentAnnotations: data.slice()
    });
  }

  public async getDatas(): Promise<Annotation[]> {
    const annotations = await this.props.getAnnotations();
    annotations.forEach((a: Annotation) => {
      a.creation_date = new Date(a.creation_date);
      if (a.edit_date) {
        a.edit_date = new Date(a.edit_date);
      }
    });
    return annotations;
  }

  public columns: ConditionnalColumn[] = [
    {
      title: () => this.getColumnSearchBox('id', 'ID'),
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          sorter: (a: Annotation, b: Annotation) => a.id - b.id
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('signal_id', 'signal ID'),
      children: [
        {
          title: 'Signal ID',
          dataIndex: 'signal_id',
          sorter: (a: Annotation, b: Annotation) =>
            a.signal_id.localeCompare(b.signal_id, 'en', {
              sensitivity: 'base',
              ignorePunctuation: true
            })
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('name', 'annotation'),
      children: [
        {
          title: 'Annotation',
          dataIndex: 'name',
          sorter: (a: Annotation, b: Annotation) =>
            a.name.localeCompare(b.name, 'en', {
              sensitivity: 'base',
              ignorePunctuation: true
            })
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('organization', 'Organizations'),
      children: [
        {
          title: 'Organization',
          dataIndex: 'organization.name',
          sorter: (a: Annotation, b: Annotation) => {
            if (a.organization === undefined) {
              return -1;
            }
            if (b.organization === undefined) {
              return 1;
            }
            return a.organization.name.localeCompare(
              b.organization.name,
              'en',
              {
                sensitivity: 'base',
                ignorePunctuation: true
              }
            );
          },
          render: (_, record: Annotation) => {
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
            const { organization } = record;
            if (organization) {
              const ui = (
                <span>
                  <Tag
                    color={colors[(organization.id % colors.length) - 1]}
                    key={organization.name}
                  >
                    {organization.name}
                  </Tag>
                </span>
              );
              return ui;
            }
            return '';
          }
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('creation_date', 'creation date'),
      children: [
        {
          title: 'Creation date',
          dataIndex: 'creation_date',
          render: (date: Date) => date.toLocaleDateString('fr-FR'),
          sorter: (a: Annotation, b: Annotation) =>
            a.creation_date.getTime() - b.creation_date.getTime()
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: () => this.getColumnSearchBox('edit_date', 'last edit date'),
      children: [
        {
          title: 'Last edit',
          dataIndex: 'edit_date',
          render: (date: Date | undefined) => {
            if (date === undefined) {
              return '-';
            }
            return date.toLocaleDateString('fr-FR');
          },
          sorter: (a: Annotation, b: Annotation) => {
            let timeA = 0;
            let timeB = 0;
            if (a.edit_date !== undefined) {
              timeA = a.edit_date.getTime();
            }
            if (b.edit_date !== undefined) {
              timeB = b.edit_date.getTime();
            }
            return timeA - timeB;
          }
        }
      ],
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: 'Status',
      dataIndex: 'status.name',
      filters: this.state.initialAnnotations
        .map((a: Annotation) => a.status.name)
        .filter((s, i, array) => array.indexOf(s) === i)
        .map(s => ({ text: s, value: s })),
      onFilter: (value: string, record: Annotation) =>
        record.status.name.indexOf(value) === 0,
      sorter: (a: Annotation, b: Annotation) =>
        a.status.name.localeCompare(b.status.name, 'en', {
          sensitivity: 'base',
          ignorePunctuation: true
        }),
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      render: (_, annotation: Annotation) => (
        <Icon
          className='anticon-edit-dashboard'
          type='edit'
          theme='twoTone'
          twoToneColor='#6669c9'
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            this.setState({ editVisible: true, annotation });
          }}
        />
      ),
      roles: ['Gestionnaire', 'Admin']
    }
  ];

  public getColumnSearchBox = (
    dataIndex: keyof Annotation,
    displayText: string
  ) => (
    <div style={{ paddingTop: 8, textAlign: 'center' }}>
      <Input
        className={`search_${dataIndex}`}
        placeholder={`Search by ${displayText}`}
        onChange={e => this.handleChange(dataIndex, e.target.value)}
      />
    </div>
  )

  public handleChange = (dataIndex: keyof Annotation, value: string) => {
    this.state.searches.set(dataIndex, value);
    this.handleSearch();
  }

  public handleSearch = () => {
    const { initialAnnotations, searches } = this.state;

    const filteredData = initialAnnotations
      .slice()
      .filter((record: Annotation) => {
        const id = searches.get('id');
        if (id) {
          if (!record.id.toString().startsWith(id)) {
            return false;
          }
        }
        const signalId = searches.get('signal_id');
        if (signalId) {
          if (!record.signal_id.toString().startsWith(signalId)) {
            return false;
          }
        }
        const name = searches.get('name');
        if (name) {
          if (!record.name.toLowerCase().includes(name.toLowerCase())) {
            return false;
          }
        }
        const creationDate = searches.get('creation_date');
        if (record.creation_date && creationDate) {
          if (
            !record.creation_date
              .toLocaleDateString('fr-FR')
              .includes(creationDate)
          ) {
            return false;
          }
        }
        const editDate = searches.get('edit_date');
        if (editDate) {
          if (!record.edit_date && editDate !== '-') {
            return false;
          }
          if (
            record.edit_date &&
            !record.edit_date.toLocaleDateString('fr-FR').includes(editDate)
          ) {
            return false;
          }
        }
        const statusName = searches.get('status.name');
        if (statusName) {
          if (
            !record.status.name
              .toLowerCase()
              .startsWith(statusName.toLowerCase())
          ) {
            return false;
          }
        }
        const organizations = searches.get('organization');
        if (organizations && record.organization) {
          if (
            !record.organization.name
              .toLowerCase()
              .startsWith(organizations.toLowerCase())
          ) {
            return false;
          }
        }
        return true;
      });

    this.setState({
      currentAnnotations: filteredData
    });
  }

  // Edit Annotation Form
  public editHandleCancel = () => {
    this.editCloseModal();
  }
  public editHandleOk = async () => {
    this.editCloseModal();
    const data = await this.getDatas();
    this.setState({
      initialAnnotations: data,
      currentAnnotations: data.slice()
    });
  }
  public editCloseModal() {
    this.setState({
      editVisible: false,
      annotation: undefined
    });
  }

  // Create Annotation Form
  public createHandleOk = async () => {
    this.createCloseModal();
    const data = await this.getDatas();
    this.setState({
      initialAnnotations: data,
      currentAnnotations: data.slice()
    });
  }
  public createHandleCancel = () => {
    this.createCloseModal();
  }
  public createCloseModal() {
    this.setState({
      creationVisible: false
    });
  }

  public render() {
    const {
      currentAnnotations,
      annotation,
      editVisible,
      creationVisible
    } = this.state;
    return [
      <Table<Annotation>
        key={1}
        rowKey='id'
        columns={this.columns.filter(value =>
          value.roles.includes(this.props.user.role.name)
        )}
        dataSource={currentAnnotations}
        pagination={{
          position: 'bottom',
          pageSizeOptions: ['10', '20', '30', '40'],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
        }}
        onRow={(a: Annotation) => ({
          onClick: () => this.props.history.push(`/annotations/${a.id}`)
        })}
      />,
      this.props.user.role.name !== 'Annotateur' && (
        <AddButton
          key={2}
          onClick={() => {
            this.setState({ creationVisible: true });
          }}
        />
      ),
      annotation && (
        <EditAnnotationForm
          key={3}
          getAnnotations={api.getAnnotations}
          getOrganizations={api.getOrganizations}
          changeAnnotation={api.changeAnnotation}
          getTags={api.getTags}
          annotation={annotation}
          checkSignal={api.checkSignal}
          handleOk={this.editHandleOk}
          handleCancel={this.editHandleCancel}
          editVisible={editVisible}
        />
      ),

      creationVisible && (
        <CreateAnnotationForm
          key={4}
          getTags={api.getTags}
          getOrganizations={api.getOrganizations}
          getAnnotations={api.getAnnotations}
          checkSignal={api.checkSignal}
          sendAnnotation={api.sendAnnotation}
          creationVisible={this.state.creationVisible}
          handleOk={this.createHandleOk}
          handleCancel={this.createHandleCancel}
        />
      )
    ];
  }
}

export default withRouter(withAuth(Dashboard));
