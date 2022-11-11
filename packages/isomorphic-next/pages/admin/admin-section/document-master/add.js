import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification } from 'antd';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
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
  const [doc_type, setDoc_type] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/document/document_type/');
      setDocuments(response.data);
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onFormSubmit = async (values) => {
    const response = await client.post('/document/docs/', {
      ...values,
      doc_name: values.doc_name,
      doc_type: doc_type,
      multiple_allow: values.multiple_allow !== undefined ? values.multiple_allow : false,
    });

    if (response.status === 200) {
      notification['success']({
        description: 'Document updated successfully',
      });
      router.push('/admin/admin-section/document-master');
    }
  };

  const handleDocsChange = (value, obj) => {
    setDoc_type(value);
  };

  const onChangeActive = (e) => {
    console.log('active', e.target.value);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Document</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Document </PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='doc_name'
                      label='Document Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Document Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Document Name' maxLength='100' type='text' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='doc_type'
                      label='Select Document Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Document Type',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Document Type'
                        showSearch
                        optionFilterProp='children'
                        onChange={handleDocsChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {documents.map((docs) => (
                          <Option value={docs.doc_type_id} name={docs.doc_type_id}>
                            {docs.doc_type_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item name='multiple_allow' label='Multiple Document Allow' labelCol={{ span: 24 }}>
                      <Radio.Group onChange={onChangeActive} defaultValue={false}>
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/document-master'>
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
