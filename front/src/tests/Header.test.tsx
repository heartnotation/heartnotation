import React from 'react';
import Header from '../fragments/Header';
import Router, { AppRoute } from '../Routes';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Menu } from 'antd';

Enzyme.configure({ adapter: new Adapter() });

const voidFunction = () => <div />;

const defaultRoute: AppRoute = {
  path: '/',
  exact: true,
  component: voidFunction,
  title: 'Dashboard',
  iconName: 'plus'
};

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
      mountedRouter = mount(
        <Router defaultRoute={defaultRoute} routes={routes} />
      );
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
    const routeIndex = 'About';
    window.history.pushState(
      {},
      'Header component test',
      routes[2].path
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
