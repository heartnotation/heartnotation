import React, { Component } from 'react';
import { Table, Input, Button, Icon } from 'antd';
import 'antd/dist/antd.css';
import { number, string } from 'prop-types';

interface Annotation {
  signalId: number;
  annotation: string;
  creationDate: Date;
  lastEdit?: Date;
  status: string;
}

const data = [
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

const columns = [
  {
    title: 'Signal ID',
    dataIndex: 'signalId',
    sorter: (a: Annotation, b: Annotation) => a.signalId - b.signalId
  },
  {
    title: 'Annotation',
    dataIndex: 'annotation',
    sorter: (a: Annotation, b: Annotation) =>
      a.annotation.localeCompare(b.annotation, 'en', {
        sensitivity: 'base',
        ignorePunctuation: true
      })
  },
  {
    title: 'Creation date',
    dataIndex: 'creationDate',
    render: (date: Date) => date.toLocaleDateString('fr-FR'),
    sorter: (a: Annotation, b: Annotation) =>
      a.creationDate.getTime() - b.creationDate.getTime()
  },
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
  },
  {
    title: 'Status',
    dataIndex: 'status',
    sorter: (a: Annotation, b: Annotation) =>
      a.status.localeCompare(b.status, 'en', {
        sensitivity: 'base',
        ignorePunctuation: true
      })
  }
];

class AnnotationTable extends Component {
  public state = {
    searchText: ''
  };

  public getColumnSearchProps = (dataIndex: number) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            'this.searchInput = node';
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type='primary'
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon='search'
          size='small'
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size='small'
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <Icon type='search' style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: string[]) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => 'this.searchInput.select()');
      }
    },
    render: (text: string) => <mark>this.state.searchText</mark>
  })

  public handleSearch = (selectedKeys: string[], confirm: VoidFunction) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  public handleReset = (clearFilters: VoidFunction) => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  public render() {
    return (
      <div>
        <Table rowKey='signalId' columns={columns} dataSource={data} />,
      </div>
    );
  }
}

export default AnnotationTable;
