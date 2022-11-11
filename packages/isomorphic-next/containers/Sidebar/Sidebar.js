import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import Menu from '@iso/components/uielements/menu';

import appActions from '@iso/redux/app/actions';
import Logo from '@iso/components/utility/Logo.next';
import SidebarWrapper from './Sidebar.styles';
import SidebarMenu from './SidebarMenu';
import SIDEBAR_MENU_OPTIONS_ADMIN from './sidebar.navigations.admin';
import SIDEBAR_MENU_OPTIONS from './sidebar.navigations';
import useUser from '../../src/components/auth/useUser';
import {
  ADMIN,
  TRAINEE_MANAGEMENT,
  APPLICATION_SCRUTINY,
  JOB_POSTING_T,
  JOB_POSTING_P,
  MANAGEMENT,
} from '../../static/constants/userRoles';

const Sidebar = () => {
  const { roles, user } = useUser({});
  const dispatch = useDispatch();
  const [sidebarRoutes, setSidebarRoutes] = useState(SIDEBAR_MENU_OPTIONS);

  const { Sider } = Layout;
  const { toggleOpenDrawer, changeOpenKeys, changeCurrent, toggleCollapsed } = appActions;

  useEffect(() => {
    const allRoles = [ADMIN, TRAINEE_MANAGEMENT, APPLICATION_SCRUTINY, JOB_POSTING_T, JOB_POSTING_P, MANAGEMENT];
    if (user) {
      allRoles.forEach((role) => {
        if (roles.includes(role)) {
          setSidebarRoutes(SIDEBAR_MENU_OPTIONS_ADMIN);
        }
      });
    }
  }, [user, roles]);

  const { view, openKeys, collapsed, openDrawer, height, current } = useSelector((state) => state.App);
  const { sidebarTheme } = useSelector((state) => state.ThemeSwitcher);

  function handleClick(e) {
    dispatch(changeCurrent([e.key]));
    if (view === 'MobileView') {
      setTimeout(() => {
        dispatch(toggleCollapsed());
        // dispatch(toggleOpenDrawer());
      }, 100);
    }
  }

  function onOpenChange(newOpenKeys) {
    const latestOpenKey = newOpenKeys.find((key) => !(openKeys.indexOf(key) > -1));
    const latestCloseKey = openKeys.find((key) => !(newOpenKeys.indexOf(key) > -1));
    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = getAncestorKeys(latestCloseKey);
    }
    dispatch(changeOpenKeys(nextOpenKeys));
  }

  const getAncestorKeys = (key) => {
    const map = {
      sub3: ['sub2'],
    };
    return map[key] || [];
  };

  const isCollapsed = collapsed && !openDrawer;
  const mode = isCollapsed === true ? 'vertical' : 'inline';
  const scrollheight = height;
  const styling = {
    backgroundColor: sidebarTheme.backgroundColor,
  };
  const submenuStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: sidebarTheme.textColor,
    height: 48,
  };
  const submenuColor = {
    color: sidebarTheme.textColor,
  };

  const onMouseEnter = () => {
    if (collapsed && openDrawer === false) {
      dispatch(toggleOpenDrawer());
    }
    return;
  };

  const onMouseLeave = () => {
    if (collapsed && openDrawer === true) {
      dispatch(toggleOpenDrawer());
    }
    return;
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <SidebarWrapper>
      <Sider
        breakpoint='lg'
        trigger={null}
        collapsible={true}
        collapsed={isCollapsed}
        width={270}
        className='isomorphicSidebar'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={styling}
      >
        <Logo collapsed={isCollapsed} roles={roles} />
        <Scrollbars style={{ height: scrollheight - 70 }}>
          <Menu
            onClick={handleClick}
            theme='dark'
            mode={mode}
            openKeys={isCollapsed ? [] : openKeys}
            selectedKeys={current}
            onOpenChange={onOpenChange}
            className='isoDashboardMenu'
          >
            {sidebarRoutes.map((option) => (
              <SidebarMenu
                key={option.key}
                item={option}
                submenuColor={submenuColor}
                submenuStyle={submenuStyle}
                userRoles={roles}
              />
            ))}
          </Menu>
        </Scrollbars>
      </Sider>
    </SidebarWrapper>
  );
};

export default Sidebar;
