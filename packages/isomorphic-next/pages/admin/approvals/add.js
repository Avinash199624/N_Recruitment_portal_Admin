import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import moment from 'moment';
import { Row, Col, Form, Input, Button, Space, DatePicker, Select, notification } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Radio from '@iso/components/uielements/radio';
// Layouts
import DashboardLayout from '../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
// Styles
import FormStyles from '../../../styled/Form.styles';
//Providers
import { useAuthState } from '../../../src/components/auth/hook';
import useUser from '../../../src/components/auth/useUser';

const { RangePicker } = DatePicker;

const Add = () => {
  const { client } = useAuthState();
  const [division, setDiv] = useState({});
  const [divOptions, setDivision] = useState([]);
  const [zonalOptions, setZonal] = useState([]);
  const [zonal, setZon] = useState({});
  const [position, setPos] = useState({});
  const [posOptions, setPosition] = useState([]);
  const [value, setValue] = useState(false);
  const [dayCount, setDayCount] = useState(1);
  const [noOfPos, setCount] = useState(1);
  const { user } = useUser({});
  const router = useRouter();
  const [projectDate, setProjectDate] = useState([moment(), moment()]);
  const [formStep2] = Form.useForm();
  const [formStep1] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFormSubmit = async (values) => {
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    const manpower_data = users.map((item) => ({
      position: item.position,
      count: parseFloat(item.count),
      salary: parseFloat(item.salary),
      total_cost: parseFloat(item.total_cost),
    }));
    setSubmitting(true);
    try {
      await client.post('/job_posting/create_project_requirement/', {
        division_name: division,
        zonal_lab: zonal,
        project_number: values.project_number,
        project_title: values.project_title,
        project_start_date: moment(values['project_date'][0]).format('YYYY-MM-DD'),
        project_end_date: moment(values['project_date'][1]).format('YYYY-MM-DD'),
        manpower_position: manpower_data,
        total_estimated_amount: values.total_estimated_amount,
        provisions_made: values.provisions_made,
        min_essential_qualification: values.min_essential_qualification,
        job_requirements: values.job_requirements,
        desired_qualification: values.desired_qualification,
        status: values.status,
      });
      notification['success']({
        description: 'Approval added successfully',
      });
      router.push('/admin/approvals');
    } catch (err) {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/job_posting/division_list_and_create/');
      const zonalLab = await client.get('/job_posting/zonal_lab_list_and_create/');
      const positionData = await client.get('/job_posting/temporary_positions/');
      const division = response.data.map((div) => ({
        value: div.division_id,
        label: div.division_name,
      }));
      const zonal = zonalLab.data.map((zon) => ({
        value: zon.zonal_lab_id,
        label: zon.zonal_lab_name,
      }));
      const position = positionData.data.map((pos) => ({
        value: pos.temp_position_id,
        label: pos.temp_position_master.position_name,
        salary: pos.salary,
      }));
      setDivision(division);
      setZonal(zonal);
      setPosition(position);
    };
    load();
  }, []);

  const onChangeRadio = (e) => {
    setValue(e.target.value);
  };

  const handleDivChange = (value, obj) => {
    const divObj = { division_id: value, division_name: obj.name };
    setDiv(divObj);
  };

  const handleZonalChange = (value, obj) => {
    const ZonalObj = { zonal_lab_id: value, zonal_lab_name: obj.name };
    setZon(ZonalObj);
  };

  const dateChangeHandler = (date, dateString) => {
    setProjectDate(dateString);
    let no_of_days = date[1].diff(date[0], 'days');
    setDayCount(no_of_days);
  };

  const form2InitialValues = {
    users: [{}],
  };
  const handlePositionChange = (value, key, name) => {
    const selectedPositionData = posOptions.filter((position) => position.value === value);
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    users[name].position = selectedPositionData[0].value;
    users[name].salary = selectedPositionData[0].salary;
    users[name].count = null;
    users[name].total_cost = null;
    formStep2.setFieldsValue({ users });
  };

  const handleSalaryChange = (value, key, name) => {
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    let cost = Math.round(users[name].count * parseFloat(value / 30) * dayCount);
    users[name].total_cost = cost.toString();
    formStep2.setFieldsValue({ users });
    let estimated_amt = 0;
    for (let i = 0; i < users.length; i++) {
      estimated_amt += parseInt(users[i].total_cost);
      formStep1.setFieldsValue({ total_estimated_amount: estimated_amt });
    }
  };

  const handleCountChange = (value, key, name) => {
    setCount(value);
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    let cost = Math.round(parseFloat(users[name].salary / 30) * parseFloat(value) * dayCount);
    users[name].total_cost = cost.toString();
    formStep2.setFieldsValue({ users });
    let estimated_amt = 0;
    for (let i = 0; i < users.length; i++) {
      estimated_amt += parseInt(users[i].total_cost);
      formStep1.setFieldsValue({ total_estimated_amount: estimated_amt });
    }
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add Approval</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add Approval</PageHeader>
            <Box>
              <Form form={formStep1} name='formStep1' onFinish={onFormSubmit} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col span={12}>
                    <Form.Item
                      name='division_name'
                      label='Department Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Department Name',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Department Name'
                        onChange={handleDivChange}
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {divOptions.map((div) => (
                          <Option value={div.value} name={div.label}>
                            {div.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='zonal_lab'
                      label='Zone'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Zone',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Zone'
                        onChange={handleZonalChange}
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {zonalOptions.map((zon) => (
                          <Option value={zon.value} name={zon.label}>
                            {zon.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='project_number'
                      label='Project Number'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Project Number',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Project Number' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='project_title'
                      label='Project Title'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Project Title',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Project Title' />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='project_date'
                      label='Start Date - End Date'
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
                        disabledDate={(current) => {
                          return moment().add(-1, 'days') >= current;
                        }}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        value={projectDate}
                        onChange={dateChangeHandler}
                        separator='-'
                        allowClear={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='status'
                      label='Select Status'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Status',
                        },
                      ]}
                    >
                      <Select placeholder='Select Status' getPopupContainer={(trigger) => trigger.parentNode}>
                        <Option value='draft'>DRAFT</Option>
                        <Option value='submitted'>SUBMITTED</Option>
                        <Option value='approved'>APPROVED</Option>
                        <Option value='on hold'>ON HOLD</Option>
                        <Option value='cancelled'>CANCELLED</Option>
                        <Option value='rejected'>REJECTED</Option>
                        <Option value='closed'>CLOSED</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name='manpower_position'
                      label='Position Master'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Please select position',
                        },
                      ]}
                    >
                      <Form
                        form={formStep2}
                        name='formStep2'
                        initialValues={form2InitialValues}
                        onFinish={onFormSubmit}
                        scrollToFirstError
                      >
                        <Form.List name='users'>
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, fieldKey, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'position']}
                                    fieldKey={[fieldKey, 'position']}
                                    label='Position'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please Select Position Name',
                                      },
                                    ]}
                                  >
                                    <Select
                                      placeholder='Please select Position Name'
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                      onChange={(value) => handlePositionChange(value, key, name)}
                                    >
                                      {posOptions.map((pos, index) => (
                                        <Option value={pos.value} key={pos.value}>
                                          {pos.label}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'salary']}
                                    label='Salary'
                                    labelCol={{ span: 24 }}
                                    fieldKey={[fieldKey, 'salary']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please Enter Salary',
                                      },
                                    ]}
                                  >
                                    <Input
                                      placeholder='Salary'
                                      type='number'
                                      onChange={(e) => handleSalaryChange(e.target.value, key, name)}
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'count']}
                                    label='Count'
                                    labelCol={{ span: 24 }}
                                    fieldKey={[fieldKey, 'count']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Enter count',
                                      },
                                      {
                                        pattern: new RegExp(/^[1-9][0-9]*$/),
                                        message: 'Enter a valid number',
                                      },
                                    ]}
                                  >
                                    <Input
                                      placeholder='Enter Count'
                                      onChange={(e) => handleCountChange(e.target.value, key, name)}
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name={[name, 'total_cost']}
                                    label='Total Cost'
                                    labelCol={{ span: 24 }}
                                    fieldKey={[fieldKey, 'total_cost']}
                                    rules={[{ required: true, message: 'Enter Cost' }]}
                                  >
                                    <Input placeholder='Cost' type='number' />
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                  Add Field
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Form>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='provisions_made'
                      label='Have Provisions been made in the Project'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select have Provisions been made in the Project',
                        },
                      ]}
                    >
                      <Radio.Group onChange={onChangeRadio} value={value}>
                        <Radio value={true}>YES</Radio>
                        <Radio value={false}>NO</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Form.Item
                        name='total_estimated_amount'
                        label='Total Cost'
                        labelCol={{ span: 20 }}
                        rules={[
                          {
                            required: true,
                            message: 'Total Cost',
                          },
                        ]}
                      >
                        <Input placeholder='Total Cost' />
                      </Form.Item>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='min_essential_qualification'
                      label='Minimum Essential qualification (strictly as per guidelines) – Subject wise'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Minimum Essential qualification (strictly as per guidelines) – Subject wise',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Minimum Essential qualification(strictly as per guidelines) – Subject wise' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='desired_qualification'
                      label='Desired Qualification/Specification'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Desired Qualification/Specification',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Desired Qualification/Specification' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='job_requirements'
                      label='Job Requirements'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Job Requirements',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Job Requirements' />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify='space-around'>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/approvals'>
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

export default Add;
