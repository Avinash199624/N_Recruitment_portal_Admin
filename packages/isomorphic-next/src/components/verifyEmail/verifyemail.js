import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuthState } from '../auth/hook';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Button from '@iso/components/uielements/button';
import InputField from '../common/input-field';
import { notification } from 'antd';
import { validationSchema } from './validations';

const VerifyEmail = ({ token }) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    await axios
      .get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/send_verification_mail/${values.email}/`)
      .then((res) => {
        if (res.status === 200) {
          notification['success']({
            description: res.data.message,
          });
          window.setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      })
      .catch((err) => {
        notification['error']({
          description: err.response.data.message,
        });
        setSubmitting(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='isoForgotPassForm'>
        <div className='isoInputWrapper'>
          <InputField control={control} name='email' placeholder='Enter Email' />
        </div>

        <div className='isoInputWrapper isoCenterComponent'>
          <Button type='primary' htmlType='submit' disabled={submitting} loading={submitting}>
            Resend Verification Mail
          </Button>
        </div>

        <span>
          Back to Login Page ?
          <Link href='/login'>
            <a> Login</a>
          </Link>
        </span>
      </div>
    </form>
  );
};
export default VerifyEmail;
