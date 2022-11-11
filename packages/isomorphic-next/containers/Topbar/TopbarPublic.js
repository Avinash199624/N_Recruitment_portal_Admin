import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import appActions from '@iso/redux/app/actions';
import logo from '@iso/assets/images/logo.png';
import TopbarWrapper from './Topbar.styles';

const { Header } = Layout;
const { toggleCollapsed } = appActions;

class TopbarPublic extends Component {
  render() {
    const { toggleCollapsed, url, customizedTheme, locale } = this.props;
    const collapsed = this.props.collapsed && !this.props.openDrawer;
    const styling = {
      background: customizedTheme.backgroundColor,
      position: 'fixed',
      width: '100%',
      height: 70,
    };
    return (
      <TopbarWrapper>
        <Header
          style={styling}
          className={collapsed ? 'isomorphicTopbar collapsed' : 'isomorphicTopbar'}
          style={{ padding: '0 32px 0 0' }}
        >
          <div className='isoLogoWrapper isoLogoWrapperPublic'>
            <h3>
              <Link href='/'>
                <a href='/'>
                  <img src={logo} alt='Neeri' />
                </a>
              </Link>
            </h3>
          </div>
          <Menu mode='horizontal'>
            <Menu.Item key='1'>
              <Link href='/signup'>
                <a href='/signup'>Signup</a>
              </Link>
            </Menu.Item>
            <Menu.Item key='2'>
              <Link href='/login'>
                <a href='/login'>Login</a>
              </Link>
            </Menu.Item>
          </Menu>
        </Header>
      </TopbarWrapper>
    );
  }
}

export default connect(
  (state) => ({
    ...state.App,
    locale: state.LanguageSwitcher.language.locale,
    customizedTheme: state.ThemeSwitcher.topbarTheme,
  }),
  { toggleCollapsed }
)(TopbarPublic);
