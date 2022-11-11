import * as yup from 'yup';

export const validationSchema = yup
  .object()
  .shape({
    firstname: yup.string().required('Please enter First name'),
    lastname: yup.string().required('Please enter Last name'),
  })
  .defined();
