import Head from 'next/head';

import React from 'react';
import Link from 'next/link';
import IntlMessages from '@iso/components/utility/intlMessages';
import ForgotPasswordStyleWrapper from '../styled/ForgotPassword.styles';
import ForgotPasswordForm from '../src/components/forgot-password/forgot-password-form';
import Logo from '../../../shared/assets/images/logo.png';

const ForgotPassword = () => {
  return (
    <ForgotPasswordStyleWrapper className='isoForgotPassPage'>
      <div className='isoFormContentWrapper'>
        <div className='isoFormContent'>
          <div className='isoLogoWrapper'>
            {/* <Link href='/dashboard'>
              <a className='isoMenuHolder'>
                <span className='nav-text'>
                  <IntlMessages id='page.forgetPassTitle' />
                </span>
              </a>
            </Link> */}
            <img className='SigninLogo' src={Logo} alt='Neeri Logo' />
          </div>
          <div className='SigninTitle'>
            NEERI Recruitment Portal <br />
            Forgot Password ?
          </div>

          <div className='isoFormHeadText'>
            {/* <h3>
              <IntlMessages id='page.forgetPassSubTitle' />
            </h3> */}
            <p>
              <IntlMessages id='page.forgetPassDescription' />
            </p>
          </div>
          <ForgotPasswordForm />
          <span style={{ marginTop: '20px' }}>
            Back to
            <Link href='/login'>
              <a> Login</a>
            </Link>
          </span>
        </div>
      </div>
    </ForgotPasswordStyleWrapper>
  );
};

export default () => (
  <>
    <Head>
      <title>Forgot Password</title>
    </Head>
    <ForgotPassword />
  </>
);
