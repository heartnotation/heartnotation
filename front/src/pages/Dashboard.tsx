import React, { Component } from 'react';
import { Table, Input, Icon } from 'antd';
import 'antd/dist/antd.css';
import { ColumnProps } from 'antd/lib/table';
import axios from 'axios';
import { API_URL } from '../utils';
interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

interface Status {
  id: number;
  name: string;
  is_active: boolean;
}

export interface Annotation {
  id: number;
  name: string;
  organization: Organization;
  status: Status;
  signal_id: number;
  creation_date: Date;
  edit_date?: Date;
  is_active: boolean;
}

export interface State {
  searches: Map<string, string>;
  initialAnnotations: Annotation[];
  currentAnnotations: Annotation[];
}

class Dashboard extends Component {
  public state: State = {
    searches: new Map<string, string>(),
    initialAnnotations: [],
    currentAnnotations: []
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      initialAnnotations: data,
      currentAnnotations: data.slice()
    });
  }

  public async getDatas(): Promise<Annotation[]> {
    const { data } = await axios.get<Annotation[]>(`${API_URL}/annotations`);
    data.forEach((a: Annotation) => {
      a.creation_date = new Date(a.creation_date);
      if (a.edit_date) {
        a.edit_date = new Date(a.edit_date);
      }
    });
    return data;
  }

  public columns: Array<ColumnProps<Annotation>> = [
    {
      title: () => this.getColumnSearchBox('id', 'ID'),
      children: [
        {
          title: 'ID',
          dataIndex: 'id',
          sorter: (a: Annotation, b: Annotation) => a.id - b.id
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('signal_id', 'signal ID'),
      children: [
        {
          title: 'Signal ID',
          dataIndex: 'signal_id',
          sorter: (a: Annotation, b: Annotation) => a.signal_id - b.signal_id
        }
      ]
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
      ]
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
      ]
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
      ]
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
        })
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      render: _ => <Icon type='edit' theme='twoTone' />
    }
  ];

  public getColumnSearchBox = (
    dataIndex: keyof Annotation,
    displayText: string
  ) => (
    <div style={{ paddingTop: 8, textAlign: 'center' }}>
      <Input
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
    const { initialAnnotations, searches, currentAnnotations } = this.state;
    this.setState({ currentAnnotations: initialAnnotations.slice() });

    const filteredData = currentAnnotations.filter((record: Annotation) => {
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
        if (!record.name.toString().includes(name)) {
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
        if (!record.status.name.toString().startsWith(statusName)) {
          return false;
        }
      }
      return true;
    });

    this.setState({
      currentAnnotations: filteredData
    });
  }

  public render() {
    const { currentAnnotations } = this.state;
    return (
      <Table
        rowKey='id'
        columns={this.columns}
        dataSource={currentAnnotations}
        pagination={{
          position: 'bottom',
          pageSizeOptions: ['10', '20', '30', '40'],
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
        }}
      />
    );
  }
}

export default Dashboard;
