import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import moment from 'moment';
import FormStyles from '../../../../styled/Form.styles';
import PageHeader from '@iso/components/utility/pageHeader';
import { Row, Col, Form, Input, Button, Space, notification, DatePicker, Select } from 'antd';
import Box from '@iso/components/utility/box';
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';

const statusAll = [
  { value: 'active', label: 'Active' },
  { value: 'yet to join', label: 'Yet to Join' },
  { value: 'completed', label: 'Completed' },
];

const Edit = () => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialState, setInitialState] = useState();
  const [mentorOptions, setMentorList] = useState([]);
  const [divisions, setDivisionsAll] = useState([]);
  const [division, setDiv] = useState({});
  const [rangeDate, setStartDate] = useState([moment(), moment()]);
  const [status, setStatus] = useState('');
  const [mentors, setMntrs] = useState({});
  const [startStrDate, setStartStrDate] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { RangePicker } = DatePicker;

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/user/trainee/${id}/`);
      setInitialState({
        ...response.data,
        emp_range_date: [moment(response.data.emp_start_date), moment(response.data.emp_end_date)],
      });

      const div = {
        division_id: response.data.division.division_id,
        division_name: response.data.division.division_name,
      };
      setDiv(div);
      const mentors = {
        mentor_id: response.data.mentor.mentor_id,
        mentor_name: response.data.mentor.mentor_name,
      };
      setMntrs(mentors);
      const divMaster = await client.get(`/job_posting/division_list_and_create/`);
      const mentorRes = await client.get(`/user/mentor/`);
      const divData = divMaster.data.map((div) => ({
        division_name: div.division_name,
        division_id: div.division_id,
      }));
      setDivisionsAll(divData);
      const mentorList = mentorRes.data.map((mentor) => ({
        mentor_name: mentor.mentor_name,
        mentor_id: mentor.mentor_id,
      }));
      setMentorList(mentorList);
    };
    if (id) load();
  }, []);

  const onFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await client.put(`/user/trainee/${router.query.id}/`, {
        first_name: values.first_name,
        middle_name: values.middle_name === null ? '' : values.middle_name,
        last_name: values.last_name,
        trainee_id: values.trainee_id,
        generated_trainee_id: initialState.generated_trainee_id,
        email: values.email,
        mobile_no: values.mobile_no,
        division: division,
        mentor: mentors,
        status: status !== '' ? status : initialState.status,
        emp_start_date: values.emp_range_date[0].format('YYYY-MM-DD'),
        emp_end_date: values.emp_range_date[1].format('YYYY-MM-DD'),
      });
      notification['success']({
        description: response.data.message == null ? `Trainee updated Successfully` : ``,
      });
      router.push('/admin/manage-trainees');
    } catch (error) {
      notification['warning']({
        description: `This Mentor already added to 4 Trainee, try with another mentor`,
      });
      setSubmitting(false);
    }
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

  const handleStartDateChange = (date, dateString) => {
    setStartDate([date[0], date[1]]);
    setStartStrDate([dateString[0], dateString[1]]);
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Trainee</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Trainee</PageHeader>
            <Box>
              <Form
                name='formStep1'
                onFinish={onFormSubmit}
                initialValues={initialState}
                key='trainee_id'
                scrollToFirstError
              >
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
                      label='Department'
                      name='division_id'
                      labelCol={{ span: 24 }}
                      initialValue={initialState.division.division_id}
                      rules={[
                        {
                          required: true,
                          message: 'Select Department',
                        },
                      ]}
                    >
                      <Select
                        name={initialState.division.division_name}
                        placeholder='Select Department'
                        onChange={handleDivChange}
                      >
                        {divisions.map((div) => (
                          <Option value={div.division_id} name={div.division_name}>
                            {div.division_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='mentor_id'
                      label='Mentor'
                      labelCol={{ span: 24 }}
                      initialValue={initialState.mentor.mentor_id}
                      rules={[
                        {
                          required: true,
                          message: 'Select Mentor',
                        },
                      ]}
                    >
                      <Select
                        name={initialState.mentor.mentor_name}
                        placeholder='Select Mentor'
                        onChange={handleMentorChange}
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
                      <Input disabled />
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
                      <Input placeholder='Enter Mobile No' type='number' disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      label='Employee Start Date - Employee End Date'
                      labelCol={{ span: 24 }}
                      name='emp_range_date'
                      rules={[
                        {
                          required: true,
                          message: 'Select Date Range',
                        },
                      ]}
                    >
                      <RangePicker onChange={handleStartDateChange} seperator='-' format='YYYY-MM-DD' />
                    </Form.Item>
                  </Col>
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
                      <Select
                        defaultValue={initialState.status}
                        placeholder='Select Status'
                        onChange={handleStatusChange}
                      >
                        {statusAll.map((status) => (
                          <Option value={status.value} name={status.label}>
                            {status.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify='space-around'>
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

export default Edit;
