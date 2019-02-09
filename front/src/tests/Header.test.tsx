import React from 'react';
import Header from '../fragments/Header';
import Router, { AppRoute } from '../Routes';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Menu } from 'antd';

Enzyme.configure({ adapter: new Adapter() });

const voidFunction = () => <div />;

const routes: AppRoute[] = [
  {
    path: '/annotations/new',
    exact: true,
    component: voidFunction,
    title: 'Create annotation',
    iconName: 'plus'
  },
  {
    path: '/users/new',
    component: voidFunction,
    title: 'Create User'
  },
  {
    path: '/about',
    component: voidFunction,
    title: 'About',
    iconName: 'question'
  }
];

describe('Header', () => {
  let mountedRouter: Enzyme.ReactWrapper | undefined;

  beforeEach(() => {
    mountedRouter = undefined;
  });

  const router = () => {
    if (!mountedRouter) {
      mountedRouter = mount(<Router routes={routes} />);
    }
    return mountedRouter;
  };

  it('renders enough items', () => {
    expect(
      router()
        .find(Header)
        .find('.main-menu')
        .children()
        .filter(Menu.Item).length
    ).toEqual(routes.length);
  });

  it('focus the right tab', () => {
    const routeIndex = 2;
    window.history.pushState(
      {},
      'Header component test',
      routes[routeIndex].path
    );
    expect(
      router()
        .find(Header)
        .find(Menu)
        .first()
        .props()
    ).toHaveProperty('selectedKeys', [`${routeIndex}`]);
  });
});
