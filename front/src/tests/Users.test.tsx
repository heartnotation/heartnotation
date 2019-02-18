import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { User } from '../utils';
import Users from '../pages/Users';
import mock from './mocks/users.json';
import Router from '../Routes';

Enzyme.configure({ adapter: new Adapter() });

const mockData: User[] = JSON.parse(JSON.stringify(mock));

const mockPromise = () => Promise.resolve(mockData);

describe('User list page', () => {
  let mountedPage: Enzyme.ReactWrapper;

  beforeEach(() => {
    mountedPage = mount(
      <Router
        defaultRoute={{
          path: '/users',
          component: () => <Users getAllUsers={mockPromise} />,
          title: 'Dashboard'
        }}
        routes={[]}
      />
    ).find(Users);
  });

  it('renders', () => {
    expect(mountedPage).not.toBeFalsy();
  });
});
