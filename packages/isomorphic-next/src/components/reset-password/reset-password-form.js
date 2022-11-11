import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@iso/components/uielements/button';
import IntlMessages from '@iso/components/utility/intlMessages';
import { validationSchema } from './validations';
import { notification } from 'antd';
import { useAuthState } from '../auth/hook';
import { useRouter } from 'next/router';
import Password from '../signin/password';

const ResetPasswordForm = ({ token }) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });
  const { client } = useAuthState();
  const router = useRouter();

  const onSubmit = async (values) => {
    const response = await client.post(`/user/reset_password/${token}/`, {
      password: values.password,
      confirm_password: values.confirmPassword,
    });
    if (response.status === 200) {
      const msg = response.data?.message;
      notification['success']({
        description: msg,
      });
      window.setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='isoResetPassForm'>
        <div className='isoInputWrapper relative-password'>
          <Password control={control} name='password' placeholder='Password' />
        </div>

        <div className='isoInputWrapper relative-password'>
          <Password control={control} name='confirmPassword' placeholder='Confirm Password' />
        </div>

        <div className='isoInputWrapper'>
          <Button type='primary' htmlType='submit'>
            <IntlMessages id='page.resetPassSave' />
          </Button>
        </div>
      </div>
    </form>
  );
};
export default ResetPasswordForm;
