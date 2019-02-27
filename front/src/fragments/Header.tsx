import React, { Component } from 'react';
import {
  Link,
  RouteComponentProps,
  withRouter,
  matchPath
} from 'react-router-dom';
import { Menu, Icon, Row, Col } from 'antd';
import { ClickParam } from 'antd/lib/menu';

import logo from '../assets/images/logo2.png';
import '../assets/styles/App.css';
import { AppRoute } from '../Routes';

interface Props extends RouteComponentProps {
  defaultRoute: AppRoute;
  routes: AppRoute[];
  hiddenRoutes: AppRoute[];
}

interface State {
  current: AppRoute;
}

const matchedRoute = (
  currentPath: string,
  routes: AppRoute[]
): AppRoute | undefined =>
  routes.find(
    r =>
      matchPath(currentPath, {
        path: r.path,
        exact: r.exact,
        strict: true,
        sensitive: false
      }) !== null
  );

// this is a class because it needs state
class Header extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const c = matchedRoute(props.location.pathname, [
      ...props.routes,
      ...props.hiddenRoutes
    ]);
    this.state = {
      current: c ? c : props.defaultRoute
    };
  }

  public handleClick = (e: ClickParam) => {
    const { routes, defaultRoute } = this.props;
    const c = routes.find(r => r.title === e.key);
    this.setState({
      current: c ? c : defaultRoute
    });
  }

  public handleClickHome = () => {
    this.setState({
      current: this.props.defaultRoute
    });
  }

  public render() {
    const { routes } = this.props;
    const { current } = this.state;

    return (
      <div className='navbar-container'>
        <div className='menu-container'>
          <Row>
            <Col span={8}>
              <Link to='/' onClick={this.handleClickHome}>
                <img src={logo} className='logo' alt='logo' />
              </Link>
              <h1 className='page-title'>{current.title}</h1>
            </Col>
            <Col span={16}>
              <Menu
                onClick={this.handleClick}
                selectedKeys={[current.title]}
                mode='horizontal'
                className='main-menu'
              >
                {routes.map(r => (
                  <Menu.Item key={r.title}>
                    <Link to={r.path}>
                      <span className='main-menu-item-text'>
                        {r.iconName ? (
                          <Icon className='anticon-title' type={r.iconName} />
                        ) : (
                          ''
                        )}
                        {r.title}
                      </span>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withRouter(Header);
