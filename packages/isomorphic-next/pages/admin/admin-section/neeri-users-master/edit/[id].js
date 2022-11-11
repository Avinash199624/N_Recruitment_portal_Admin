import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Row, Col, Form, Input, Button, Space, Checkbox, Radio, DatePicker, message, notification, Select } from 'antd';
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import { yupResolver } from '@hookform/resolvers/yup';
import DashboardLayout from '../../../../../containers/DashboardLayout/DashboardLayout';
import { useAuthState } from '../../../../../src/components/auth/hook';
import useUser from '../../../../../src/components/auth/useUser';
import { getDivisions, getZonals } from '../../../../../src/apiCalls';
import { validationSchema } from '../../../../../containers/Admin/NeeriUsers/validations';
import FormStyles from '../../../../../styled/Form.styles';

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
      message: 'Please select time!',
    },
  ],
};

const toPascalCase = (s) => {
  return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
};

const Edit = () => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialState, setInitialState] = useState();
  const [options, setOptions] = useState([]);
  const [date, setDate] = useState();
  const [dateStr, setDateStr] = useState('');
  const [checkList, setCheckList] = useState();
  const [zoneOption, setZoneOption] = useState([]);
  const [divOption, setDivOption] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [optionsAll, setOptionsAll] = useState();
  const [caste, setCaste] = useState();
  const [religionList, setReligionList] = useState([]);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const getSavedIds = (idField, records) => {
    var savedIds = [];
    records.map((data) => {
      savedIds.push(data[idField]);
    });
    return savedIds;
  };

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/user/public/neeri_user_personal_info/${id}/`);
      const religionResponse = await client.get(`/user/public/applicant_religions/`);
      const checkedRoleList = response.data && response.data.roles.map((roles) => roles.role_id);
      setInitialState({
        ...response.data,
        religion: response.data.religion.religion_id,
        user_roles: checkedRoleList,
        division: getSavedIds('division_id', response.data.division),
        zonal: getSavedIds('zonal_lab_id', response.data.zonal),
      });

      const religions = religionResponse.data.map((res) => ({
        religion_id: res.religion_id,
        religion_name: res.religion_name,
      }));
      setReligionList(religions);

      const roleMaster = await client.get(`/user/public/role_master/`);
      const rolesData = roleMaster.data.map((roles) => ({
        label: toPascalCase(roles.role_name),
        value: roles.role_id,
      }));
      setOptionsAll(rolesData.filter((role) => role.label !== 'Applicant' && role.label !== 'Trainee'));
    };

    const getZonalList = async () => {
      const response = await getZonals(client);
      setZoneOption(response);
    };

    const getDivisionList = async () => {
      const response = await getDivisions(client);
      setDivOption(response);
    };

    if (id) {
      load();
      getZonalList();
      getDivisionList();
    }
  }, []);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleChange = (options) => {
    const roleOpt = options.map((opt) => ({ role_id: opt }));
    setCheckList(options);
  };

  const handleDateChange = (date, dateString) => {
    setDate(date);
    setDateStr(dateString);
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

  const onFormSubmit = async (values) => {
    const roles = values.user_roles.map((opt) => ({ role_id: opt }));
    const selected_zones = values.zonal.map((zone) => ({ zonal_lab_id: zone }));
    const selected_divs = values.division.map((div) => ({ division_id: div }));
    const response = await client.put(`/user/public/neeri_user_personal_info/${router.query.id}/`, {
      user_id: router.query.id,
      first_name: values.first_name,
      middle_name: values.middle_name,
      last_name: values.last_name,
      email: values.email,
      mobile_no: values.mobile_no,
      division: selected_divs,
      zonal: selected_zones,
      religion: values.religion,
      caste: values.caste,
      gender: values.gender,
      date_of_birth: dateStr !== '' ? dateStr : initialState.date_of_birth,
      roles: roles,
      profile_photo: '',
    });

    if (response.data.message) {
      notification['error']({
        description: response.data.message,
      });
    } else {
      notification['success']({
        description: 'User Updated Successfully',
      });

      router.push('/admin/admin-section/neeri-users-master');
    }
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update User</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update User</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col span={24}>
                    {/* <Form.Item label="Profile Photo">
                      <Form.Item
                        name="dragger"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        noStyle
                      >
                        <Upload.Dragger name="files" action="/upload.do">
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                          <p className="ant-upload-hint">
                            Support for a single or bulk upload.
                          </p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Form.Item> */}
                  </Col>
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
                      name='zonal'
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

                  <Col xs={24} lg={12}>
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
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='email'
                      label='Email'
                      labelCol={{ span: 24 }}
                      disabled
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
                      <Input disabled={true} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='mobile_no'
                      label='Mobile No'
                      disabled
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
                      <Input placeholder='Enter Mobile Number' type='number' disabled={true} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label='Date of Birth' labelCol={{ span: 24 }} {...config}>
                      <DatePicker
                        value={date}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        defaultValue={moment(initialState.date_of_birth)}
                        onChange={handleDateChange}
                        format='YYYY-MM-DD'
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='religion'
                      label='Religion'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Religion',
                        },
                      ]}
                    >
                      <Select getPopupContainer={(trigger) => trigger.parentNode} placeholder='Select Religion'>
                        {religionList.map((comm) => (
                          <Option value={comm.religion_id} name={comm.religion_name}>
                            {comm.religion_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='caste'
                      label='Caste'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Caste',
                        },
                      ]}
                    >
                      <Select
                        placeholder='Select Caste'
                        defaultValue={initialState.caste}
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
                  <Col xs={24} lg={12}>
                    <Form.Item
                      name='gender'
                      label='Gender'
                      labelCol={{ span: 24 }}
                      rules={[{ required: true, message: 'Please Pick Gender!' }]}
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
                      name='user_roles'
                      label='User Roles'
                      labelCol={{ span: 24 }}
                      rules={[{ required: true, message: 'Please select user role!' }]}
                    >
                      <Checkbox.Group
                        options={optionsAll}
                        // value={checkList}
                        // defaultValue={checkList}
                        onChange={handleChange}
                      />
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

export default Edit;
