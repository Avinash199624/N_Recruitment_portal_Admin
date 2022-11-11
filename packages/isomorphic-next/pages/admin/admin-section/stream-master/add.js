import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification } from 'antd';
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
  const [degree, setDegree] = useState([]);
  const [initial, setInitialData] = useState({});

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/education_degree_list/`);
      const initialData = response.data.map((data) => ({
        value: data.education_id,
        label: data.education_degree,
      }));
      setDegree(initialData);
    };
    load();
  }, []);

  const onFormSubmit = async (values) => {
    await client.post('/user/public/education_stream_create/', {
      ...values,
      stream_name: values.stream_name,
      education_degree: initial.education_id,
    });
    notification['success']({
      description: 'Stream added successfully',
    });
    router.push('/admin/admin-section/stream-master');
  };

  const handleDegreeChange = (value, obj) => {
    const DegreeData = { education_id: value, education_degree: obj.name };
    setInitialData(DegreeData);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Stream</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Stream </PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='education_degree'
                      label='Degree Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Degree',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Degree'
                        showSearch
                        onChange={handleDegreeChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {degree.map((data) => (
                          <Option value={data.value} name={data.label}>
                            {data.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='stream_name'
                      label='Stream Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Stream Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Stream Name' maxLength='100' type='text' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/stream-master'>
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
