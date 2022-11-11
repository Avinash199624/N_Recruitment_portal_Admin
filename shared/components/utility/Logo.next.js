import React from 'react';
import Link from 'next/link';
import siteConfig from '@iso/config/site.config';

import logo from '@iso/assets/images/logo.png';

const LogoNext = ({ collapsed, roles }) => {
  return (
    <div className='isoLogoWrapper'>
      {collapsed ? (
        <div>
          <h3>
            <i className={siteConfig.siteIcon} />
          </h3>
        </div>
      ) : (
        <h3>
          <Link href={roles[0] === 'admin' ? '/admin/dashboard' : '/dashboard'}>
            <a>
              <img src={logo} alt='Neeri' />
            </a>
          </Link>
        </h3>
      )}
    </div>
  );
};
export default LogoNext;
