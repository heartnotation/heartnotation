import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import TagCreation from '../pages/TagCreation';

Enzyme.configure({ adapter: new Adapter() });

describe('Tag creation page', () => {
  let mountedPage: Enzyme.ReactWrapper | undefined;

  beforeEach(() => {
    mountedPage = undefined;
  });

  const page = () => {
    if (!mountedPage) {
      mountedPage = mount(<TagCreation />);
    }
    return mountedPage;
  };

  it('renders correct body', () => {
    expect(page().html()).toEqual('<h2>Tag creation form</h2>');
  });
});
