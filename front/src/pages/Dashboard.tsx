import React, { Component } from 'react';
import { Table, Input, Icon } from 'antd';
import 'antd/dist/antd.css';
import { ColumnProps } from 'antd/lib/table';
import axios, { AxiosResponse } from 'axios';

interface Organization {
  id: number;
  name: string;
  is_active: boolean;
}

interface Annotation {
  id: number;
  name: string;
  organization:Organization;
  organization_id: number;
  status_id: number;
  signal_id: number;
  creation_date: Date;
  edit_date?: Date;
  is_active: boolean;
}

interface State {
  searches: Map<string, string>;
  initialData: Annotation[];
  currentData: Annotation[];
}

class Dashboard extends Component {
  public state = {
    searches: new Map(),
    initialAnnotations: [],
    currentAnnotations: []
  };

  public componentDidMount = () => {
    const annotationsAjax: Promise<Annotation[]> = axios
      .get<Annotation[]>('/annotations')
      .then((res: AxiosResponse<Annotation[]>) => {
        const data = res.data;
        /* Convert timestamp string to date objects */
        data.forEach((a:Annotation) => {
          a.creation_date = new Date(a.creation_date);
          if(a.edit_date) {
            a.edit_date = new Date(a.edit_date);
          }
        })
        return data;
      });

    Promise.all([annotationsAjax]).then((allResponse: Annotation[][]) => {
      this.setState({
        initialAnnotations: allResponse[0],
        currentAnnotations: allResponse[0].slice()
      });   
    });
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
      dataIndex: 'status_id',
      filters: this.state.initialAnnotations
        .map((a:Annotation) => a.status_id.toString())
        .filter((s, i, array) => array.indexOf(s) === i)
        .map(s => ({ text: s, value: s })),
      onFilter: (value: string, record: Annotation) =>
        record.status_id.toString().indexOf(value) === 0,
      sorter: (a: Annotation, b: Annotation) =>
        a.status_id.toString().localeCompare(b.status_id.toString(), 'en', {
          sensitivity: 'base',
          ignorePunctuation: true
        })
    },
    {
      title: 'Edit',
      dataIndex: 'edit',
      render: edits => <Icon type='edit' theme='twoTone' />
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
    this.state.currentAnnotations = this.state.initialAnnotations.slice();
    const filteredData = this.state.currentAnnotations.filter((record:Annotation) => {
      if (this.state.searches.get('id')) {
        if (
          !record.id
            .toString()
            .startsWith(this.state.searches.get('id'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('signal_id')) {
        if (
          !record.signal_id
            .toString()
            .startsWith(this.state.searches.get('signal_id'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('name')) {
        if (
          !record.name
            .toString()
            .includes(this.state.searches.get('name'))
        ) {
          return false;
        }
      }
      if (record.creation_date && this.state.searches.get('creation_date')) {
        if (
          !record.creation_date
            .toLocaleDateString('fr-FR')
            .includes(this.state.searches.get('creation_date'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('edit_date')) {
        if (!record.edit_date && this.state.searches.get('edit_date') !== '-') {
          return false;
        }
        if (
          record.edit_date &&
          !record.edit_date
            .toLocaleDateString('fr-FR')
            .includes(this.state.searches.get('edit_date'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('status_id')) {
        if (
          !record.status_id
            .toString()
            .startsWith(this.state.searches.get('status_id'))
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

  public render() {
    return (
      <div>
        <Table
          rowKey='id'
          columns={this.columns}
          dataSource={this.state.currentAnnotations}
          pagination={{
            position: 'bottom',
            pageSizeOptions: ['10', '20', '30', '40'],
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </div>
    );
  }
}

export default Dashboard;
