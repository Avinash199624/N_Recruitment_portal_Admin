import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SignUpStyleWrapper from '../../styled/SignUp.styles';
import VerifyMobile from '../../src/components/verifyMobile/verifyotp';

export default function SMSTokenVerify() {
  const router = useRouter();
  const { otp } = router.query;
  return (
    <SignUpStyleWrapper className='isoSignUpPage'>
      <div className='isoSignUpContentWrapper'>
        <div className='isoSignUpContent'>
          <div className='isoLogoWrapper'>OTP Verification</div>
          <div className='isoSignUpForm'>
            <VerifyMobile otp={otp} />
          </div>
        </div>
      </div>
    </SignUpStyleWrapper>
  );
}
