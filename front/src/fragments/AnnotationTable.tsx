import React, { Component } from 'react';
import { Table, Input, Button, Icon } from 'antd';
import 'antd/dist/antd.css';
import { number, string } from 'prop-types';
import { ColumnProps } from 'antd/lib/table';
import { TapType } from 'tapable';

interface Annotation {
  signalId: number;
  annotation: string;
  creationDate: Date;
  lastEdit?: Date;
  status: string;
}

const data: Annotation[] = [
  {
    signalId: 3219876,
    annotation: 'Annotation name',
    creationDate: new Date('2019-01-22'),
    lastEdit: new Date(2019, 1, 25),
    status: 'IN TREATMENT'
  },
  {
    signalId: 2393282,
    annotation: 'Annotation name',
    creationDate: new Date(2019, 2, 5),
    status: 'NEW'
  },
  {
    signalId: 9837262,
    annotation: 'Annotation name',
    creationDate: new Date(2019, 2, 5),
    status: 'NEW'
  },
  {
    signalId: 2874023,
    annotation: 'Annotation name',
    creationDate: new Date(2019, 1, 2),
    lastEdit: new Date(2019, 1, 10),
    status: 'COMPLETED'
  }
];

class AnnotationTable extends Component {
  public state = {
    searches: new Map(),
    currentData: data.slice()
  };

  public columns: Array<ColumnProps<Annotation>> = [
    {
      title: () => this.getColumnSearchBox('signalId', 'signal ID'),
      children: [
        {
          title: 'Signal ID',
          dataIndex: 'signalId',
          sorter: (a: Annotation, b: Annotation) => a.signalId - b.signalId
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('annotation', 'annotation'),
      children: [
        {
          title: 'Annotation',
          dataIndex: 'annotation',
          sorter: (a: Annotation, b: Annotation) =>
            a.annotation.localeCompare(b.annotation, 'en', {
              sensitivity: 'base',
              ignorePunctuation: true
            })
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('creationDate', 'creation date'),
      children: [
        {
          title: 'Creation date',
          dataIndex: 'creationDate',
          render: (date: Date) => date.toLocaleDateString('fr-FR'),
          sorter: (a: Annotation, b: Annotation) =>
            a.creationDate.getTime() - b.creationDate.getTime()
        }
      ]
    },
    {
      title: () => this.getColumnSearchBox('lastEdit', 'last edit date'),
      children: [
        {
          title: 'Last edit',
          dataIndex: 'lastEdit',
          render: (date: Date | undefined) => {
            if (date === undefined) {
              return '-';
            }
            return date.toLocaleDateString('fr-FR');
          },
          sorter: (a: Annotation, b: Annotation) => {
            let timeA = 0;
            let timeB = 0;
            if (a.lastEdit !== undefined) {
              timeA = a.lastEdit.getTime();
            }
            if (b.lastEdit !== undefined) {
              timeB = b.lastEdit.getTime();
            }
            return timeA - timeB;
          }
        }
      ]
    },
    {
      title: 'Status',
      dataIndex: 'status',
      filters: data
        .map(a => a.status)
        .filter((s, i, array) => array.indexOf(s) === i)
        .map(s => ({ text: s, value: s })),
      onFilter: (value: string, record: Annotation) =>
        record.status.indexOf(value) === 0,
      sorter: (a: Annotation, b: Annotation) =>
        a.status.localeCompare(b.status, 'en', {
          sensitivity: 'base',
          ignorePunctuation: true
        })
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
    this.state.currentData = data.slice();
    const filteredData = this.state.currentData.filter(record => {
      if (this.state.searches.get('signalId')) {
        if (
          !record.signalId
            .toString()
            .startsWith(this.state.searches.get('signalId'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('annotation')) {
        if (
          !record.annotation
            .toString()
            .includes(this.state.searches.get('annotation'))
        ) {
          return false;
        }
      }
      if (record.creationDate && this.state.searches.get('creationDate')) {
        if (
          !record.creationDate
            .toLocaleDateString('fr-FR')
            .includes(this.state.searches.get('creationDate'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('lastEdit')) {
        if (!record.lastEdit && this.state.searches.get('lastEdit') !== '-') {
          return false;
        }
        if (
          record.lastEdit &&
          !record.lastEdit
            .toLocaleDateString('fr-FR')
            .includes(this.state.searches.get('lastEdit'))
        ) {
          return false;
        }
      }
      if (this.state.searches.get('status')) {
        if (
          !record.status
            .toString()
            .startsWith(this.state.searches.get('status'))
        ) {
          return false;
        }
      }
      return true;
    });

    this.setState({
      currentData: filteredData
    });
  }

  public render() {
    return (
      <div>
        <Table
          rowKey='signalId'
          columns={this.columns}
          dataSource={this.state.currentData}
          pagination={{
            position: 'bottom',
            pageSizeOptions: ['10', '20', '30', '40'],
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </div>
    );
  }
}

export default AnnotationTable;
