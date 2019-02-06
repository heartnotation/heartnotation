import React, { MouseEvent, Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  LinkProps
} from 'react-router-dom';
import { Row, Col, Menu, Icon, Alert } from 'antd';
import { ClickParam } from 'antd/lib/menu';

import logo from '../assets/images/logo.png';
import '../assets/styles/App.css';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

// this is a class because it needs state
class Header extends Component {
  public state = {
    current: 'Home'
  };

  public handleClick = (e: ClickParam) => {
    this.setState({
      current: e.key
    });
  }

  public handleClickHome = (e: MouseEvent<HTMLElement>) => {
    this.setState({
      current: 'Home'
    });
  }

  public render() {
    return (
      <div className='navbar-container'>
        <Link to='/' onClick={this.handleClickHome}>
          <img src={logo} className='logo' alt='logo' />
        </Link>
        <div className='menu-container'>
          <h1 className='page-title'>{this.state.current}</h1>
          <Menu
            onClick={this.handleClick}
            selectedKeys={[this.state.current]}
            mode='horizontal'
            className='main-menu'
          >
            <Menu.Item key='Create User'>
              <Link to='/CreateUser/'>
                <span className='main-menu-item-text'>
                  <Icon type='user-add' className='anticon-title' />
                  Create User
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key='Create Tag'>
              <Link to='/CreateTag/'>
                <span className='main-menu-item-text'>
                  <Icon type='tag' className='anticon-title' />
                  Create Tag
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key='Dashboard'>
              <Link to='/Dashboard/'>
                <span className='main-menu-item-text'>
                  <Icon type='dashboard' className='anticon-title' />
                  Dashboard
                </span>
              </Link>
            </Menu.Item>
            <Menu.Item key='Notifications'>
              <Link to='/Notifications/'>
                <span className='main-menu-item-text'>
                  <Icon type='bell' className='anticon-title' />
                  Notifications
                </span>
              </Link>
            </Menu.Item>
          </Menu>
        </div>
      </div>
    );
  }
}

export default Header;
