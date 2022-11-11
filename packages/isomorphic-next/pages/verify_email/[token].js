import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthState } from '../../src/components/auth/hook';
import { notification } from 'antd';
import VerifyEmail from '../../src/components/verifyEmail/verifyemail';
import ForgotPasswordStyleWrapper from '../../styled/ForgotPassword.styles';
import Logo from '../../../../shared/assets/images/logo.png';

export default function EmailTokenVerify() {
  const router = useRouter();
  const { token } = router.query;
  const { client } = useAuthState();

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`user/email_token_verify/${token}/`);
      const msg = response.data.message;
      if (msg === 'Link Expired, request again.') {
        notification['warning']({
          description: msg,
        });
      } else {
        window.setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };
    if (token) load();
  }, [token]);

  return (
    <ForgotPasswordStyleWrapper className='isoForgotPassPage'>
      <div className='isoFormContentWrapper'>
        <div className='isoFormContent'>
          <div className='isoLogoWrapper'>
            <img className='SigninLogo' src={Logo} alt='Neeri Logo' />
          </div>
          <div className='SigninTitle'>Resend Verification Mail</div>
          <div className='isoSignUpForm'>
            <VerifyEmail token={token} />
          </div>
        </div>
      </div>
    </ForgotPasswordStyleWrapper>
  );
}
