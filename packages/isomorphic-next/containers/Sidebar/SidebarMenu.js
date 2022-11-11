import React, { Fragment } from 'react';
import Link from 'next/link';
import Menu from '@iso/components/uielements/menu';
import siteConfig from '@iso/config/site.config';
import IntlMessages from '@iso/components/utility/intlMessages';

const SubMenu = Menu.SubMenu;

export default function SidebarMenu({ userRoles, item, submenuStyle, submenuColor, ...rest }) {
  const { roles, key, label, leftIcon, children } = item;

  const url = siteConfig.dashboard;
  if (children) {
    return (
      <Fragment>
        {roles.some((r) => userRoles.indexOf(r) >= 0) && (
          <SubMenu
            key={key}
            title={
              <span className='isoMenuHolder' style={submenuColor}>
                <i className={leftIcon} />
                <span className='nav-text'>
                  <IntlMessages id={label} />
                </span>
              </span>
            }
            {...rest}
          >
            {children.map(({ key, label, withoutDashboard, roles }) => {
              const linkTo = withoutDashboard ? `${key}` : `${url}/${key}`;

              return (
                <Fragment key={key}>
                  {roles.some((r) => userRoles.indexOf(r) >= 0) && (
                    <Menu.Item style={submenuStyle} key={key}>
                      <Link href={linkTo}>
                        <a href={linkTo} className='isoMenuHolder' style={submenuColor}>
                          <span className='nav-text'>
                            <IntlMessages id={label} />
                          </span>
                        </a>
                      </Link>
                    </Menu.Item>
                  )}
                </Fragment>
              );
            })}
          </SubMenu>
        )}
      </Fragment>
    );
  }
  return (
    <Fragment>
      {roles.some((r) => userRoles.indexOf(r) >= 0) && (
        <Menu.Item key={key} {...rest}>
          <Link href={`${key}`}>
            <a href={`${key}`} className='isoMenuHolder' style={submenuColor}>
              <i className={leftIcon} />
              <span className='nav-text'>
                <IntlMessages id={label} />
              </span>
            </a>
          </Link>
        </Menu.Item>
      )}
    </Fragment>
  );
}
