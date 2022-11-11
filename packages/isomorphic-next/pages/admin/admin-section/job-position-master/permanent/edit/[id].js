import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Row, Col, Form, Input, Button, Space, Select, notification, InputNumber } from 'antd';
// Layouts
import DashboardLayout from '../../../../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
// Styles
import FormStyles from '../../../../../../styled/Form.styles';
//Providers
import { useAuthState } from '../../../../../../src/components/auth/hook';
import useUser from '../../../../../../src/components/auth/useUser';

const QuotaData = [
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'obc', label: 'OBC' },
  { value: 'gen', label: 'GEN' },
  { value: 'pwd', label: 'PWD' },
];

const groupDocuments = (values, key) => {
  return values.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
  }, {});
};

const Edit = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [initialState, setInitialState] = useState();
  const [docOption, setDocOption] = useState([]);
  const [document, setDocument] = useState({});
  const [infoOption, setinfoOption] = useState([]);
  const [information, setInformation] = useState({});
  const [qualificationData, setQualification] = useState({});
  const [qualiOption, setQualiOption] = useState([]);
  const [qualificationJob, setQualificationjob] = useState({});
  const [qualijobOption, setQualiJobOption] = useState([]);
  const [quota, setQuota] = useState(false);
  const { TextArea } = Input;
  const { Option, OptGroup } = Select;

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
      const response = await client.get(`/job_posting/permanent_positions/${id}/`);
      const docData = await client.get('/document/docs/');
      const infoData = await client.get('/document/info/');
      const qualiData = await client.get('/user/public/education_degree_list/');
      const qualiJobData = await client.get('/job_posting/qualification_job_history/');
      setInitialState({
        ...response.data,
        position_name: response.data.perm_position_master.position_name,
        position_display_name: response.data.perm_position_master.position_display_name,
        min_age: response.data.perm_position_master.min_age,
        max_age: response.data.perm_position_master.max_age,
        qualification_desc: response.data.perm_position_master.qualification_desc,
        documents_required: getSavedIds('doc_id', response.data.perm_position_master.documents_required),
        information_required: getSavedIds('info_id', response.data.perm_position_master.information_required),
        qualification: getSavedIds('education_id', response.data.perm_position_master.qualification),
        qualification_job_history: getSavedIds(
          'qualification_job_id',
          response.data.perm_position_master.qualification_job_history
        ),
        grade: response.data.grade,
        level: response.data.level,
      });

      const docsData = response.data.perm_position_master.documents_required.map((item) => ({
        doc_id: item.doc_id,
        doc_name: item.doc_name,
        doc_type: item.doc_type,
      }));
      setDocument(docsData);

      const infosData = response.data.perm_position_master.information_required.map((item) => ({
        info_id: item.info_id,
        info_name: item.info_name,
        info_type: item.info_type,
      }));
      setInformation(infosData);

      const qualiInfo = response.data.perm_position_master.qualification.map((item) => ({
        education_id: item.education_id,
        education_degree: item.education_degree,
      }));
      setQualification(qualiInfo);

      const jobData = response.data.perm_position_master.qualification_job_history.map((item) => ({
        qualification_job_id: item.qualification_job_id,
        qualification: item.qualification,
        short_code: item.short_code,
      }));
      setQualificationjob(jobData);

      const document = docData.data.map((div) => ({
        doc_id: div.doc_id,
        doc_name: div.doc_name,
        doc_type: div.doc_type,
      }));
      const information = infoData.data.map((info) => ({
        info_id: info.info_id,
        info_name: info.info_name,
        info_type: info.info_type,
      }));
      const qualificationData = qualiData.data.map((res) => ({
        education_id: res.education_id,
        education_degree: res.education_degree,
      }));
      const qualificationJob = qualiJobData.data.map((res) => ({
        qualification_job_id: res.qualification_job_id,
        qualification: res.qualification,
        short_code: [res.short_code],
      }));
      // setDocOption(document);
      setDocOption(groupDocuments(docData.data, 'doc_type'));
      setinfoOption(information);
      setQualiOption(qualificationData);
      setQualiJobOption(qualificationJob);
    };
    if (id) load();
  }, []);

  const handleDocChange = (value, obj) => {
    const doc = obj.map((item) => ({
      doc_id: item.value,
      doc_name: item.children,
      doc_type: item.name,
    }));
    setDocument(doc);
  };

  const handleInfoChange = (value, obj) => {
    const info = obj.map((item) => ({
      info_id: item.value,
      info_name: item.children,
      info_type: item.name,
    }));
    setInformation(info);
  };

  const handleQuotaChange = (value, obj) => {
    setQuota(value);
  };

  const handleQualiChange = (value, obj) => {
    const data = obj.map((item) => ({
      education_id: item.value,
      education_degree: item.children,
    }));
    setQualification(data);
  };

  const handleQualiJobChange = (value, obj) => {
    const job = obj.map((item) => ({
      qualification_job_id: item.value,
      qualification: item.children,
      short_code: item.name,
    }));
    setQualificationjob(job);
  };

  const onFormSubmit = async (values) => {
    await client.put(`/job_posting/permanent_positions/${router.query.id}/`, {
      perm_position_id: initialState.perm_position_id,
      perm_position_master: {
        position_id: initialState.perm_position_master.position_id,
        position_name: values.position_name,
        position_display_name: values.position_display_name,
        min_age: values.min_age !== null ? values.min_age : 0,
        max_age: values.max_age !== null ? values.max_age : 0,
        qualification_desc: values.qualification_desc,
        documents_required: document,
        information_required: information,
        qualification: qualificationData,
        qualification_job_history: qualificationJob,
        quota: quota,
      },
      grade: values.grade,
      level: values.level,
    });
    notification['success']({
      description: 'Position updated successfully',
    });
    router.push('/admin/admin-section/job-position-master/permanent/');
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }
  if (!initialState) return null;

  return (
    <>
      <Head>
        <title>Update Permanent Position</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <FormStyles>
            <PageHeader>Update Permanent Position</PageHeader>
            <Box>
              <Form name='formStep1' onFinish={onFormSubmit} initialValues={initialState} scrollToFirstError>
                <Row gutter={[16, 0]}>
                  <Col xs={24} lg={10}>
                    <Form.Item
                      name='position_name'
                      label='Position Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Position Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Position Name' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={10}>
                    <Form.Item
                      name='position_display_name'
                      label='Position Display Name'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Position Display Name',
                        },
                      ]}
                    >
                      <Input placeholder='Enter Position Display Name' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={4}>
                    <Form.Item label='Quota' labelCol={{ span: 24 }} name='quota'>
                      <Select
                        placeholder='Select Quota'
                        showSearch
                        optionFilterProp='children'
                        defaultValue={initialState.perm_position_master.quota}
                        onChange={handleQuotaChange}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {QuotaData.map((docs) => (
                          <Option value={docs.value} name={docs.value}>
                            {docs.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={6}>
                    <Form.Item name='documents_required' label='Required Documents' labelCol={{ span: 24 }}>
                      <Select
                        placeholder='Select Required Documents'
                        allowClear
                        getPopupContainer={(trigger) => trigger.parentNode}
                        onChange={handleDocChange}
                        mode='multiple'
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {Object.keys(docOption).map((docs, index) => (
                          <>
                            <OptGroup label={docs.toUpperCase()}>
                              {docOption[docs].map((doc) => (
                                <Option value={doc.doc_id} name={doc.doc_type}>
                                  {doc.doc_name}
                                </Option>
                              ))}
                            </OptGroup>
                          </>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={6}>
                    <Form.Item name='information_required' label='Required Information' labelCol={{ span: 24 }}>
                      <Select
                        placeholder='Select Required Information'
                        mode='multiple'
                        allowClear
                        getPopupContainer={(trigger) => trigger.parentNode}
                        onChange={handleInfoChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {infoOption.map((info) => (
                          <Option value={info.info_id} name={info.info_type}>
                            {info.info_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={3}>
                    <Form.Item name='grade' label='Select Grade' labelCol={{ span: 24 }}>
                      <Select placeholder='Grade' getPopupContainer={(trigger) => trigger.parentNode}>
                        <Option value='I'>I</Option>
                        <Option value='II'>II</Option>
                        <Option value='III'>III</Option>
                        <Option value='IV'>IV</Option>
                        <Option value='V'>V</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={3}>
                    <Form.Item name='level' label='Select Level' labelCol={{ span: 24 }}>
                      <Select placeholder='Level' getPopupContainer={(trigger) => trigger.parentNode}>
                        <Option value='1'>1</Option>
                        <Option value='2'>2</Option>
                        <Option value='3'>3</Option>
                        <Option value='4'>4</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={3}>
                    <Form.Item
                      name='min_age'
                      label='Minimum Age'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                          max: 99,
                        },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder='Enter Min Age' type='number' maxLength='2' />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={3}>
                    <Form.Item
                      name='max_age'
                      label='Maximum Age'
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                          max: 99,
                        },
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} placeholder='Enter Max Age' type='number' maxLength='2' />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name='qualification_desc' label='Qualification Description' labelCol={{ span: 24 }}>
                      <TextArea placeholder='Enter Qualification Description' maxLength='300' allowClear rows={4} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name='qualification' label='Qualifications Degrees' labelCol={{ span: 24 }}>
                      <Select
                        placeholder='Select Qualification Degrees'
                        allowClear
                        getPopupContainer={(trigger) => trigger.parentNode}
                        mode='multiple'
                        onChange={handleQualiChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {qualiOption.map((quali) => (
                          <Option value={quali.education_id} name={quali.education_id}>
                            {quali.education_degree}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name='qualification_job_history'
                      label='Qualifications Job History'
                      labelCol={{ span: 24 }}
                    >
                      <Select
                        placeholder='Select Qualification Job History'
                        mode='multiple'
                        getPopupContainer={(trigger) => trigger.parentNode}
                        allowClear
                        onChange={handleQualiJobChange}
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {qualijobOption.map((qualiJob) => (
                          <Option value={qualiJob.qualification_job_id} name={qualiJob.short_code}>
                            {qualiJob.qualification}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item>
                    <Space size='middle'>
                      <Link href='/admin/admin-section/job-position-master/permanent'>
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
