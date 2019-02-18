import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { User, Organization, Role } from '../utils';
import Users from '../pages/Users';
import users from './mocks/users.json';
import organizations from './mocks/organizations.json';
import roles from './mocks/roles.json';
import Router from '../Routes';

Enzyme.configure({ adapter: new Adapter() });

const mockUsers: User[] = JSON.parse(JSON.stringify(users));
const mockOrganization: Organization[] = JSON.parse(
  JSON.stringify(organizations)
);
const mockRoles: Role[] = JSON.parse(JSON.stringify(roles));

const promiseUser: () => Promise<User> = () => Promise.resolve(mockUsers[0]);
const promiseUsers: () => Promise<User[]> = () => Promise.resolve(mockUsers);
const promiseRoles: () => Promise<Role[]> = () => Promise.resolve(mockRoles);
const promiseOrganization: () => Promise<Organization[]> = () =>
  Promise.resolve(mockOrganization);

describe('User list page', () => {
  let mountedPage: Enzyme.ReactWrapper;

  beforeEach(() => {
    mountedPage = mount(
      <Router
        defaultRoute={{
          path: '/users',
          component: () => (
            <Users
              getOrganizations={promiseOrganization}
              getRoles={promiseRoles}
              modifyUser={promiseUser}
              sendUser={promiseUser}
              getAllUsers={promiseUsers}
              deleteUser={promiseUser}
            />
          ),
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
