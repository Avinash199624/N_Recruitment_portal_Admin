import React, { useState } from 'react';
import '../../../styled/SignIn.styles';
import { useController } from 'react-hook-form';
import PropTypes from 'prop-types';
import Input from '@iso/components/uielements/input';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const Password = ({ control, name, placeholder, ...rest }) => {
  const { Text } = Typography;
  const [show, setShow] = useState(false);
  const [inputType, setInputType] = useState('password');

  const toggleShow = () => {
    if (show) setInputType('password');
    if (!show) setInputType('text');
    setShow(!show);
  };

  const {
    field: { ref, value, ...inputProps },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: '',
  });

  return (
    <div className=' relative'>
      <Input id={name} size='large' type={inputType} placeholder={placeholder} {...rest} {...inputProps} />
      <i className='show-password-icon'>
        {!show ? <EyeInvisibleOutlined onClick={toggleShow} /> : <EyeOutlined onClick={toggleShow} />}
      </i>
      {error && <Text type='danger'>{error.message}</Text>}
    </div>
  );
};

Password.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Password;
