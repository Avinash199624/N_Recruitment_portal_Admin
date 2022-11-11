import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification } from 'antd';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
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
  const [docTypeId, setDocTypeID] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/document/docs/${id}/`);
      const document = await client.get('/document/document_type/');
      const filtered = document.data?.filter((doc) => doc.doc_type_name === response.data.doc_type);
      setDocTypeID(filtered[0].doc_type_id);
      setInitialState({
        ...response.data,
      });
      setDocuments(document.data);
    };
    if (id) load();
  }, []);

  const onFormSubmit = async (values) => {
    const response = await client.put(`/document/docs/${router.query.id}/`, {
      ...values,
      doc_name: values.doc_name,
      doc_type: docTypeId,
      multiple_allow: values.multiple_allow,
    });
    if (response.status === 200) {
      notification['success']({
        description: 'Document updated successfully',
      });
      router.push('/admin/admin-section/document-master');
    }
  };

  const onChangeActive = (e) => {
    console.log('active', e.target.value);
  };

  const handleDocsChange = (value, obj) => {
    setDocTypeID(value);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Document</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Document </PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
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
                      label='Document Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Document Type',
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder='Select Document Type'
                        // defaultValue={initialState.doc_id}
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

export default Edit;
