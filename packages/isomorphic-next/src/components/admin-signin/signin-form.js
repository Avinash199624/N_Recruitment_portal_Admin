import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import axios from 'axios';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import { validationSchema, validationSchema1 } from './validations';
import { useAuthDispatch } from '../auth/hook';
import InputField from '../common/input-field';
import Password from '../signin/password';
import { notification, Radio } from 'antd';
import { Typography } from 'antd';

const styles = {
  radio_group: {
    marginBottom: 10,
  },
};

const SignInForm = () => {
  const dispatch = useAuthDispatch();
  const { Text } = Typography;
  const [submitting, setSubmitting] = useState(false);
  const [submitting1, setSubmitting1] = useState(false);
  const [loginWith, setLoginWith] = useState('email');
  const [isOtpVisible, setOTPField] = useState(false);
  const [error, setError] = useState('');
  const [errorMobile, setErrorMobile] = useState('');

  const {
    control,
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

  const onSubmit = async (values) => {
    setSubmitting(true);
    await axios
      .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/neeri_login/`, {
        email: values.email.toLowerCase(),
        password: values.password,
      })
      .then((res) => {
        if (res.status === 200) {
          window.localStorage.setItem('token', res.data.token);
          window.localStorage.setItem('user', JSON.stringify(res.data.user));
          window.localStorage.setItem('roles', JSON.stringify(res.data.roles));
          dispatch({
            type: 'set',
            payload: {
              user: {
                ...res.data,
                isLoggedIn: res.data.token && res.data.token !== null,
              },
              roles: res.data.roles,
            },
          });
          setError('');
          notification['success']({
            description: `Logged in successfully`,
          });
          router.push('/admin/dashboard');
        }
      })
      .catch((err) => {
        setSubmitting(false);
        if (err.response.status === 400) {
          if (err.response.data.attempts_left) {
            setError(`${err.response.data.message} Attempts Left: ${err.response.data.attempts_left}`);
          } else {
            setError(err.response.data.message);
          }
        } else {
          setError(err.response.data.detail);
        }
      });
  };

  const onSubmit1 = async (values) => {
    if (isOtpVisible) {
      setSubmitting1(true);
      await axios
        .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/neeri_login_via_otp/ `, {
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
            router.push('/admin/dashboard');
          }
        })
        .catch((err) => {
          if (err.response.status === 400) {
            if (err.response.status === 400) {
              setErrorMobile(err.response.data.message);
            } else if (err.response.status === 500) {
              setErrorMobile('Try again later');
            } else {
              setErrorMobile(err.response.data.detail);
            }
          } else if (err.response.status === 500) {
            notification['error']({
              description: `Try again later`,
            });
          } else {
            notification['error']({
              description: err.response.data.detail,
            });
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
          setErrorMobile(err.response.data?.message);
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
    setError('');
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

            {error && (
              <div style={{ marginBottom: 10 }}>
                {' '}
                <Text type='danger'>{error}</Text>
              </div>
            )}

            <div className='isoInputWrapper isoLeftRightComponent'>
              <Link href='/forgotpassword'>
                <a> Forgot password</a>
              </Link>
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

            {errorMobile && (
              <div style={{ marginBottom: 10 }}>
                {' '}
                <Text type='danger'>{errorMobile}</Text>
              </div>
            )}

            {isOtpVisible && (
              <span className='isoInputWrapper'>
                Didn't received OTP?
                <a onClick={handleSubmit1(ResendOTP)}> Resend OTP</a>
              </span>
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
