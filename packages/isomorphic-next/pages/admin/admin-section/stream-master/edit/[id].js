import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification } from 'antd';
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
  const [degrees, setDegrees] = useState([]);
  const [intial, setInitial] = useState({});

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/user/public/education_stream_detail/${id}/`);
      setInitialState({
        ...response.data,
      });
      const Data = {
        education_id: response.data.education_id,
        education_degree: response.data.education_degree,
      };
      setInitial(Data);

      const DegreeList = await client.get(`/user/public/education_degree_list/`);
      const DegreeData = DegreeList.data.map((list) => ({
        label: list.education_degree,
        value: list.education_id,
      }));
      setDegrees(DegreeData);
    };
    if (id) load();
  }, []);

  const onFormSubmit = async (values) => {
    await client.put(`/user/public/education_stream_update/${router.query.id}/`, {
      ...values,
      stream_name: values.stream_name,
      education_degree: values.education_degree,
    });
    notification['success']({
      description: 'Stream updated successfully',
    });
    router.push('/admin/admin-section/stream-master');
  };

  const handleDegreeChange = (value, obj) => {
    const DegreeData = { education_id: value, education_degree: obj.name };
    setInitial(DegreeData);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Stream</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Stream</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
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
                        name={initialState.education_degree}
                        onChange={handleDegreeChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {degrees.map((data) => (
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

export default Edit;
