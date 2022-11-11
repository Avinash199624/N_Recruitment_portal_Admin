export const getRequestObject = (values) => ({
  mobile_no: values.mobile,
  email: values.email.toLowerCase(),
  password: values.password,
});
