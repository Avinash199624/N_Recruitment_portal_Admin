import React, { useState, useEffect } from 'react';
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
  const [comm_type, setComm] = useState({});
  const [commtypeAll, setCommtypeAll] = useState([]);
  const [action_type, setAction] = useState({});
  const [actiontAll, setActionAll] = useState([]);

  const { TextArea } = Input;

  useEffect(() => {
    const { id } = router.query;
    const load = async () => {
      const response = await client.get(`/template/get_template/${id}/`);
      setInitialState({
        ...response.data,
        communication_name: response.data.communication_name,
        subject: response.data.subject,
        body: response.data.body,
        is_active: response.data.is_active,
        is_delete: false,
      });
      const commData = {
        id: response.data.comm_type.id,
        communication_type: response.data.comm_type.communication_type,
      };
      const ActData = {
        id: response.data.action_type.id,
        comm_action_type: response.data.action_type.comm_action_type,
      };
      setComm(commData);
      setAction(ActData);
    };
    const load1 = async () => {
      const commtype = await client.get('/template/template_type_list/');
      const commtypes = commtype.data.map((res) => ({
        id: res.id,
        communication_type: res.communication_type,
      }));
      setCommtypeAll(commtypes);
    };
    const load2 = async () => {
      const actiontype = await client.get('/template/template_action_type_list/');
      const actiontypes = actiontype.data.map((res) => ({
        id: res.id,
        comm_action_type: res.comm_action_type,
      }));
      setActionAll(actiontypes);
    };
    if (id) load();
    load1();
    load2();
  }, []);

  const onFormSubmit = async (values) => {
    await client.put(`/template/update_template/${router.query.id}/`, {
      ...values,
      communication_id: values.communication_id,
      communication_name: values.communication_name,
      subject: values.subject,
      body: values.body,
      is_active: values.is_active,
      is_deleted: false,
      comm_type: comm_type,
      action_type: action_type,
    });
    notification['success']({
      description: 'Template updated successfully',
    });
    router.push('/admin/admin-section/template-master');
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialState) return null;

  const onChangeActive = (e) => {
    console.log('active', e.target.value);
  };

  const handleCommChange = (value, obj) => {
    const Obj = { id: value, communication_type: obj.name };
    setComm(Obj);
  };

  const handleActChange = (value, obj) => {
    const Obj = { id: value, comm_action_type: obj.name };
    setAction(Obj);
  };

  return (
    <>
      <Head>
        <title>Update Content Template</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Content Template</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={12}>
                    <Form.Item label='Communication Type' name='id' labelCol={{ span: 24 }}>
                      <Select
                        defaultValue={initialState.comm_type.communication_type}
                        name={initialState.comm_type.communication_type}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        placeholder='Select Communication Type'
                        onChange={handleCommChange}
                        disabled={true}
                      >
                        {commtypeAll.map((comm) => (
                          <Option value={comm.id} name={comm.communication_type}>
                            {comm.communication_type}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label='Action Type' name='id' labelCol={{ span: 24 }}>
                      <Select
                        defaultValue={initialState.action_type.comm_action_type}
                        name={initialState.action_type.comm_action_type}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        placeholder='Select Action Type'
                        onChange={handleActChange}
                        disabled={true}
                      >
                        {actiontAll.map((act) => (
                          <Option value={act.id} name={act.comm_action_type}>
                            {act.comm_action_type}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='communication_name'
                      label='Template Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Template Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Template Name' maxLength='100' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='subject'
                      label='Subject'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Subject',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Subject' maxLength='100' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='body'
                      label='Body'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Body',
                        },
                      ]}
                    >
                      <TextArea placeholder='Enter Body' allowClear rows={4} maxLength='300' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='is_active'
                      label='Active Type'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Select Active Type',
                        },
                      ]}
                    >
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
                      <Link href='/admin/admin-section/template-master'>
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
