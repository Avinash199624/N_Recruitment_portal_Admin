import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import IntlMessages from '@iso/components/utility/intlMessages';
import ResetPasswordStyleWrapper from '../../styled/ResetPassword.styles';
import ResetPasswordForm from '../../src/components/reset-password/reset-password-form';
import Logo from '../../../../shared/assets/images/logo.png';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <ResetPasswordStyleWrapper className='isoResetPassPage'>
        <div className='isoFormContentWrapper'>
          <div className='isoFormContent'>
            <div className='isoLogoWrapper'>
              {/* <Link href='/dashboard'>
                <a className='isoMenuHolder'>
                  <span className='nav-text'>
                    <IntlMessages id='page.resetPassTitle' />
                  </span>
                </a>
              </Link> */}{' '}
              <img className='SigninLogo' src={Logo} alt='Neeri Logo' />
            </div>
            <div className='SigninTitle'>
              NEERI Recruitment Portal <br />
              Reset Password
            </div>

            <div className='isoFormHeadText'>
              {/* <h3>
                <IntlMessages id='page.resetPassSubTitle' />
              </h3> */}
              <p>
                <IntlMessages id='page.resetPassDescription' />
              </p>
            </div>
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </ResetPasswordStyleWrapper>
    </>
  );
}
