import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useController } from "react-hook-form";
import Input from "@iso/components/uielements/input";
import { Typography } from "antd";

const InputField = ({ control, name, type, placeholder, ...rest }) => {
  const { Text } = Typography;

  const {
    field: { ref, value, ...inputProps },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: "",
  });

  return (
    <>
      <Input id={name} size='large' type={type} placeholder={placeholder} {...rest} {...inputProps} />
      {error && <Text type='danger'>{error.message}</Text>}
    </>
  );
};

InputField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
};

InputField.defaultProps = {
  type: "text",
  placeholder: "",
};

export default InputField;
