import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Users from '../pages/Users';

Enzyme.configure({ adapter: new Adapter() });

describe('User list page', () => {
  let mountedPage: Enzyme.ReactWrapper | undefined;

  beforeEach(() => {
    mountedPage = undefined;
  });

  const page = () => {
    if (!mountedPage) {
      mountedPage = mount(<Users />);
    }
    return mountedPage;
  };

  it('renders correct body', () => {
    expect(page().html()).toEqual('<h2>Users list</h2>');
  });
});
