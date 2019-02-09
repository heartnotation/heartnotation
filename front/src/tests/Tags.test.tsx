import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Tags from '../pages/Tags';

Enzyme.configure({ adapter: new Adapter() });

describe('Tags page', () => {
  let mountedPage: Enzyme.ReactWrapper | undefined;

  beforeEach(() => {
    mountedPage = undefined;
  });

  const page = () => {
    if (!mountedPage) {
      mountedPage = mount(<Tags />);
    }
    return mountedPage;
  };

  it('renders correct body', () => {
    expect(page().html()).toEqual('<h2>Tags list</h2>');
  });
});
