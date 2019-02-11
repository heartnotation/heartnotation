import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import UserCreation from '../pages/UserCreation';

Enzyme.configure({ adapter: new Adapter() });

describe('User creation page', () => {
  let mountedPage: Enzyme.ReactWrapper;

  beforeEach(() => {
    mountedPage = mount(<UserCreation />);
  });

  it('renders', () => {
    expect(mountedPage).not.toBeFalsy();
  });
});
