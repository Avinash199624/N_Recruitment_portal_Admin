import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@iso/components/uielements/button';
import { validationSchema } from './validations';
import { useAuthState } from '../auth/hook';
import { getRequestObject } from './apiServices';
import InputField from '../common/input-field';
import { notification } from 'antd';
import Password from '../signin/password';

const SignUpForm = () => {
  const { client } = useAuthState();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const router = useRouter();

  const onSubmit = async (values) => {
    try {
      const requestObject = getRequestObject(values);
      const response = await client.post('/user/signup/', requestObject);
      if (response.data.message == 'User Already Exist' || response.data.message == 'Mobile Number Already Exist') {
        notification['error']({
          description: response.data.message,
        });
      } else {
        notification['success']({
          description: `Verification links have been sent on email and mobile no`,
        });
        router.push('/');
      }
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='isoSignUpForm'>
        <div className='isoInputWrapper'>
          <InputField control={control} name='email' placeholder='Email' />
        </div>

        <div className='isoInputWrapper'>
          <InputField control={control} name='mobile' type='number' placeholder='Mobile' />
        </div>

        <div className='isoInputWrapper relative-password'>
          <Password control={control} name='password' placeholder='Password' />
        </div>

        <div className='isoInputWrapper relative-password'>
          <Password control={control} name='confirmPassword' placeholder='Confirm password' />
        </div>

        <div className='isoInputWrapper isoLeftRightComponent'>
          <Button type='primary' htmlType='submit' disabled={isSubmitting} loading={isSubmitting}>
            Register
          </Button>
        </div>
        <span>
          Already have an account ?
          <Link href='/login'>
            <a> Login</a>
          </Link>
        </span>
      </div>
    </form>
  );
};
export default SignUpForm;
