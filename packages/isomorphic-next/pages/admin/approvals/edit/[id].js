import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, DatePicker, Select, notification, InputNumber } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Table from '@iso/components/uielements/table';
import Radio, { RadioGroup } from '@iso/components/uielements/radio';
import { DropdownButtons, DropdownMenu, MenuItem } from '@iso/components/uielements/dropdown';
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
import moment from 'moment';

const Edit = () => {
  const { client } = useAuthState();
  const [department, setDept] = useState({});
  const [initialState, setInitialState] = useState();
  const [deptOptions, setDepartment] = useState([]);
  const [zonalOptions, setZonal] = useState([]);
  const [zonal, setZon] = useState({});
  const [position, setPos] = useState({});
  const [posOptions, setPosition] = useState([]);
  const [value, setValue] = useState(false);
  const { user } = useUser({});
  const router = useRouter();
  const [dayCount, setDayCount] = useState(1);
  const [projectDate, setProjectDate] = useState([moment(), moment()]);
  const [formStep1] = Form.useForm();
  const [formStep2] = Form.useForm();
  const { RangePicker } = DatePicker;
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const getresponse = await client.get(`/job_posting/get_project_requirement/${id}/`);
      const response = await client.get('/job_posting/division_list_and_create/');
      const zonalLab = await client.get('/job_posting/zonal_lab_list_and_create/');
      const positionData = await client.get('/job_posting/temporary_positions/ ');

      const department = response.data.map((div) => ({
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

      setInitialState({
        ...getresponse.data,
        project_start_date: moment(getresponse.data.project_start_date),
        project_end_date: moment(getresponse.data.project_end_date),
        manpower_position: getresponse.data.manpower_position,
        project_date: [moment(getresponse.data.project_start_date), moment(getresponse.data.project_end_date)],
      });

      let days = moment(getresponse.data.project_end_date).diff(moment(getresponse.data.project_start_date), 'days');
      setDayCount(days);

      const dept = {
        division_id: getresponse.data.division_name.division_id,
        division_name: getresponse.data.division_name.division_name,
      };
      setDept(dept);
      const zone = {
        zonal_lab_id: getresponse.data.zonal_lab.zonal_lab_id,
        zonal_lab_name: getresponse.data.zonal_lab.zonal_lab_name,
      };
      setZon(zone);
      setDepartment(department);
      setZonal(zonal);
      setPosition(position);
    };
    if (id) load();
  }, []);

  const onChangeRadio = (e) => {
    setValue(e.target.value);
  };

  const handleDivChange = (value, obj) => {
    const divObj = { division_id: value, division_name: obj.name };
    setDept(divObj);
  };

  const handleZonalChange = (value, obj) => {
    const ZonalObj = { zonal_lab_id: value, zonal_lab_name: obj.name };
    setZon(ZonalObj);
  };

  const handlePositionChange = (value, key, name) => {
    const selectedPositionData = posOptions.filter((position) => position.value === value);
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    users[name].id = key;
    users[name].position = selectedPositionData[0].value;
    users[name].salary = selectedPositionData[0].salary;
    formStep2.setFieldsValue({ users });
  };

  const dateChangeHandler = (date, dateString) => {
    let no_of_days = date[1].diff(date[0], 'days');
    setDayCount(no_of_days);
  };

  const handleCountChange = (value, key, name) => {
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

  const onFormSubmit = async (values) => {
    const fields = formStep2.getFieldsValue();
    const { users } = fields;
    let manpower_data = users.map((item, index) => ({
      id: index + 1,
      position: item.position,
      count: parseInt(item.count),
      salary: parseInt(item.salary),
      total_cost: parseInt(item.total_cost),
      job_posting_requirement: item.job_posting_requirement,
    }));
    setSubmitting(true);
    try {
      await client.put(`/job_posting/update_project_requirement/${router.query.id}/`, {
        id: router.query.id,
        division_name: department,
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
        is_deleted: false,
      });
      notification['success']({
        description: 'Approval updated successfully',
      });
      router.push('/admin/approvals');
    } catch (err) {
      setSubmitting(false);
    }
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Approval</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Approval</PageHeader>
            <Box>
              <Form
                name='formStep1'
                form={formStep1}
                onFinish={onFormSubmit}
                initialValues={initialState}
                scrollToFirstError
              >
                <Row gutter={[16, 0]}>
                  <Col span={12}>
                    <Form.Item
                      name='division_id'
                      label='Department Name'
                      initialValue={initialState.division_name.division_id}
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
                        {deptOptions.map((div) => (
                          <Option value={div.value} name={div.label}>
                            {div.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='zonal_lab_id'
                      label='Zonal Lab'
                      labelCol={{ span: 24 }}
                      initialValue={initialState.zonal_lab.zonal_lab_id}
                      rules={[
                        {
                          required: true,
                          message: 'Select Zonal Lab',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Zonal Lab'
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
                        disabled
                        getPopupContainer={(trigger) => trigger.parentNode}
                        disabledDate={(current) => {
                          return moment().add(-1, 'days') >= current;
                        }}
                        onChange={dateChangeHandler}
                        separator='-'
                      />
                    </Form.Item>
                  </Col>
                  {/* <Col span={8}>
                    <Form.Item
                      name='project_start_date'
                      label='Start Date*'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Please Select Start Date',
                        },
                      ]}
                    >
                      <DatePicker format='YYYY/MM/DD' />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name='project_end_date'
                      label='End Date*'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Please Select End Date',
                        },
                      ]}
                    >
                      <DatePicker format='YYYY/MM/DD' />
                    </Form.Item>
                  </Col> */}
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
                      <Form form={formStep2} name='formStep2' onFinish={onFormSubmit} scrollToFirstError>
                        <Form.List name='users' initialValue={initialState.manpower_position}>
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
                                      {posOptions.map((pos) => (
                                        <Option value={pos.value} name={pos.label}>
                                          {pos.label}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'salary']}
                                    fieldKey={[fieldKey, 'salary']}
                                    label='Salary'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please enter salary',
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
                                    fieldKey={[fieldKey, 'count']}
                                    label='Count'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please enter count',
                                      },
                                    ]}
                                  >
                                    <InputNumber
                                      placeholder='Enter Count'
                                      min={1}
                                      onChange={(value) => handleCountChange(value, key, name)}
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name={[name, 'total_cost']}
                                    fieldKey={[fieldKey, 'total_cost']}
                                    label='Total Cost'
                                    labelCol={{ span: 24 }}
                                    rules={[{ required: true, message: 'Enter Cost' }]}
                                  >
                                    <Input placeholder='Cost' />
                                  </Form.Item>
                                  <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                              ))}
                              <Form.Item>
                                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                  Add field
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
                      label='Select Qualification*'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Qualification',
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
                      label='Subject Wise'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Subject Wise',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Subject Wise' />
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
                      label='Job Requirement'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Job Requirement',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Job Requirement' />
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

export default Edit;
