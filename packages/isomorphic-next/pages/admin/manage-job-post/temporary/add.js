import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { palette } from 'styled-theme';
import { useRouter } from 'next/router';
import moment from 'moment';
import { EditorState } from 'draft-js';
import { QuotaData, jobPostingStatus } from '../../../../src/constants';
import { Row, Col, Form, Input, Button, DatePicker, Select, Upload, notification, Typography, InputNumber } from 'antd';
// Icons
import { InboxOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
// Layouts
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
import Editor from '@iso/components/uielements/editor';
// Hooks / API Calls
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';
import {
  createJobPost,
  getDivisions,
  getZonals,
  getQualification,
  getTemporaryPositions,
  getQualificationJobHistory,
  getInformationRequired,
  getDocuments,
} from '../../../../src/apiCalls';
// Styles
import FormStyles from '../../../../styled/Form.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), { ssr: false });

const groupDocuments = (values, key) => {
  return values.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
  }, {});
};
const JobPostTemporaryAdd = () => {
  const router = useRouter();
  const { RangePicker } = DatePicker;

  const { Text } = Typography;
  const { TextArea } = Input;
  const { Option, OptGroup } = Select;
  const { Dragger } = Upload;

  const { client } = useAuthState();
  const { user } = useUser({});

  const [token, setToken] = useState('');
  const [zonals, setZonals] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [positions, setPositions] = useState([]);
  const [qualificationJobHistory, setQualificationJobHistory] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [informationRequired, setInformationRequired] = useState([]);
  const [documentsUploaded, setDocumentsUploaded] = useState([]);
  const [adddocumentsUploaded, setAddDocumentsUploaded] = useState([]);
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);
  const [preDescState, setPreDescState] = useState(() => EditorState.createEmpty());
  const [postDescState, setPostDescState] = useState(() => EditorState.createEmpty());
  const [publicationDate, setPublicationDate] = useState([moment(), moment()]);
  const [dateStr, setDateString] = useState();
  const [advertisementFile, setAdvertisementFile] = useState([]);
  const [additionalFile, setAdditionalFile] = useState([]);

  const [formStep1] = Form.useForm();
  const [formStep2] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const form2InitialValues = {
    manpower_positions: [{}],
  };

  useEffect(() => {
    const getZonalList = async () => {
      const response = await getZonals(client);

      setZonals(response);
    };

    const getDivisionList = async () => {
      const response = await getDivisions(client);

      setDivisions(response);
    };

    const getQualificationList = async () => {
      const response = await getQualification(client);

      setQualifications(response);
    };

    const getTemporaryPositionsList = async () => {
      const response = await getTemporaryPositions(client);

      setPositions(response);
    };

    const getQualificationJobHistoryList = async () => {
      const response = await getQualificationJobHistory(client);

      setQualificationJobHistory(response);
    };

    const getInformationRequiredList = async () => {
      const response = await getInformationRequired(client);

      setInformationRequired(response);
    };

    const getDocumentsList = async () => {
      const response = await getDocuments(client);

      setRequiredDocuments(groupDocuments(response, 'doc_type'));
    };

    if (user && user.isLoggedIn) {
      setToken(localStorage.getItem('token'));
      getZonalList();
      getDivisionList();
      getQualificationList();
      getTemporaryPositionsList();
      getQualificationJobHistoryList();
      getDocumentsList();
      getInformationRequiredList();
    }
  }, [user]);

  const onBack = () => {
    setStep2(false);
    setStep1(true);
  };

  const onSubmitStep1 = (values) => {
    setStep1(false);
    setStep2(true);
  };

  const onSubmitStep2 = async (values) => {
    console.log(values);
    const formStep1Values = formStep1.getFieldsValue(true);
    const formRequest = {
      ...formStep1Values,
      publication_date: `${formStep1Values['publication_date'][0].format('YYYY-MM-DD')} 00:00:00`,
      end_date: `${formStep1Values['publication_date'][1].format('YYYY-MM-DD')} 23:59:59`,
      job_type: 'Contract_Basis',
      documents_required: [],
      documents_uploaded: documentsUploaded,
      additional_documents_uploaded: additionalFile.map((item) => item.uid),
      pre_ad_description: formStep1Values.pre_ad_description ? JSON.stringify(formStep1Values.pre_ad_description) : '',
      post_ad_description: formStep1Values.post_ad_description
        ? JSON.stringify(formStep1Values.post_ad_description)
        : '',
      status: 'scheduled',
      ...values,
    };
    setSubmitting(true);
    try {
      const formResponse = await createJobPost(client, formRequest);

      if (formResponse.job_posting_id) {
        notification['success']({
          description: `Job post created successfully`,
        });
        router.push('/admin/manage-job-post/temporary/list/');
      } else {
        if (formResponse.errors['notification_id']) {
          notification['error']({
            description: `Job posting with this notification id already exists`,
          });
          setSubmitting(false);
        }
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  const onSuccessDocumentsUploaded = (data) => {
    const newDocsUploaded = documentsUploaded;

    if (data.message === 'File uploaded successfully') {
      notification['success']({
        description: `${data.doc_name} file uploaded successfully`,
      });
      newDocsUploaded.push(data.doc_id);
    }

    setDocumentsUploaded(newDocsUploaded);
    setAdvertisementFile([
      {
        uid: data.doc_id,
        name: data.doc_name,
        status: 'done',
        url: data.doc_file_path,
      },
    ]);
  };

  const onSuccessAdditionalDocumentsUpload = (data) => {
    const newDocsUploaded = adddocumentsUploaded;
    const additionalDocs = additionalFile;

    if (data.message === 'File uploaded successfully') {
      notification['success']({
        description: `${data.doc_name} file uploaded successfully`,
      });
      newDocsUploaded.push(data.doc_id);
      let doc = {
        uid: data.doc_id,
        name: data.doc_name,
        status: 'done',
        url: data.doc_file_path,
      };
      additionalDocs.push(doc);
    }
    setAddDocumentsUploaded(newDocsUploaded);
    setAdditionalFile(additionalDocs);
  };

  const handleAdDocDelete = async () => {
    try {
      let req = {
        document_id: documentsUploaded[0],
        document_type: 'job_posting',
      };
      const response = await client.delete(`/user/delete/document/`, { data: req });
      if (response.status === 200) {
        notification['success']({
          description: `Docuement deleted successfully`,
        });
        setDocumentsUploaded([]);
      }
    } catch (err) {
      notification['error']({
        description: `Unable to delete document`,
      });
    }
  };

  const handleExtraDocDelete = async (file) => {
    const delete_doc = additionalFile.find((doc) => doc.name === file.name);
    try {
      let req = {
        document_id: delete_doc.uid,
        document_type: 'job_posting',
      };
      const response = await client.delete(`/user/delete/document/`, { data: req });
      if (response.status === 200) {
        notification['success']({
          description: `Docuement deleted successfully`,
        });
        const removeIndex = additionalFile.findIndex((item) => item.uid === delete_doc.uid);
        additionalFile.splice(removeIndex, 1);
      }
    } catch (err) {
      notification['error']({
        description: `Unable to delete document`,
      });
    }
  };

  // Handler for pre fill position values
  const handleOnChangePosition = (value, key, name) => {
    const selectedPositionData = positions.filter((position) => position.temp_position_master.position_id === value);

    const fields = formStep2.getFieldsValue();
    const { manpower_positions } = fields;

    const selectedQualifications = selectedPositionData[0].temp_position_master.qualification.map(
      (qualification) => qualification.education_id
    );

    const selectedQualificationJobHistory = selectedPositionData[0].temp_position_master.qualification_job_history.map(
      (jobHistory) => jobHistory.qualification_job_id
    );

    const selectedDocumentsRequired = selectedPositionData[0].temp_position_master.documents_required.map(
      (documents) => documents.doc_id
    );

    const selectedInformationRequired = selectedPositionData[0].temp_position_master.information_required.map(
      (information) => information.info_id
    );

    manpower_positions[key].position = selectedPositionData[0].temp_position_master.position_name;
    manpower_positions[key].max_age = selectedPositionData[0].temp_position_master.max_age;
    manpower_positions[key].min_age = selectedPositionData[0].temp_position_master.min_age;
    manpower_positions[key].extra_note = selectedPositionData[0].temp_position_master.qualification_desc;
    manpower_positions[key].grade = selectedPositionData[0].grade;
    manpower_positions[key].level = selectedPositionData[0].level;
    manpower_positions[key].qualification = selectedQualifications;
    manpower_positions[key].quota = selectedPositionData[0].temp_position_master.quota;
    manpower_positions[key].qualification_job_history = selectedQualificationJobHistory;
    manpower_positions[key].documents_required = selectedDocumentsRequired;
    manpower_positions[key].information_required = selectedInformationRequired;

    formStep2.setFieldsValue({ manpower_positions });
  };

  const dateChangeHandler = (date, dateString) => {
    setPublicationDate(date);
    setDateString(dateString);
  };

  const getFile = (e) => {
    return e && e.fileList;
  };

  return (
    <>
      <Head>
        <title>Create Temporary Jobs</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <FormStyles>
              <PageHeader>Create Temporary Jobs</PageHeader>
              <Row className='action-bar'>
                <Col span={24}>
                  <Row justify='end'>
                    <Button
                      style={{ marginRight: 16, marginBottom: 10 }}
                      onClick={() => {
                        router.push({
                          pathname: '/admin/manage-job-post/temporary/list',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </Row>
                </Col>
              </Row>
              {step1 && (
                <Box>
                  <Form
                    form={formStep1}
                    name='formStep1'
                    onFinish={onSubmitStep1}
                    initialValues={{}}
                    scrollToFirstError
                  >
                    <Row gutter={[16, 0]}>
                      <Col span={24}>
                        <Form.Item
                          name='notification_title'
                          label='Advertisement Title'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please Input Advertisement Title',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={6}>
                        <Form.Item
                          name='publication_date'
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
                            value={publicationDate}
                            onChange={dateChangeHandler}
                            disabledDate={(current) => {
                              return moment().add(-1, 'days') >= current;
                            }}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            separator='-'
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={6}>
                        <Form.Item
                          name='zonal_lab_id'
                          label='Select Zone'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please Select Zone',
                            },
                          ]}
                        >
                          <Select
                            placeholder='Please Select Zone'
                            showSearch
                            getPopupContainer={(trigger) => trigger.parentNode}
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {zonals.map((zonal) => (
                              <Option key={zonal.zonal_lab_id} value={zonal.zonal_lab_id}>
                                {zonal.zonal_lab_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='division_id'
                          label='Select Division'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please Select Division',
                            },
                          ]}
                        >
                          <Select
                            placeholder='Please Select Division'
                            showSearch
                            getPopupContainer={(trigger) => trigger.parentNode}
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {divisions.map((division) => (
                              <Option key={division.division_id} value={division.division_id}>
                                {division.division_name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      {/* <Col xs={24} lg={12}>
                        <Form.Item
                          name='status'
                          label='Select Status'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please Select Status'
                            }
                          ]}
                        >
                          <Select
                            placeholder='Please Select Status'
                            showSearch
                            getPopupContainer={(trigger) => trigger.parentNode}
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            {jobPostingStatus.map((status) => (
                              <Option key={status.value} value={status.value}>
                                {status.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col> */}
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='notification_id'
                          label='Notification ID'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Please Input Notification ID',
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item name='ad_approval_id' label='Advertisement Approval ID' labelCol={{ span: 24 }}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='documents_uploaded'
                          label='Advertisement Document'
                          labelCol={{ span: 24 }}
                          rules={[
                            {
                              required: true,
                              message: 'Advertisement document required',
                            },
                          ]}
                          getValueFromEvent={getFile}
                        >
                          <Dragger
                            accept='.pdf'
                            maxCount={1}
                            multiple={false}
                            action={(file) =>
                              `${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=job_docs&name=${file.name}`
                            }
                            headers={{
                              authorization: `Token ${token}`,
                            }}
                            beforeUpload={(file) => {
                              if (file && file.size > 2000000) {
                                notification['error']({
                                  description: `file size should be less than 2MB`,
                                });
                                return Upload.LIST_IGNORE;
                              }
                            }}
                            onSuccess={onSuccessDocumentsUploaded}
                            onRemove={handleAdDocDelete}
                            defaultFileList={[...advertisementFile]}
                          >
                            <p className='ant-upload-drag-icon'>
                              <InboxOutlined />
                            </p>
                            <p className='ant-upload-text'>Click or drag PDF file to this area to upload</p>
                            <Text type='danger'>
                              <small>*Upload file format allowed is PDF and maximum size is 2MB </small>
                            </Text>
                          </Dragger>
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='additional_documents_uploaded'
                          label='Additional Documents'
                          labelCol={{ span: 24 }}
                          getValueFromEvent={(e) => {
                            return e && e.fileList;
                          }}
                        >
                          <Dragger
                            accept='.pdf'
                            action={(file) =>
                              `${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=job_docs&name=${file.name}`
                            }
                            headers={{
                              authorization: `Token ${token}`,
                            }}
                            beforeUpload={(file) => {
                              if (file && file.size > 2000000) {
                                notification['error']({
                                  description: `file size should be less than 2MB`,
                                });
                                return Upload.LIST_IGNORE;
                              }
                            }}
                            onSuccess={onSuccessAdditionalDocumentsUpload}
                            onRemove={(file) => handleExtraDocDelete(file)}
                            defaultFileList={[...additionalFile]}
                          >
                            <p className='ant-upload-drag-icon'>
                              <InboxOutlined />
                            </p>
                            <p className='ant-upload-text'>Click or drag PDF file to this area to upload</p>
                            <Text type='danger'>
                              <small>*Upload file format allowed is PDF and maximum size is 2MB </small>
                            </Text>
                          </Dragger>
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='pre_ad_description'
                          label='Pre-Advertisement Description'
                          labelCol={{ span: 24 }}
                        >
                          <Editor editorState={preDescState} onEditorStateChange={setPreDescState} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          name='post_ad_description'
                          label='Post-Advertisement Description'
                          labelCol={{ span: 24 }}
                        >
                          <Editor editorState={postDescState} onEditorStateChange={setPostDescState} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row justify='end'>
                      <Form.Item>
                        <Button type='primary' htmlType='submit'>
                          Save & Go to Manage Job Positions
                        </Button>
                      </Form.Item>
                    </Row>
                  </Form>
                </Box>
              )}
              {step2 && (
                <Form
                  form={formStep2}
                  name='formStep2'
                  onFinish={onSubmitStep2}
                  initialValues={form2InitialValues}
                  scrollToFirstError
                >
                  <Form.List name='manpower_positions'>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, fieldKey, ...restField }) => {
                          return (
                            <Box key={key}>
                              <Row gutter={[16, 0]}>
                                <Col xs={24} lg={10}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'position_id']}
                                    fieldKey={[fieldKey, 'position_id']}
                                    label='Select Position Name'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please Select Position Name',
                                      },
                                    ]}
                                  >
                                    <Select
                                      placeholder='Select Position Name'
                                      onChange={(value) => handleOnChangePosition(value, fieldKey, name)}
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                    >
                                      {positions &&
                                        positions.map((position) => (
                                          <Option
                                            value={position.temp_position_master.position_id}
                                            key={position.temp_position_master.position_id}
                                          >
                                            {position.temp_position_master.position_name}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col xs={24} lg={10}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'position']}
                                    fieldKey={[fieldKey, 'position']}
                                    label='Position Display Name'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please Input Position Display Name',
                                      },
                                    ]}
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} lg={4}>
                                  <Form.Item
                                    label='Quota'
                                    labelCol={{ span: 24 }}
                                    name={[name, 'quota']}
                                    fieldKey={[fieldKey, 'quota']}
                                  >
                                    <Select
                                      placeholder='Select Quota'
                                      showSearch
                                      optionFilterProp='children'
                                      defaultValue='gen'
                                      // onChange={handleQuotaChange}
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
                                <Col xs={12} lg={6}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'min_age']}
                                    fieldKey={[fieldKey, 'min_age']}
                                    label='Minimum Age'
                                    labelCol={{ span: 24 }}
                                  >
                                    <InputNumber />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} lg={6}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'max_age']}
                                    fieldKey={[fieldKey, 'max_age']}
                                    label='Maximum Age'
                                    labelCol={{ span: 24 }}
                                  >
                                    <InputNumber />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} lg={6}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'grade']}
                                    fieldKey={[fieldKey, 'grade']}
                                    style={{ display: 'none' }}
                                  >
                                    <Input type='hidden' />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'level']}
                                    fieldKey={[fieldKey, 'level']}
                                    style={{ display: 'none' }}
                                  >
                                    <Input type='hidden' />
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'monthly_emolements']}
                                    fieldKey={[fieldKey, 'monthly_emolements']}
                                    label='Salary Amount'
                                    labelCol={{ span: 24 }}
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col xs={12} lg={6}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'number_of_vacancies']}
                                    fieldKey={[fieldKey, 'number_of_vacancies']}
                                    label='Number of Vacancies'
                                    labelCol={{ span: 24 }}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please Input Number of Vacancies',
                                      },
                                    ]}
                                  >
                                    <InputNumber min={1} />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'documents_required']}
                                    fieldKey={[fieldKey, 'documents_required']}
                                    label='Required Documents'
                                    labelCol={{ span: 24 }}
                                  >
                                    <Select
                                      placeholder='Select'
                                      mode='multiple'
                                      allowClear
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                    >
                                      {Object.keys(requiredDocuments).map((docs, index) => (
                                        <>
                                          <OptGroup label={docs.toUpperCase()}>
                                            {requiredDocuments[docs].map((doc) => (
                                              <Option value={doc.doc_id}>{doc.doc_name}</Option>
                                            ))}
                                          </OptGroup>
                                        </>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'information_required']}
                                    fieldKey={[fieldKey, 'information_required']}
                                    label='Required Information'
                                    labelCol={{ span: 24 }}
                                  >
                                    <Select
                                      placeholder='Select'
                                      mode='multiple'
                                      allowClear
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                    >
                                      {informationRequired &&
                                        informationRequired.map((informationItem) => (
                                          <Option value={informationItem.info_id} key={informationItem.info_id}>
                                            {informationItem.info_name}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'extra_note']}
                                    fieldKey={[fieldKey, 'extra_note']}
                                    label='Qualification Description'
                                    labelCol={{ span: 24 }}
                                  >
                                    <TextArea placeholder='Enter description' allowClear rows={4} />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'qualification']}
                                    fieldKey={[fieldKey, 'qualification']}
                                    label='Select Qualifications Degrees'
                                    labelCol={{ span: 24 }}
                                  >
                                    <Select
                                      placeholder='Qualifications: Degrees'
                                      mode='multiple'
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                    >
                                      {qualifications &&
                                        qualifications.map((qualification) => (
                                          <Option value={qualification.education_id} key={qualification.education_id}>
                                            {qualification.education_degree}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'qualification_job_history']}
                                    fieldKey={[fieldKey, 'qualification_job_history']}
                                    label='Select Qualifications Job History'
                                    labelCol={{ span: 24 }}
                                  >
                                    <Select
                                      placeholder='Qualifications: Job History'
                                      mode='multiple'
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                    >
                                      {qualificationJobHistory &&
                                        qualificationJobHistory.map((jobHistory) => (
                                          <Option
                                            value={jobHistory.qualification_job_id}
                                            key={jobHistory.qualification_job_id}
                                          >
                                            {jobHistory.qualification}
                                          </Option>
                                        ))}
                                    </Select>
                                  </Form.Item>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'allowance']}
                                    fieldKey={[fieldKey, 'allowance']}
                                    initialValue='hra'
                                    style={{ display: 'none' }}
                                  >
                                    <Input
                                      type='hidden'
                                      {...restField}
                                      name={[name, 'allowance']}
                                      fieldKey={[fieldKey, 'allowance']}
                                      initialValue='hra'
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row align='middle' justify='end'>
                                <MinusCircleOutlined
                                  onClick={() => remove(name)}
                                  style={{
                                    marginRight: 8,
                                    color: palette('error', 0),
                                  }}
                                />
                                <Text type='danger' style={{ color: palette('error', 0) }}>
                                  Remove
                                </Text>
                              </Row>
                            </Box>
                          );
                        })}
                        <Form.Item>
                          <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Position
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                  {/* <Box>
                    <Table
                      dataSource={dataSource}
                      columns={columns}
                      pagination={false}
                    />
                    <pre>
                      {JSON.stringify(formStep2.getFieldsValue(true), null, 2)}
                    </pre>
                  </Box> */}
                  <Row justify='end'>
                    <Form.Item>
                      <Button htmlType='button' onClick={onBack} style={{ marginRight: 15 }}>
                        Previous
                      </Button>
                      <Button type='primary' htmlType='submit' disabled={submitting} loading={submitting}>
                        Save
                      </Button>
                    </Form.Item>
                  </Row>
                </Form>
              )}
            </FormStyles>
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default JobPostTemporaryAdd;
