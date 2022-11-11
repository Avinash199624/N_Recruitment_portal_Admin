import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, notification } from 'antd';
// Layouts
import DashboardLayout from '../../../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
// Styles
import FormStyles from '../../../../../styled/Form.styles';
//Providers
import { useAuthState } from '../../../../../src/components/auth/hook';
import useUser from '../../../../../src/components/auth/useUser';

const Edit = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [initialState, setInitialState] = useState();

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/user/public/education_degree_detail/${id}/`);
      setInitialState({
        ...response.data,
      });
    };
    if (id) load();
  }, []);

  const onFormSubmit = async (values) => {
    await client.put(`/user/public/education_degree_update/${router.query.id}/`, {
      ...values,
      education_degree: values.education_degree,
    });
    notification['success']({
      description: 'Degree updated successfully',
    });
    router.push('/admin/admin-section/education-degree-master');
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Education Degree</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Education Degree</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='education_degree'
                      label='Degree Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Degree Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Degree Name' maxLength='100' type='text' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/education-degree-master'>
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

export default Edit;