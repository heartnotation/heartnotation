import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import UserCreation from '../pages/UserCreation';

Enzyme.configure({ adapter: new Adapter() });

describe('User creation page', () => {
  let mountedPage: Enzyme.ReactWrapper | undefined;

  beforeEach(() => {
    mountedPage = undefined;
  });

  const page = () => {
    if (!mountedPage) {
      mountedPage = mount(<UserCreation />);
    }
    return mountedPage;
  };

  it('renders correct body', () => {
    expect(page().html()).toEqual('<h2>User creation form</h2>');
  });
});
