import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { yupResolver } from '@hookform/resolvers/yup';
import Checkbox from '@iso/components/uielements/checkbox';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import { validationSchema, validationSchema1 } from './validations';
import { useAuthDispatch, useAuthState } from '../auth/hook';
import InputField from '../common/input-field';
import { notification, Radio, Typography } from 'antd';
import ReCAPTCHA from 'react-google-recaptcha';
import Password from './password';

const styles = {
  radio_group: {
    marginBottom: 10,
  },
};

const SignInForm = () => {
  const dispatch = useAuthDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [submitting1, setSubmitting1] = useState(false);
  const [loginWith, setLoginWith] = useState('email');
  const [isOtpVisible, setOTPField] = useState(false);
  const [errorEmail, setErrorMail] = useState('');
  const [errorMobile, setErrorMobile] = useState('');
  const { Text } = Typography;

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const {
    control: controlOne,
    handleSubmit: handleSubmit1,
    formState: { isSubmitting1 },
  } = useForm({
    resolver: yupResolver(validationSchema1),
  });

  const router = useRouter();
  const recaptchaRef = React.createRef();

  const onSubmit = async (values) => {
    setSubmitting(true);
    await axios
      .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/login/`, {
        email: values.email.toLowerCase(),
        password: values.password,
      })
      .then((res) => {
        if (res.status === 200) {
          window.localStorage.setItem('token', res.data.token);
          window.localStorage.setItem('user', JSON.stringify(res.data.user));
          window.localStorage.setItem('roles', JSON.stringify(res.data.roles));
          window.localStorage.setItem('authUser', JSON.stringify(res));
          dispatch({
            type: 'set',
            payload: {
              user: {
                ...res.data.user,
                isLoggedIn: res.data.token && res.data.token !== null,
              },
              roles: res.data.roles,
            },
          });
          if (res.data.roles[0] && res.data.roles[0] === 'trainee') {
            const redirectUrl =
              router.query.redirect === undefined || router.query.redirect === '/'
                ? '/trainee-payment'
                : router.query.redirect;
            window.setTimeout(() => {
              router.push(redirectUrl);
            }, 1000);
          } else {
            window.setTimeout(() => {
              const redirectUrl = router.query.redirect === undefined ? '/job-posts' : router.query.redirect;
              router.push(redirectUrl);
            }, 1000);
          }
          setErrorMail('');
          notification['success']({
            description: 'Logged In Successfully',
          });
        }
      })
      .catch((err) => {
        if (err.response.status === 400) {
          if (err.response.data.attempts_left) {
            setErrorMail(`${err.response.data.message} Attempts Left: ${err.response.data.attempts_left}`);
          } else {
            setErrorMail(err.response.data.message);
          }
        } else if (err.response.status === 500) {
          setErrorMail('Try again later');
        } else if (err.response.data.detail === 'User mobile is not verified.') {
          setErrorMail(err.response.data.detail);
          window.setTimeout(() => {
            setLoginWith('mobile');
          }, 1500);
        } else if (err.response.data.detail === 'User is locked' || err.response.data.detail === 'User is suspended') {
          setErrorMail(err.response.data.detail);
        }
        setSubmitting(false);
      });
  };

  const onSubmit1 = async (values) => {
    if (isOtpVisible) {
      setSubmitting1(true);
      await axios
        .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/login_via_otp/`, {
          mobile_no: values.mobile_no,
          mobile_otp: parseInt(values.mobile_otp),
        })
        .then((res) => {
          if (res.status === 200) {
            window.localStorage.setItem('token', res.data.token);
            window.localStorage.setItem('user', JSON.stringify(res.data.user));
            window.localStorage.setItem('roles', JSON.stringify(res.data.roles));
            window.localStorage.setItem('authUser', JSON.stringify(res));
            dispatch({
              type: 'set',
              payload: {
                user: {
                  ...res.data.user,
                  isLoggedIn: res.data.token && res.data.token !== null,
                },
                roles: res.data.roles,
              },
            });
            notification['success']({
              description: 'Logged In Successfully',
            });

            setErrorMobile('');
            router.push('/job-posts');
          }
        })
        .catch((err) => {
          if (err.response.status === 400) {
            setErrorMobile(err.response.data.message);
          } else if (err.response.status === 500) {
            setErrorMobile('Try again later');
          } else {
            setErrorMobile(err.response.data.detail);
          }
          setSubmitting1(false);
        });
    } else {
      setSubmitting1(true);
      await axios
        .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/send_login_otp/`, {
          mobile_no: values.mobile_no,
        })
        .then((res) => {
          if (res.status === 200) {
            notification['success']({
              description: res.data.message,
            });
            setOTPField(true);
            setSubmitting1(false);
            setErrorMobile('');
          }
        })
        .catch((err) => {
          setSubmitting1(false);
          setErrorMobile(err.response.data.message);
        });
    }
  };

  const ResendOTP = async (values) => {
    await axios
      .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/send_login_otp/`, {
        mobile_no: values.mobile_no,
      })
      .then((res) => {
        if (res.status === 200) {
          notification['success']({
            description: res.data.message,
          });
          setOTPField(true);
          setSubmitting1(false);
          setErrorMobile('');
        }
      })
      .catch((err) => {
        setSubmitting1(false);
        setErrorMobile(err.response.data.detail);
      });
  };

  const handleChange = (e) => {
    setLoginWith(e.target.value);
    setOTPField(false);
    setErrorMail('');
    setErrorMobile('');
  };

  return (
    <>
      <div style={styles.radio_group}>
        <Radio.Group onChange={handleChange} value={loginWith}>
          <Radio value='email'>Email</Radio>
          <Radio value='mobile'>Mobile No</Radio>
        </Radio.Group>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {loginWith === 'email' && (
          <div className='isoSignInForm'>
            <div className='isoInputWrapper'>
              <InputField control={control} name='email' placeholder='Email' />
            </div>

            <div className='isoInputWrapper relative-password'>
              <Password control={control} name='password' placeholder='Password' />
            </div>

            {errorEmail && (
              <div style={{ marginBottom: 10 }}>
                <Text type='danger'>{errorEmail}</Text>
              </div>
            )}

            <div className='isoInputWrapper isoLeftRightComponent' style={{ marginBottom: 10 }}>
              <div className='isoLeftRightComponent'>
                <div>
                  Don't have an account ?{' '}
                  <Link href='/signup'>
                    <a> Register</a>
                  </Link>
                </div>
                <span>
                  <Link href='/forgotpassword'>
                    <a> Forgot password</a>
                  </Link>
                </span>
              </div>
              <Button type='primary' htmlType='submit' disabled={submitting} loading={submitting}>
                <IntlMessages id='page.signInButton' />
              </Button>
            </div>
          </div>
        )}
      </form>
      <form onSubmit={handleSubmit1(onSubmit1)}>
        {loginWith === 'mobile' && (
          <div className='isoSignInForm'>
            <div className='isoInputWrapper'>
              <InputField control={controlOne} name='mobile_no' placeholder='Mobile No' />
            </div>

            {isOtpVisible && (
              <div className='isoInputWrapper'>
                <InputField control={controlOne} name='mobile_otp' placeholder='Mobile OTP' />
              </div>
            )}
            {isOtpVisible && (
              <span className='isoInputWrapper'>
                Didn't received OTP?
                <a onClick={handleSubmit1(ResendOTP)}> Resend OTP</a>
              </span>
            )}

            {errorMobile && (
              <div style={{ marginBottom: 10 }}>
                <Text type='danger'>{errorMobile}</Text>
              </div>
            )}

            <div className='isoInputWrapper isoRightComponent'>
              <Button type='primary' htmlType='submit' disabled={submitting1} loading={submitting1}>
                {isOtpVisible ? <IntlMessages id='page.signInButton' /> : <IntlMessages id='page.requestOTPButton' />}
              </Button>
            </div>
          </div>
        )}
      </form>
    </>
  );
};
export default SignInForm;
