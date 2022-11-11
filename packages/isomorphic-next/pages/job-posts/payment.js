import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import moment from 'moment';
import { useRouter } from 'next/router';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  Descriptions,
  Upload,
  notification,
  Typography,
  Tooltip,
} from 'antd';
// Icons
import { UploadOutlined } from '@ant-design/icons';
// Components
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
// Layouts
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import ManageJobPostStyles from '../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import FormStyles from '../../styled/Form.styles';
import { StyledButton } from '../../style/commonStyle';
import { useAuthState } from '../../src/components/auth/hook';
import useUser from '../../src/components/auth/useUser';

const Payment = () => {
  const { client } = useAuthState();
  const router = useRouter();
  const { user } = useUser({});

  const [userId, setUserId] = useState('');
  const [documentsUploaded, setDocumentsUploaded] = useState('');
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { Text } = Typography;

  const {
    query: { details },
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
    setSubmitting(true);
    try {
      const formData = {
        user: userId,
        job_posting: router.query?.job_posting,
        job_position: parseInt(router.query?.job_position),
        payment_date: `${values['payment_date'].format('YYYY-MM-DD')}`,
        amount: values.amount,
        transaction_id: values.transaction_id,
        payment_receipt_image: documentsUploaded,
      };
      const response = await client.post('/user/public/payment_gateways_create/', formData);
      if (response.data.message === 'Payment already done for this Job Position') {
        notification['warning']({
          description: `Payment already done for this job position`,
        });
        window.setTimeout(() => {
          router.push(`/job-posts/${router.query?.job_posting}`);
        }, 2000);
      } else if (response.data?.payment_uuid || response.data?.ts_uuid) {
        notification['success']({
          description: `Payment information added successfully`,
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
      }
    } catch (err) {
      notification['error']({
        description: err.response.data?.message,
      });
    }
    setSubmitting(false);
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
        <title>Payment Info</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <FormStyles>
              <PageHeader>Payment Information</PageHeader>
              <Box>
                {router.query?.url === '/manage-applications/' ? (
                  ''
                ) : (
                  <Descriptions bordered style={{ marginBottom: 20, marginTop: 20 }}>
                    <Descriptions.Item label='Notification ID' span={2}>
                      {router.query?.notification_id}
                    </Descriptions.Item>
                    <Descriptions.Item label='Notification Title' span={2}>
                      {router.query?.notification_title}
                    </Descriptions.Item>
                    <Descriptions.Item label='Position' span={2}>{`${details}`}</Descriptions.Item>
                    <Descriptions.Item label='Age Limit' span={2}>
                      {router.query?.age_limit}
                    </Descriptions.Item>
                    <Descriptions.Item label='Vacancies' span={2}>
                      {router.query?.number_of_vacancies}
                    </Descriptions.Item>
                    <Descriptions.Item label='Salary' span={2}>
                      {router.query?.monthly_emolements}
                    </Descriptions.Item>
                  </Descriptions>
                )}
                <Space direction='vertical'>
                  <Text>
                    Please use below link to apply for this job position.
                    {`The amount to be paid for the position is: `} <strong>{`Rs.${router.query?.fee}/- `}</strong>
                  </Text>
                  <a href='https://www.google.co.in' target='_blank'>
                    <Tooltip title='Go to payment gateway'>
                      <StyledButton type='primary'>Payment Link</StyledButton>
                    </Tooltip>
                  </a>
                  <Text>
                    After successful payment you need to fill the the below payment information with the attachment of
                    payment receipt and submit.
                  </Text>
                </Space>
              </Box>
              <Box>
                <Text type='danger'>
                  <small>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </small>
                </Text>
                <Form name='formStep1' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                  <Row gutter={[16, 0]} justify='space-around'>
                    <Col xs={24} lg={8}>
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
                    <Col xs={24} lg={8}>
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
                    <Col xs={24} lg={8}>
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
                    <Col xs={24} lg={24}>
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
                            `${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=payment_doc&name=${file.name}`
                          }
                          headers={{
                            authorization: `Token ${token}`,
                          }}
                          onSuccess={onSuccessDocumentsUploaded}
                          beforeUpload={(file) => {
                            if (file && file.size > 500000) {
                              notification['error']({
                                description: `File size should be less than 500Kb`,
                              });
                              return false;
                            }
                          }}
                          // onRemove={handleDeleteReceipt}
                          maxCount={1}
                          multiple={false}
                        >
                          <Button icon={<UploadOutlined />}>Click to upload payment receipt</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify='space-around'>
                    <Form.Item>
                      <Space size='middle'>
                        <Link href={router.query?.url || ''}>
                          <Button htmlType='button'>Back</Button>
                        </Link>
                        <Button type='primary' htmlType='submit' disabled={submitting} loading={submitting}>
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

export default Payment;
