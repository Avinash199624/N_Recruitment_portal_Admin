import React from 'react';
import SignInStyleWrapper from '../../styled/SignIn.styles';
import SignInForm from '../../src/components/admin-signin/signin-form';
import Logo from '../../../../shared/assets/images/logo.png';
import ReCAPTCHA from 'react-google-recaptcha';

export default function AdminSignIn(props) {
  const recaptchaRef = React.createRef();

  return (
    <SignInStyleWrapper className='isoSignInPage'>
      <div className='isoLoginContentWrapper'>
        <div className='isoLoginContent text-center'>
          <div className='isoLogoWrapper'>
            {' '}
            <img className='SigninLogo' src={Logo} alt='Neeri Logo' />
          </div>
          <div className='SigninTitle'>
            NEERI Recruitment Portal
            <br />
            Admin Login
          </div>
          <SignInForm />
          <div>
            <ReCAPTCHA
              ref={recaptchaRef}
              size='invisible'
              sitekey='6LfmMbkcAAAAANFP-xS9C_Okji3ysNsPUkHzUdSR'
              // onChange={handleCaptchaVerify}
            />
          </div>
        </div>
      </div>
    </SignInStyleWrapper>
  );
}
