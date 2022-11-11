import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { validationSchema } from '../../../../containers/Admin/NeeriUsers/validations';
import FormStyles from '../../../../styled/Form.styles';
import PageHeader from '@iso/components/utility/pageHeader';
import { Row, Col, Form, Input, Button, Space, Checkbox, Radio, DatePicker, notification, Select } from 'antd';
import Box from '@iso/components/utility/box';
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { getDivisions, getZonals } from '../../../../src/apiCalls';

const CasteAll = [
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'obc', label: 'OBC' },
  { value: 'gen', label: 'GENRAL' },
  { value: 'pwd', label: 'PWD' },
];

const config = {
  rules: [
    {
      type: 'object',
      required: true,
      message: 'Select Date of Birth',
    },
  ],
};

const toPascalCase = (s) => {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
};

const AddUser = () => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialState, setInitialState] = useState();
  const [checkList, setCheckList] = useState();
  const [roleList, setRoleList] = useState();
  const [zoneOption, setZoneOption] = useState([]);
  const [divOption, setDivOption] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [date, setDate] = useState();
  const [dateStr, setDateString] = useState();
  const [loading, setLoading] = useState(true);
  const [caste, setCaste] = useState('');
  const [religion, setReligion] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/role_master/`);
      const religionResponse = await client.get(`/user/public/applicant_religions/`);
      setReligion(religionResponse.data);
      const rolesData = response.data.map((roles) => ({
        label: toPascalCase(roles.role_name),
        value: roles.role_id,
      }));
      setCheckList(rolesData.filter((role) => role.label !== 'Applicant' && role.label !== 'Trainee'));
    };

    const getZonalList = async () => {
      const response = await getZonals(client);
      setZoneOption(response);
    };

    const getDivisionList = async () => {
      const response = await getDivisions(client);
      setDivOption(response);
    };

    if (user && user.isLoggedIn) {
      load();
      getZonalList();
      getDivisionList();
    }
  }, [user]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleChange = (options) => {
    const updatedRoleList = options.map((options) => ({ role_id: options }));
    setRoleList(updatedRoleList);
  };

  const dateChangeHandler = (date, dateString) => {
    setDate(date);
    setDateString(dateString);
  };

  const handleDivChange = (value, obj) => {
    const divs = obj.map((item) => ({
      division_id: item.value,
    }));
    setDivisions(divs);
  };

  const handleZoneChange = (value, obj) => {
    const zone = obj.map((item) => ({
      zonal_lab_id: item.value,
    }));
    setZones(zone);
  };

  const handleCasteChange = (value) => {
    setCaste(value);
  };

  const onFormSubmit = async (values) => {
    const response = await client.post(`/user/create_neeri_user/`, {
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      email: values.email,
      password: values.password,
      mobile_no: values.mobile_no,
      division: divisions,
      zonal: zones,
      religion: values.religion,
      caste: caste,
      gender: values.gender,
      date_of_birth: dateStr,
      roles: roleList,
      profile_photo: '',
    });

    if (response.data.message) {
      notification['error']({
        description: response.data.message,
      });
    } else {
      notification['success']({
        description: 'User Added Successfully',
      });

      router.push('/admin/admin-section/neeri-users-master');
    }
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Add User</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Add User</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  {/* <Col span={24}>
                    <Form.Item label="Profile Photo">
                      <Form.Item name="profile_photo" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
                        <Upload.Dragger name="files" action="/upload.do">
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">Click or drag file to this area to upload</p>
                          <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Form.Item>
                  </Col> */}
                  <Col xs={24} lg={8}>
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
                  <Col xs={24} lg={8}>
                    <Form.Item name='middle_name' label='Middle Name' labelCol={{ span: 24 }}>
                      <Input placeholder='Enter Middle Name' maxLength={100} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
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
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='zone'
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
                        mode='multiple'
                        allowClear
                        getPopupContainer={(trigger) => trigger.parentNode}
                        onChange={handleZoneChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {zoneOption.map((zone) => (
                          <Select.Option value={zone.zonal_lab_id} name={zone.zonal_lab_name}>
                            {zone.zonal_lab_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='division'
                      label='Division'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Division',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Division'
                        mode='multiple'
                        getPopupContainer={(trigger) => trigger.parentNode}
                        allowClear
                        onChange={handleDivChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {divOption.map((div) => (
                          <Select.Option value={div.division_id} name={div.division_name}>
                            {div.division_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
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
                          message: 'Enter valid email',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Email' maxLength={100} />
                    </Form.Item>
                  </Col>
                  {/* <Col xs={24} lg={8}>
                    <Form.Item
                      name='password'
                      label='Password'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Password',
                        },
                      ]}
                    >
                      <Input type='password' />
                    </Form.Item>
                  </Col> */}
                  <Col xs={24} lg={8}>
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
                  <Col xs={24} lg={8}>
                    <Form.Item name='date_of_birth' label='Date of Birth' labelCol={{ span: 24 }} {...config}>
                      <DatePicker
                        getPopupContainer={(trigger) => trigger.parentNode}
                        format='YYYY-MM-DD'
                        placeholder='Select Date of Birth'
                        value={date}
                        onChange={dateChangeHandler}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='religion'
                      label='Religion'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Please select religion',
                        },
                      ]}
                    >
                      <Select placeholder='Select Religion' getPopupContainer={(trigger) => trigger.parentNode}>
                        {religion.map((item) => (
                          <Option value={item.religion_id}>{item.religion_name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='caste'
                      label='Caste'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Caste',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Caste'
                        onChange={handleCasteChange}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {CasteAll.map((caste) => (
                          <option value={caste.value} name={caste.value}>
                            {caste.label}
                          </option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Form.Item
                      name='gender'
                      label='Gender'
                      labelCol={{ span: 24 }}
                      rules={[{ required: true, message: 'Please select gender' }]}
                    >
                      <Radio.Group name='gender' value='gender'>
                        <Radio value='male'>Male</Radio>
                        <Radio value='female'>Female</Radio>
                        <Radio value='others'>Others</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='user_role'
                      label='User Roles'
                      labelCol={{ span: 24 }}
                      rules={[{ required: true, message: 'Please select user role' }]}
                    >
                      <Checkbox.Group options={checkList} onChange={handleChange} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/neeri-users-master'>
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

export default AddUser;
