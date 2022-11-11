import React, { useState, useEffect } from 'react';
import { Space, Row, Col, Form, Button, Input, Modal, notification } from 'antd';
import { useAuthDispatch, useAuthState } from '../src/components/auth/hook';
import { useRouter } from 'next/router';

function ChangePassword({ user, userDetails, route }) {
  const [form] = Form.useForm();
  const { client } = useAuthState();
  const dispatch = useAuthDispatch();
  const [modalVisible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = () => {
      if (userDetails) {
        if (userDetails.is_first_login) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    };

    if (userDetails) load();
  }, [userDetails]);

  const changePasswordConfirm = async (values) => {
    const response = await client.put(`/user/change_password/${user}/`, {
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm,
    });
    notification['warning']({
      description: response.data.message,
    });
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('roles');
    window.localStorage.removeItem('authUser');
    window.localStorage.clear();
    dispatch({
      type: 'set',
      payload: {
        user: {
          isLoggedIn: false,
        },
        roles: [],
      },
    });
    router.push(route);
  };

  return (
    <Modal
      title={`You need to change password after first time login`}
      style={{ top: 20 }}
      visible={modalVisible}
      footer={null}
      closable={false}
    >
      <Form name='formStep1' form={form} onFinish={changePasswordConfirm} scrollToFirstError>
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              name='old_password'
              label='Old Password'
              labelCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: 'Please enter old password!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name='new_password'
              label='New Password'
              labelCol={{ span: 24 }}
              rules={[
                {
                  required: true,
                  message: 'Please enter new password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name='confirm'
              label='Confirm Password'
              labelCol={{ span: 24 }}
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please enter confirm password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Row justify='space-around'>
          <Form.Item>
            <Space size='middle'>
              <Button
                type='primary'
                htmlType='submit'
                // onClick={() => {
                //   form
                //     .validateFields()
                //     .then(() => {
                //       form.resetFields();
                //       resetPasswordConfirm();
                //     })
                //     .catch((info) => {
                //       console.log('Validate Failed:', info);
                //     });
                // }}
              >
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  );
}

export default ChangePassword;
