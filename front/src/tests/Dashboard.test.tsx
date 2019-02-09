import React from 'react';
import Enzyme, { mount, shallow, ShallowWrapper, ReactWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockAdapter from 'axios-mock-adapter';
import Dashboard, { Annotation, State } from '../pages/Dashboard';
import Axios from 'axios';
import { API_URL } from '../utils';
import { Table } from 'antd';

Enzyme.configure({ adapter: new Adapter() });

const date = new Date();
const dataSize = 10;
const mockAnnotation = {
  id: 1,
  name: 'First annotation',
  organization: {
    id: 1,
    name: 'Cardiologs',
    is_active: true
  },
  status: {
    id: 1,
    name: 'CREATED',
    is_active: true
  },
  signal_id: 1,
  creation_date: date,
  edit_date: date,
  is_active: true
};

const mockData: Annotation[] = new Array<Annotation>(dataSize)
  .fill(mockAnnotation)
  .map((a, index) => ({ ...a, id: index }));

describe('Dashboard page', () => {
  let mountedPage: ReactWrapper;

  beforeEach(() => {
    mountedPage = mount(<Dashboard />);
  });

  it('renders', () => {
    expect(mountedPage).not.toBeFalsy();
  });

  describe('after API call', () => {
    const promise: Promise<Array<number | Annotation[]>> = Promise.resolve([
      200,
      mockData
    ]);
    beforeEach(() => {
      new MockAdapter(Axios)
        .onGet(`${API_URL}/annotations`)
        .reply(() => promise);
    });

    it('state have correct length', () => {
      const p = mount(<Dashboard />);
      return promise.then(() => {
        setTimeout(() => {
          expect(p.update().state('initialAnnotations')).toHaveLength(dataSize);
        }, 2000);
      });
    });

    it('have correct number of rows', () => {
      const p = mount(<Dashboard />);
      return promise.then(() => {
        setTimeout(() => {
          expect(mountedPage.find(Table).props().dataSource).toHaveLength(
            dataSize
          );
        });
      }, 2000);
    });
  });
});
