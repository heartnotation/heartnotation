import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Row, Col } from 'antd';
import { ClickParam } from 'antd/lib/menu';

import logo from '../assets/images/logo.png';
import '../assets/styles/App.css';
import { AppRoute } from '../Routes';

interface Props {
  routes: AppRoute[];
}

interface State {
  current: number;
}

// this is a class because it needs state
class Header extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const currentRoute = props.routes.filter(
      r => r.path === window.location.pathname
    )[0];
    this.state = {
      current: currentRoute ? props.routes.indexOf(currentRoute) : -1
    };
  }

  public handleClick = (e: ClickParam) => {
    this.setState({
      current: Number.parseInt(e.key, 10)
    });
  }

  public handleClickHome = () => {
    this.setState({
      current: -1
    });
  }

  public render() {
    const { routes } = this.props;
    const { current } = this.state;

    return (
      <div className='navbar-container'>
        <Link to='/' onClick={this.handleClickHome}>
          <img src={logo} className='logo' alt='logo' />
        </Link>
        <div className='menu-container'>
          <Row>
            <Col span={8}>
              <h1 className='page-title'>
                {routes[current] ? routes[current].title : 'Home'}
              </h1>
            </Col>
            <Col span={16}>
              <Menu
                onClick={this.handleClick}
                selectedKeys={current >= 0 ? [current.toString()] : ['Home']}
                mode='horizontal'
                className='main-menu'
              >
                {routes.map((r, key) => (
                  <Menu.Item key={key}>
                    <Link to={r.path}>
                      <span className='main-menu-item-text'>
                        {r.iconName ? <Icon type={r.iconName} /> : ''}
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

export default Header;
