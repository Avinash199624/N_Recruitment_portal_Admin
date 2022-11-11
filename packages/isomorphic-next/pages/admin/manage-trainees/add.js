import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../containers/DashboardLayout/DashboardLayout';
import FormStyles from '../../../styled/Form.styles';
import PageHeader from '@iso/components/utility/pageHeader';
import { Row, Col, Form, Input, Button, Space, DatePicker, notification, Select } from 'antd';
import Box from '@iso/components/utility/box';
import { useAuthState } from '../../../src/components/auth/hook';
import useUser from '../../../src/components/auth/useUser';

const config = {
  rules: [
    {
      type: 'object',
      required: true,
      message: 'Select Date',
    },
  ],
};

const statusAll = [
  { value: 'active', label: 'Active' },
  { value: 'yet to join', label: 'Yet to Join' },
  { value: 'completed', label: 'Completed' },
];
const { RangePicker } = DatePicker;
const AddTrainee = () => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [startDate, setStartDate] = useState([moment(), moment()]);
  const [endDate, setEndDate] = useState();
  const [division, setDiv] = useState({});
  const [mentors, setMntrs] = useState({});
  const [dateStr, setDateString] = useState();
  const [status, setStatus] = useState(false);
  const [divOptions, setDivision] = useState([]);
  const [mentorOptions, setMentor] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { Option } = Select;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/job_posting/division_list_and_create/`);
      const mentorRes = await client.get(`/user/mentor/`);
      const division = response.data.map((div) => ({
        value: div.division_id,
        label: div.division_name,
      }));
      const mentors = mentorRes.data.map((mentor) => ({
        mentor_id: mentor.mentor_id,
        mentor_name: mentor.mentor_name,
      }));
      setDivision(division);
      setMentor(mentors);
    };
    load();
  }, []);

  const onFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await client.post(`/user/trainee/`, {
        first_name: values.first_name,
        middle_name: values.middle_name === undefined ? '' : values.middle_name,
        last_name: values.last_name,
        email: values.email,
        mobile_no: values.mobile_no,
        division: division,
        mentor: mentors,
        status: status,
        emp_start_date: values['emp_start_date'][0].format('YYYY-MM-DD'),
        emp_end_date: values['emp_start_date'][1].format('YYYY-MM-DD'),
      });
      if (response.data.message === 'email already exist' || response.data.message === 'mobile no. already exist') {
        notification['error']({
          description: response.data.message,
        });
        setSubmitting(false);
      } else {
        notification['success']({
          description: `Trainee Added Successfully`,
        });
        router.push('/admin/manage-trainees');
      }
    } catch (error) {
      notification['error']({
        description: `This Mentor already added to 4 Trainee, try with another mentor`,
      });
      setSubmitting(false);
    }
  };

  const dateChangeHandler = (date, dateString) => {
    setStartDate(date);
    setEndDate(date);
    setDateString(dateString);
  };

  const handleDivChange = (value, obj) => {
    const divObj = { division_id: value, division_name: obj.name };
    setDiv(divObj);
  };

  const handleMentorChange = (value, obj) => {
    const mentorObj = { mentor_id: value, mentor_name: obj.name };
    setMntrs(mentorObj);
  };

  const handleStatusChange = (value, obj) => {
    setStatus(value);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Trainee</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Trainee</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='first_name'
                      label='First Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter First Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter First Name' maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item name='middle_name' label='Middle Name' labelCol={{ span: 24 }}>
                      <Input placeholder='Enter Middle Name' maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='last_name'
                      label='Last Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Last Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Last Name' maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='division'
                      label='Department'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Department',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Department'
                        showSearch
                        onChange={handleDivChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {divOptions.map((div) => (
                          <Option value={div.value} name={div.label}>
                            {div.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='mentor'
                      label='Mentor'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Mentor',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Mentor'
                        showSearch
                        onChange={handleMentorChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {mentorOptions.map((mentor) => (
                          <Option value={mentor.mentor_id} name={mentor.mentor_name}>
                            {mentor.mentor_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='email'
                      label='Email'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Email',
                        },
                        {
                          type: 'email',
                          message: 'Please enter valid email',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Email' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='mobile_no'
                      label='Mobile No'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Mobile No',
                        },
                        {
                          min: 10,
                          max: 10,
                          message: 'Please enter valid mobile no.',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Mobile No' type='number' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='emp_start_date'
                      label='Employee Start Date - Employee End Date'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Date',
                        },
                      ]}
                    >
                      <RangePicker
                        format='YYYY-MM-DD'
                        value={startDate}
                        onChange={dateChangeHandler}
                        separator='-'
                        getPopupContainer={(trigger) => trigger.parentNode}
                      />
                    </Form.Item>
                  </Col>
                  {/* <Col xs={24} lg={12}>
                    <Form.Item name='emp_end_date' label='Employee End Date' labelCol={{ span: 24 }} {...config}>
                      <DatePicker format='YYYY-MM-DD' value={endDate} onChange={endDateChangeHandler} />
                    </Form.Item>
                  </Col> */}
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='status'
                      label='Status'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Status',
                        },
                      ]}
                    >
                      <Select placeholder='Select Status' onChange={handleStatusChange}>
                        {statusAll.map((status) => (
                          <Option value={status.value} name={status.value}>
                            {status.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ marginTop: 15 }}>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/manage-trainees'>
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
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default AddTrainee;
