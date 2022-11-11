import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import SignInStyleWrapper from '../styled/SignIn.styles';
import SignInForm from '../src/components/signin/signin-form';
import useUser from '../src/components/auth/useUser';
import Logo from '../../../shared/assets/images/logo.png';
import ReCAPTCHA from 'react-google-recaptcha';

export default function SignInPage(props) {
  //  const { user } = useUser({ redirectTo: '/login' });
  const router = useRouter();
  const { user } = useUser({ redirectTo: router.query.redirect });
  const recaptchaRef = React.createRef();

  useEffect(() => {
    const roles = JSON.parse(window.localStorage.getItem('roles'));

    if (user && user.isLoggedIn !== null && user.isLoggedIn && roles && roles !== null) {
      if (roles.includes('applicant')) {
        router.push('/job-posts');
      } else {
        router.push('/admin/dashboard');
      }
    }
  }, [user]);

  return (
    <SignInStyleWrapper className='isoSignInPage'>
      <div className='isoLoginContentWrapper'>
        <div className='isoLoginContent'>
          <div className='isoLogoWrapper'>
            {' '}
            <img className='SigninLogo' src={Logo} alt='Neeri Logo' />
          </div>
          <div className='SigninTitle'>
            NEERI Recruitment Portal <br />
            Login
          </div>
          <SignInForm />
        </div>
        <div>
          <ReCAPTCHA
            ref={recaptchaRef}
            size='invisible'
            sitekey='6LcrBSkeAAAAAHE-E7fP_pLM0S8pyJExwxmLhHsE'
            // onChange={handleCaptchaVerify}
          />
        </div>
      </div>
    </SignInStyleWrapper>
  );
}
