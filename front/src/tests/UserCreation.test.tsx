import React from 'react';
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import UserCreation from '../pages/UserCreation';
import Router from '../Routes';
import { Role, Organization, User } from '../utils';
import mockRoles from './mocks/roles.json';
import mockOrganizations from './mocks/organizations.json';
import mockUserCreation from './mocks/userCreation.json';
import FormItem from 'antd/lib/form/FormItem';

Enzyme.configure({ adapter: new Adapter() });

const mockDataRole: Role[] = JSON.parse(JSON.stringify(mockRoles));
const mockDataOrganization: Organization[] = JSON.parse(
  JSON.stringify(mockOrganizations)
);
const mockDataUserCreation: User = JSON.parse(JSON.stringify(mockUserCreation));

const mockPromiseRole = () => Promise.resolve(mockDataRole);
const mockPromiseOrganization = () => Promise.resolve(mockDataOrganization);
const mockPromiseUserCreation = () => Promise.resolve(mockDataUserCreation);

describe('User creation page', () => {
  let mountedPage: ReactWrapper;

  beforeEach(() => {
    mountedPage = mount(
      <Router
        defaultRoute={{
          path: '/new/users',
          component: () => (
            <UserCreation
              getOrganizations={mockPromiseOrganization}
              getRoles={mockPromiseRole}
              sendUser={mockPromiseUserCreation}
            />
          ),
          title: 'Create User'
        }}
        routes={[]}
      />
    ).find(UserCreation);
  });

  it('renders correct body', () => {
    expect(mountedPage).not.toBeFalsy();
  });

  describe('after API call', async () => {
    mockPromiseRole().then(() => {
      it('role input have correct length', () => {
        const c = mountedPage
          .find(FormItem)
          .findWhere(p => p.prop('label') === 'Role')
          .children()
          .props()
          .children();
        console.log(c);
        expect(c).toHaveLength(mockDataRole.length);
      });
    });

    mockPromiseOrganization().then(() => {
      it('organization input have correct length', () => {
        expect(
          mountedPage
            .findWhere(p => p.prop('label') === 'Organization')
            .children()
            .props()
            .children()
        ).toHaveLength(mockDataOrganization.length);
      });
    });
  });
});
