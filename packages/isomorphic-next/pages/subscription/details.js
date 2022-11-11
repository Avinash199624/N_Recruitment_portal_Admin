import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Head from 'next/head';
import { useAuthState } from '../../src/components/auth/hook';
import useUser from '../../src/components/auth/useUser';
import moment from 'moment';
import Table from '@iso/components/uielements/table';
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
  Collapse,
  InputNumber,
  Tooltip,
} from 'antd';
// Icons
import { UploadOutlined, SettingOutlined, EditOutlined, EyeTwoTone } from '@ant-design/icons';
// Layouts
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import FormStyles from '../../styled/Form.styles';
import ManageJobPostStyles from '../../containers/Admin/ManageJobPost/ManageJobPost.styles';
// Components
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';

const SubscriptionDetail = () => {
  const { client } = useAuthState();
  const { Panel } = Collapse;
  const { user } = useUser({});
  const [userId, setUserId] = useState('');
  const [documentsUploaded, setDocumentsUploaded] = useState('');
  const [updatedDoc, setUpdatedDoc] = useState('');
  const [token, setToken] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [userName, setName] = useState('');
  const [traineeDetails, setTraineeDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(undefined);
  const [isClicked, setClicked] = useState(false);
  const [paymentDetails, setDetails] = useState([{}]);
  const [fee, setFee] = useState(null);
  const [receiptFile, setReceiptFile] = useState([]);
  const { Text, Title } = Typography;
  const { Column } = Table;

  useEffect(() => {
    const load = () => {
      setUserId(user?.user_id);
      setUserDetails(user);
    };

    const loadDetails = async () => {
      const response = await client.get(`/user/public/temp_subs_payment_gateways_detail/${user.user_id}/`);
      setName(user.username);
      if (response.data.length > 0) {
        setSubscriptionDetails(response.data && response.data[0]);
        setPaymentHistory(response.data && response.data.length > 0 ? response.data : []);
        setDetails({
          transaction_id: response.data[0].transaction_id,
          payment_date: moment(response.data[0].payment_date),
          amount: response.data[0].amount,
          payment_receipt_image: response.data[0].payment_receipt_image,
        });
        setReceiptFile([
          {
            uid: 'uid',
            name:
              response.data[0].payment_receipt_image.split('/temp_subscription_payment_receipt/')[1] !== null ||
              response.data[0].payment_receipt_image.split('/temp_subscription_payment_receipt/')[1] !== ''
                ? response.data[0].payment_receipt_image.split('/temp_subscription_payment_receipt/')[1]
                : 'receipt',
            status: 'done',
            url: response.data[0].payment_receipt_image,
          },
        ]);
      }
    };

    const loadTraineeDetails = async () => {
      const response = await client.get(`/user/public/subscription_detail/${user?.user_id}/`);
      setTraineeDetails(response.data);
    };

    const loadFees = async () => {
      const response = await client.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/fee/fee_list/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.data.isEmpty) {
        const data = response.data.find((fee) => fee.category === 'Contract_Basis');
        setFee(data.fee);
      }
    };

    if (user && user.isLoggedIn) {
      setToken(localStorage.getItem('token'));
      load();
      loadDetails();
      loadTraineeDetails();
      loadFees();
    }
  }, [user]);

  const onFormSubmit = async (values) => {
    const formData = {
      user: userId,
      payment_date: `${values['payment_date'].format('YYYY-MM-DD')}`,
      amount: parseInt(values.amount),
      transaction_id: values.transaction_id,
      payment_receipt_image: documentsUploaded,
    };

    const response = await client.post('/user/public/temp_subs_payment_gateways_create/', formData);

    if (response?.status === 200) {
      notification['success']({
        description: `Payment created successfully`,
      });
      window.setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const onHandleSubmit = async (values) => {
    const formData = {
      ts_uuid: subscriptionDetails?.ts_uuid,
      user: userId,
      payment_date: subscriptionDetails?.payment_date,
      amount: values.amount,
      transaction_id: values.transaction_id,
      payment_receipt_image: updatedDoc,
    };
    await client
      .put('/user/public/temp_subs_payment_gateways_update/', formData)
      .then((res) => {
        console.log(res.ok);
        if (res.status === 200) {
          notification['success']({
            description: `Payment updated successfully`,
          });
          window.setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
        notification['error']({
          description: err,
        });
      });
  };

  const onSuccessDocumentsUploaded = (data) => {
    if (data.message === 'File uploaded successfully') {
      notification['success']({
        description: `${data.doc_name} file uploaded successfully`,
      });
      setDocumentsUploaded(data.doc_file_path);
    }
  };

  const onSuccessUpdated = (data) => {
    if (data.message === 'File uploaded successfully') {
      notification['success']({
        description: `${data.doc_name} file uploaded successfully`,
      });
      setUpdatedDoc(data.doc_file_path);
    }
  };

  const handleEdit = () => {
    setClicked(!isClicked);
  };

  const genExtra = () => (
    <SettingOutlined
      onClick={(event) => {
        // If you don't want click extra trigger collapse, you can prevent this:
        event.stopPropagation();
      }}
    />
  );

  return (
    <>
      <Head>
        <title>Payment Details</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <FormStyles>
              <PageHeader>Subscription Details</PageHeader>
              {traineeDetails?.message !== 'Information not available' ? (
                <Box>
                  <Descriptions bordered style={{ marginBottom: 20 }}>
                    <Descriptions.Item label='Name' span={2}>
                      {userName}
                    </Descriptions.Item>
                    <Descriptions.Item label='Start Date' span={2}>
                      {traineeDetails?.start_date}
                    </Descriptions.Item>
                    <Descriptions.Item label='End Date' span={2}>
                      {traineeDetails?.end_date}
                    </Descriptions.Item>
                    <Descriptions.Item label='Status' span={2}>
                      {traineeDetails?.status === 'active' ? (
                        <Text strong type='success'>
                          ACTIVE
                        </Text>
                      ) : (
                        <Text strong type='danger'>
                          EXPIRED
                        </Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Box>
              ) : (
                ''
              )}
              <Row justify='space-between' style={{ marginBottom: 10 }}>
                <Text>Subscription details not found.</Text>
                <Space>
                  <a href='https://www.google.co.in' target='_blank'>
                    <Tooltip title='Go to payment gateway'>
                      <Button type='primary'>Payment Link</Button>
                    </Tooltip>
                  </a>
                </Space>
              </Row>
              <Collapse accordion>
                <Panel header='Add New Payment' key='1' extra={genExtra}>
                  <Text type='danger'>
                    {' '}
                    <small>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </small>
                  </Text>
                  <Form name='paymentDetailsForm' onFinish={onFormSubmit} initialValues={{}} scrollToFirstError>
                    <Row gutter={[16, 0]} justify='space-around'>
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
                          <Button type='primary' htmlType='submit'>
                            Save
                          </Button>
                        </Space>
                      </Form.Item>
                    </Row>
                  </Form>
                </Panel>
              </Collapse>

              {subscriptionDetails !== null ? (
                <div style={{ marginTop: 20 }}>
                  <Row justify='space-between'>
                    <Title level={5}>Last Payment Details</Title>
                    <Button type='primary' icon={<EditOutlined />} onClick={handleEdit}>
                      Edit
                    </Button>
                  </Row>
                  <Box style={{ marginTop: 10 }}>
                    {!isClicked ? (
                      <Row>
                        <Col span={24}>
                          {subscriptionDetails?.message !== 'Temporary subscription payment detail not found' ? (
                            <Descriptions bordered style={{ marginBottom: 20 }}>
                              <Descriptions.Item label='Name' span={2}>
                                {userName}
                              </Descriptions.Item>
                              <Descriptions.Item label='Payment Date' span={2}>
                                {subscriptionDetails?.payment_date}
                              </Descriptions.Item>
                              <Descriptions.Item label='Transaction ID' span={2}>
                                {subscriptionDetails?.transaction_id}
                              </Descriptions.Item>
                              <Descriptions.Item label='Amount' span={2}>
                                {subscriptionDetails?.amount}
                              </Descriptions.Item>
                            </Descriptions>
                          ) : (
                            <Text>Payment details not found.</Text>
                          )}
                        </Col>
                      </Row>
                    ) : (
                      <>
                        <Text type='danger'>
                          {' '}
                          <small>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </small>
                        </Text>
                        <Form
                          name='paymentDetailsForm'
                          onFinish={onHandleSubmit}
                          initialValues={{ ...paymentDetails }}
                          scrollToFirstError
                        >
                          <Row gutter={[16, 0]} justify='space-around'>
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
                                    type: 'number',
                                    min: subscriptionDetails?.amount,
                                  },
                                ]}
                              >
                                <InputNumber placeholder='Enter Amount' />
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
                                <DatePicker
                                  disabled
                                  format='YYYY-MM-DD'
                                  disabledDate={(d) => !d || d.isAfter(moment())}
                                />
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
                                  onSuccess={onSuccessUpdated}
                                  beforeUpload={(file) => {
                                    if (file && file.size > 500000) {
                                      notification['error']({
                                        description: `file size should be less than 500Kb`,
                                      });
                                      return false;
                                    }
                                  }}
                                  defaultFileList={[...receiptFile]}
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
                                <Button type='primary' htmlType='submit'>
                                  Save
                                </Button>
                              </Space>
                            </Form.Item>
                          </Row>
                        </Form>
                      </>
                    )}
                  </Box>
                </div>
              ) : (
                ''
              )}
              <div style={{ marginTop: 20 }}>
                {paymentHistory && paymentHistory.length > 0 ? (
                  <Collapse accordion>
                    <Panel header='Payment History' key='1' extra={genExtra}>
                      <Table dataSource={paymentHistory} getPopupContainer={(trigger) => trigger}>
                        <Column title='Transaction ID' dataIndex='transaction_id' key='transaction_id' />
                        <Column title='Amount' dataIndex='amount' key='amount' />
                        <Column title='Payment Date' dataIndex='payment_date' key='payment_date' />
                        <Column
                          title='Receipt'
                          dataIndex='payment_receipt_image'
                          key='payment_receipt_image'
                          render={(text, record) => (
                            <a href={record.payment_receipt_image} target='_blank'>
                              View
                            </a>
                          )}
                        />
                      </Table>
                    </Panel>
                  </Collapse>
                ) : (
                  ''
                )}
              </div>
            </FormStyles>
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default SubscriptionDetail;
