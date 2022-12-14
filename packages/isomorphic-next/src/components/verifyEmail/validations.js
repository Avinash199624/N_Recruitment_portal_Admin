import * as yup from 'yup';

export const validationSchema = yup
  .object()
  .shape({
    email: yup.string().required('Please enter email id').email('Please enter valid email id'),
  })
  .defined();
