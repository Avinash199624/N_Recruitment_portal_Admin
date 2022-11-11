import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification, InputNumber } from 'antd';
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
  const [category, setCategory] = useState([]);
  const [initialList, setInitalList] = useState({});

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/user/relaxation/${id}/`);
      setInitialState({ ...response.data, relaxation: response.data.relaxation?.relaxation_category });
      const list = {
        relaxation_cat_id: response.data.relaxation.relaxation_cat_id,
        relaxation_category: response.data.relaxation.relaxation_category,
      };
      setInitalList(list);

      const DegreeList = await client.get(`user/relaxation_category/`);
      const DegreeData = DegreeList.data.map((data) => ({
        relaxation_cat_id: data.relaxation_cat_id,
        relaxation_category: data.relaxation_category,
      }));
      setCategory(DegreeData);
    };
    if (id) load();
  }, []);

  const handleCategoryChange = (value, obj) => {
    const catData = {
      relaxation_cat_id: value,
      relaxation_category: obj.name,
    };
    setInitalList(catData);
  };

  const onFormSubmit = async (values) => {
    await client.put(`/user/relaxation/${router.query.id}/`, {
      ...values,
      relaxation: {
        relaxation_cat_id: initialList.relaxation_cat_id,
        relaxation_category: initialList.relaxation_category,
      },
    });
    notification['success']({
      description: 'Relaxation updated successfully',
    });
    router.push('/admin/admin-section/relaxation-master');
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Relaxation</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Relaxation</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='relaxation'
                      label='Category Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Category Name',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Category'
                        showSearch
                        onChange={handleCategoryChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {category.map((data) => (
                          <Option value={data.relaxation_cat_id} name={data.relaxation_category}>
                            {data.relaxation_category}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={6}>
                    <Form.Item
                      name='fee_relaxation'
                      label='Fee'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Fee',
                        },
                        {
                          type: 'number',
                          min: 0,
                          max: 100,
                        },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder='Enter Fee' type='number' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={6}>
                    <Form.Item
                      name='age_relaxation'
                      label='Age'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Age',
                        },
                        {
                          type: 'number',
                          min: 0,
                          max: 100,
                        },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder='Enter Age' type='number' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/relaxation-master'>
                        <Button type='button' htmlType='button'>
                          Back
                        </Button>
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
