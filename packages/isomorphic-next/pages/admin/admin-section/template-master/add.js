import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification } from 'antd';
// Layouts
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
// Components
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
// Styles
import FormStyles from '../../../../styled/Form.styles';
//Providers
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';

const Add = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [commtypes, setCommtypes] = useState([]);
  const [actiontypes, setActiontypes] = useState([]);

  const { TextArea } = Input;

  const onFormSubmit = async (values) => {
    await client.post('/template/create_template/', {
      communication_name: values.communication_name,
      subject: values.subject,
      body: values.body,
      is_active: values.is_active,
      is_delete: false,
      comm_type: { communication_type: values.communication_type },
      action_type: { comm_action_type: values.comm_action_type },
    });
    notification['success']({
      description: 'Template added successfully',
    });
    router.push('/admin/admin-section/template-master');
  };

  useEffect(() => {
    const load = async () => {
      const commtype = await client.get('/template/template_type_list/');
      const dataSource = commtype.data.map((res) => ({
        key: res.id,
        communication_type: res.communication_type,
      }));
      setCommtypes(dataSource);
    };
    const load2 = async () => {
      const actiontype = await client.get('/template/template_action_type_list/');
      const dataSource1 = actiontype.data.map((res) => ({
        key: res.id,
        comm_action_type: res.comm_action_type,
      }));
      setActiontypes(dataSource1);
    };
    load();
    load2();
  }, []);

  if (!user || !user.isLoggedIn) {
    return null;
  }

  const onChangeActive = (e) => {
    console.log('active', e.target.value);
  };

  return (
    <>
      <Head>
        <title>Add Content Template</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Content Template</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='communication_type'
                      label='Communication Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Communication Type',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Communication Type'
                        showSearch
                        getPopupContainer={(trigger) => trigger.parentNode}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {commtypes.map((commtypelist) => (
                          <Option value={commtypelist.communication_type}>{commtypelist.communication_type}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='comm_action_type'
                      label='Communication Action Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Action Type',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Action Type'
                        showSearch
                        getPopupContainer={(trigger) => trigger.parentNode}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {actiontypes.map((actiontypelist) => (
                          <Option value={actiontypelist.comm_action_type}>{actiontypelist.comm_action_type}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='communication_name'
                      label='Template Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Template Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Template Name' maxLength='100' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='subject'
                      label='Subject'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Subject',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Subject' maxLength='100' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='body'
                      label='Body'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Body',
                        },
                      ]}
                    >
                      <TextArea placeholder='Enter Body' allowClear rows={4} maxLength='300' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='is_active'
                      label='Active Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Active Type',
                        },
                      ]}
                    >
                      <Radio.Group onChange={onChangeActive}>
                        <Radio value={true}>True</Radio>
                        <Radio value={false}>False</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/template-master'>
                        <Button htmlType='button'>Back</Button>
                      </Link>
                      <Button type='primary' htmlType='submit'>
                        Save
                      </Button>
                    </Space>
                  </Form.Item>
                </Row>
              </Form>
            </Box>
          </FormStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default Add;
