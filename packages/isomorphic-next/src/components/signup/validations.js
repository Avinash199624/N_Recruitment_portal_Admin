import * as yup from "yup";

export const validationSchema = yup
  .object()
  .shape({
    email: yup.string().required("Please enter email id").email("Please enter valid email id"),
    mobile: yup
      .string()
      .required("Please enter  mobile number")
      .min(10, "Please enter valid mobile number")
      .max(10, "Please enter valid mobile number")
      .matches("^[1-9][0-9]{9}$", "Please enter valid mobile number"),
    password: yup
      .string()
      .required("Please enter password")
      .matches(
        "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$",
        "Password contains least 8 characters, least 1 number, 1 lowercase, 1 uppercase,1 special character"
      ),
    confirmPassword: yup
      .string()
      .required("Please enter confirm password")
      .oneOf([yup.ref("password"), null], "Re- type password not match with password!!!"),
  })
  .defined();
