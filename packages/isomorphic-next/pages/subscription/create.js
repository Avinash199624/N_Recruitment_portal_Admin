import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useAuthState } from '../../src/components/auth/hook';
import useUser from '../../src/components/auth/useUser';
import { Row, Col, Form, Input, Button, Space, DatePicker, Upload, notification, Typography, Tooltip } from 'antd';
// Icons
import { UploadOutlined } from '@ant-design/icons';
// Layouts
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import FormStyles from '../../styled/Form.styles';
import ManageJobPostStyles from '../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import { StyledButton } from '../../style/commonStyle';
// Components
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';

const Create = () => {
  const { Dragger } = Upload;
  const { client } = useAuthState();
  const router = useRouter();
  const { user } = useUser({});
  const [userId, setUserId] = useState('');
  const [documentsUploaded, setDocumentsUploaded] = useState('');
  const [token, setToken] = useState('');
  const { Text } = Typography;
  const {
    query: { fee },
  } = router;

  useEffect(() => {
    const load = () => {
      setUserId(user?.user_id);
    };

    if (user && user.isLoggedIn) {
      setToken(localStorage.getItem('token'));
      load();
    }
  }, [user, router]);

  const onFormSubmit = async (values) => {
    try {
      const formData = {
        user: userId,
        payment_date: `${values['payment_date'].format('YYYY-MM-DD')}`,
        amount: parseInt(values.amount),
        transaction_id: values.transaction_id,
        payment_receipt_image: documentsUploaded,
      };
      const response = await client.post('/user/public/temp_subs_payment_gateways_create/', formData);
      if (response.status === 200) {
        notification['success']({
          description: `Subscription added successfully`,
        });
        const response = await client.post(`/user/apply/${router.query?.job_posting}/`, {
          positions: [parseInt(router.query?.job_position)],
        });
        window.setTimeout(() => {
          router.push({
            pathname: `/job-posts/document_upload`,
            query: {
              position_id: router.query?.job_position,
              job_posting: router.query?.job_posting,
              applicantId: response.data?.applications[0],
            },
          });
        }, 2000);
        window.setTimeout(() => {
          router.push(`/job-posts/${router.query?.job_posting}`);
        }, 2000);
      }
    } catch (err) {
      notification['error']({
        description: err.response.data?.message,
      });
    }
  };

  const onSuccessDocumentsUploaded = (data) => {
    if (data.message === 'File uploaded successfully') {
      notification['success']({
        description: `${data.doc_name} file uploaded successfully`,
      });
      setDocumentsUploaded(data.doc_file_path);
    }
  };

  const handleDeleteReceipt = async () => {
    try {
      let req = {
        document_id: documentsUploaded,
        document_type: 'applicant',
      };
      const response = await client.delete(`/user/delete/document/`, { data: req });
      if (response.status === 200) {
        notification['success']({
          description: `Document deleted successfully`,
        });
      }
    } catch (err) {
      notification['error']({
        description: `Unable to delete document`,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Subscription Info</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <FormStyles>
              <PageHeader>Subscription Information</PageHeader>
              <Box>
                <Space direction='vertical'>
                  <Text>
                    Please use below link to subscribe for portal.
                    {`The amount to be paid for subscription is: `} <strong>{`Rs.${fee}/- `}</strong>
                    <br />
                  </Text>
                  <a href='https://www.google.co.in' target='_blank'>
                    <Tooltip title='Go to payment gateway'>
                      <StyledButton type='primary'>Payment Link</StyledButton>
                    </Tooltip>
                  </a>
                  <Text>
                    After successful payment you need to fill the the below payment information and submit it to proceed
                    further for your application.
                  </Text>
                </Space>
              </Box>
              <Box>
                <Text type='danger'>
                  {' '}
                  <small>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </small>
                </Text>
                <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name='transaction_id'
                        label='Transaction ID'
                        labelCol={{ span: 24 }}
                        rules={[
                          {
                            required: true,
                            message: 'Enter Transaction Id',
                          },
                        ]}
                      >
                        <Input placeholder='Enter Transaction ID' type='text' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name='amount'
                        label='Amount'
                        labelCol={{ span: 24 }}
                        rules={[
                          {
                            required: true,
                            message: 'Enter amount',
                          },
                          {
                            pattern: new RegExp(/^[1-9][0-9]*$/),
                            message: 'Enter a valid number',
                          },
                          {
                            min: 1,
                            message: 'Enter a valid number',
                          },
                        ]}
                      >
                        <Input placeholder='Enter Amount' />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name='payment_date'
                        label='Payment Date'
                        labelCol={{ span: 24 }}
                        rules={[
                          {
                            required: true,
                            message: 'Select payment date',
                          },
                        ]}
                      >
                        <DatePicker format='YYYY-MM-DD' disabledDate={(d) => !d || d.isAfter(moment())} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name='payment_receipt_image'
                        label='Payment Receipt'
                        labelCol={{ span: 24 }}
                        rules={[
                          {
                            required: true,
                            message: 'Upload payment receipt',
                          },
                        ]}
                      >
                        <Upload
                          accept='.pdf,.png,.jpg,.jpeg'
                          action={(file) =>
                            `${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=temp_subs_payment_doc&name=${file.name}`
                          }
                          headers={{
                            authorization: `Token ${token}`,
                          }}
                          onSuccess={onSuccessDocumentsUploaded}
                          beforeUpload={(file) => {
                            if (file && file.size > 500000) {
                              notification['error']({
                                description: `file size should be less than 500Kb`,
                              });
                              return false;
                            }
                          }}
                          //onRemove={handleDeleteReceipt}
                          maxCount={1}
                          multiple={false}
                        >
                          <Button icon={<UploadOutlined />}>Click to upload payment receipt</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Item>
                      <Space size='middle'>
                        <Link href={`/job-posts/${router.query?.job_posting}`}>
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
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default Create;
