import * as yup from 'yup';

export const validationSchema = yup
  .object()
  .shape({
    email_otp_code: yup.string().required('Please enter email OTP code').max(6, 'Please enter valid OTP'),
    sms_otp_code: yup.string().required('Please enter email OTP code').max(6, 'Please enter valid OTP'),
  })
  .defined();
