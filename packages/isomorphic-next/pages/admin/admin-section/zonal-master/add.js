import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, notification } from 'antd';
// Layouts
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
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

  const onFormSubmit = async (values) => {
    await client.post('/job_posting/zonal_lab_list_and_create/', {
      ...values,
      zonal_lab_name: values.zonal_lab_name,
    });
    notification['success']({
      description: 'Zone added successfully',
    });
    router.push('/admin/admin-section/zonal-master');
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Zonal</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Zonal </PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='zonal_lab_name'
                      label='Zonal Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Zonal Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Zonal Name' maxLength='100' type='text' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/zonal-master'>
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
