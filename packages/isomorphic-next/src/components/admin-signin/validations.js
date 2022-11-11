import * as yup from 'yup';

export const validationSchema = yup
  .object()
  .shape({
    email: yup.string().required('Please enter email id').email('Please enter valid email id'),
    password: yup.string().required('Please enter password'),
  })
  .defined();

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const validationSchema1 = yup
  .object()
  .shape({
    mobile_no: yup
      .string()
      .required('Please enter mobile no.')
      .matches(phoneRegExp, 'Enter valid mobile no.')
      .min(10, 'Mobile no. is too short')
      .max(10, 'Enter valid mobile no.'),
  })
  .defined();
