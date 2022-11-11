import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import { validationSchema } from './validations';
import { useAuthState } from '../auth/hook';
import InputField from '../common/input-field';
import axios from 'axios';
import { notification } from 'antd';
import { useRouter } from 'next/router';

const ForgotPasswordForm = () => {
  const { client } = useAuthState();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const onSubmit = async (values) => {
    await axios
      .post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/forgot_password/`, {
        email: values.email.toLowerCase(),
      })
      .then((res) => {
        if (res.status === 200) {
          notification['success']({
            description: res.data.message,
          });
        }
      })
      .catch((err) => {
        notification['error']({
          description: err.response.data.message,
        });
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='isoForgotPassForm'>
        <div className='isoInputWrapper'>
          <InputField control={control} name='email' placeholder='Email' />
        </div>

        <div className='isoInputWrapper'>
          <Button type='primary' htmlType='submit' disabled={isSubmitting} loading={isSubmitting}>
            <IntlMessages id='page.sendRequest' />
          </Button>
        </div>
      </div>
    </form>
  );
};
export default ForgotPasswordForm;
