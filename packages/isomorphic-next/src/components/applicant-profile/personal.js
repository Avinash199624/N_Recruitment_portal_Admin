import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Router from 'next/router';
import moment from 'moment';
import Webcam from '@uppy/webcam';
import Uppy from '@uppy/core';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  notification,
  Radio,
  Checkbox,
  Space,
  Popconfirm,
  Image,
  Spin,
} from 'antd';
import Box from '@iso/components/utility/box';
import { LoadingOutlined } from '@ant-design/icons';
import DashboardModal from '@uppy/react/lib/DashboardModal';
import ImageEditor from '@uppy/image-editor';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';

const antIcon = <LoadingOutlined style={{ fontSize: 20, color: '#FFF', marginRight: 10 }} spin />;

const Personal = ({ onNext }) => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialData, setInitialData] = useState();
  const [personalForm] = Form.useForm();
  const [showConfirm, setShowConfirm] = useState(false);
  const [relaxation, setRelaxation] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [religion, setReligion] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { Option } = Select;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/personal_info/${user.user_id}/`);
      const relaxationResponse = await client.get(`user/relaxation/`);
      const religionResponse = await client.get(`/user/public/applicant_religions/`);
      setRelaxation(relaxationResponse.data);
      setReligion(religionResponse.data);
      setInitialData({
        ...response.data,
        relaxation_rule_id: response.data.relaxation_rule?.relaxation_rule_id,
      });
      setProfilePic({ ...profilePic, doc_file_path: response.data.profile_photo });
      if (
        response.data.profile_photo === null ||
        response.data.profile_photo === 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
      ) {
        setDeleting(true);
      } else {
        setDeleting(false);
      }
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onSubmitForm = async (values) => {
    setSubmitting(false);

    try {
      if (initialData.isEmpty === 'true') {
        await client.post(`/user/public/personal_info_create/${user.user_id}/`, {
          user_id: user.user_id,
          ...values,
          middle_name: values.middle_name === null ? '' : values.middle_name,
          date_of_birth: moment(values.date_of_birth).format('YYYY-MM-DD'),
          passport_expiry: values.passport_expiry !== null ? moment(values.passport_expiry).format('YYYY-MM-DD') : null,
          relaxation_rule: relaxation.find((rel) => rel.relaxation_rule_id === values.relaxation_rule_id),
          status: 'not_decided',
          is_fresher: false,
          profile_photo: profilePic?.doc_file_path,
        });
        notification['success']({
          description: `Personal information added successfully`,
        });
      } else {
        await client.put(`/user/public/personal_info_update/${user.user_id}/`, {
          user_id: user.user_id,
          ...values,
          middle_name: values.middle_name === null ? '' : values.middle_name,
          date_of_birth: moment(values.date_of_birth).format('YYYY-MM-DD'),
          passport_expiry: values.passport_expiry !== null ? moment(values.passport_expiry).format('YYYY-MM-DD') : null,
          date_of_birth_in_words: 'inword',
          status: 'not_decided',
          relaxation_rule: relaxation.find((rel) => rel.relaxation_rule_id === values.relaxation_rule_id),
          profile_photo: profilePic?.doc_file_path,
        });

        const pserProfile = JSON.parse(window.localStorage.getItem('user'));
        window.localStorage.setItem(
          'user',
          JSON.stringify({ ...pserProfile, user_profile: { profile_photo: profilePic?.doc_file_path } })
        );

        notification['success']({
          description: `Personal information updated successfully`,
        });
      }
      setSubmitting(false);
      setShowConfirm(false);

      if (router.query && router.query?.redirect) {
        Router.push(
          `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
        );
      } else {
        onNext();
      }
    } catch (error) {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = (e) => {
    uppy.close();
    setModalOpen(false);
  };

  const onBackToPreview = () => {
    Router.push(
      `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
    );
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialData) return null;

  // Uppy Start
  const uppy = Uppy({
    metaFields: [
      { id: 'name', name: 'Name', placeholder: 'file name' },
      { id: 'license', name: 'License', placeholder: 'specify license' },
      { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' },
    ],
    autoProceed: true,
    restrictions: {
      maxFileSize: null,
      minFileSize: null,
      maxTotalFileSize: null,
      maxNumberOfFiles: 1,
      minNumberOfFiles: 1,
      allowedFileTypes: ['.jpg', '.jpeg', '.png'],
    },
  })
    .use(Webcam, {
      onBeforeSnapshot: () => Promise.resolve(),
      countdown: false,
      modes: ['picture'],
      mirror: true,
      facingMode: 'user',
      showRecordingLength: false,
    })
    .use(ImageEditor, {
      id: 'ImageEditor',
      quality: 0.8,
      cropperOptions: {
        viewMode: 1,
        background: false,
        autoCropArea: 1,
        responsive: true,
      },
      actions: {
        revert: true,
        rotate: true,
        granularRotate: true,
        flip: true,
        zoomIn: true,
        zoomOut: true,
        cropSquare: true,
        cropWidescreen: true,
        cropWidescreenVertical: true,
      },
    })
    .on('file-added', (result) => {
      // Do something
    })
    .on('complete', (result) => {
      // Do something
    })
    .on('upload-success', (file, response) => {
      // Do something
    })
    .on('upload', (data) => {
      // Do something
    });
  uppy.on('file-editor:complete', async (updatedFile) => {
    var file = new File([updatedFile.data], updatedFile.name);
    const postData = new FormData();

    postData.append('file', file);

    const response = await client.post(
      `/user/public/file_upload/?doc_type=paper_attachment&user_id=${user.user_id}`,
      postData
    );

    setProfilePic(response.data);

    setModalOpen(false);
  });

  uppy.run();

  return (
    <FormStyles>
      <Form
        form={personalForm}
        name='personalForm'
        onFinish={onSubmitForm}
        initialValues={
          !initialData.isEmpty
            ? {
                ...initialData,
                date_of_birth:
                  initialData.date_of_birth && initialData.date_of_birth !== null && initialData.date_of_birth !== ''
                    ? moment(initialData.date_of_birth)
                    : '',
                passport_expiry:
                  initialData.passport_expiry &&
                  initialData.passport_expiry !== null &&
                  initialData.passport_expiry !== ''
                    ? moment(initialData.passport_expiry)
                    : null,
              }
            : { ...initialData }
        }
        scrollToFirstError
      >
        <Box>
          <Row gutter={[16, 0]} justify='center'>
            <Col xs={24} lg={19} xxl={20}>
              <Row gutter={[16, 0]}>
                <Form.Item name='is_fresher'>
                  <Input maxLength={50} type='hidden' />
                </Form.Item>
                <Form.Item name='email'>
                  <Input maxLength={50} type='hidden' />
                </Form.Item>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='first_name'
                    label='First Name'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter first name',
                      },
                      {
                        max: 50,
                        message: 'First name should not be greater then 50 characters',
                      },
                    ]}
                  >
                    <Input maxLength={50} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='middle_name' label='Middle Name' labelCol={{ span: 24 }}>
                    <Input maxLength={50} />
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
                        message: 'Please enter last name',
                      },
                      {
                        max: 50,
                        message: 'Last name should not be greater then 50 characters',
                      },
                    ]}
                  >
                    <Input maxLength={50} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='gender'
                    label='Gender'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select gender',
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value='male'>Male</Radio>
                      <Radio value='female'>Female</Radio>
                      <Radio value='others'>Others</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='date_of_birth'
                    label='Date of Birth'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please Select date of birth',
                      },
                    ]}
                  >
                    <DatePicker
                      format='DD-MM-YYYY'
                      disabledDate={(d) => !d || d.isAfter(moment())}
                      getPopupContainer={(trigger) => trigger.parentNode}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='place_of_birth' label='Place of birth' labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='mobile_no'
                    label='Mobile Number'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter mobile number',
                      },
                    ]}
                  >
                    <Input readOnly />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='whatsapp_id'
                    label='Whatsapp No.'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        min: 10,
                        max: 10,
                        message: 'Please enter valid whatsapp no.',
                      },
                    ]}
                  >
                    <Input type='number' />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='skype_id' label='Skype Id' labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='passport_number'
                    label='Passport Number'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        min: 8,
                        message: 'Passport number length should be of 8 characters',
                      },
                      {
                        max: 8,
                        message: 'Passport number length should be of 8 characters',
                      },
                    ]}
                  >
                    <Input maxLength={8} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='passport_expiry' label='Passport Expiry Date' labelCol={{ span: 24 }}>
                    <DatePicker
                      format='DD-MM-YYYY'
                      disabledDate={(current) => {
                        return moment().add(-1, 'days') >= current;
                      }}
                      getPopupContainer={(trigger) => trigger.parentNode}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='fax_number' label='Fax Number' labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='father_name'
                    label="Father's Full Name"
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter Father name',
                      },
                    ]}
                  >
                    <Input maxLength={50} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item name='father_occupation' label="Father's Occupation" labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='is_indian_citizen'
                    valuePropName='checked'
                    label='Are You Indian Citizen ?'
                    labelCol={{ span: 24 }}
                  >
                    <Checkbox style={{ lineHeight: '32px' }} />
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
                      {religion.map((item, index) => (
                        <Option key={String(index)} value={item.religion_id}>
                          {item.religion_name}
                        </Option>
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
                        message: 'Please select caste',
                      },
                    ]}
                  >
                    <Select placeholder='Select Caste' getPopupContainer={(trigger) => trigger.parentNode}>
                      <Option value='sc'>SC</Option>
                      <Option value='st'>ST</Option>
                      <Option value='obc'>OBC</Option>
                      <Option value='gen'>GEN</Option>
                      <Option value='pwd'>PWD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item
                    name='relaxation_rule_id'
                    label='Relaxation Category'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select Category',
                      },
                    ]}
                  >
                    <Select placeholder='Select Category' getPopupContainer={(trigger) => trigger.parentNode}>
                      {relaxation.map((item) => (
                        <Option value={item.relaxation_rule_id}>{item.relaxation.relaxation_category}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col xs={24} lg={5} xxl={4}>
              <Space direction='vertical' align='center'>
                <Image
                  src={
                    profilePic.doc_file_path
                      ? profilePic?.doc_file_path
                      : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
                  }
                />
                <Space direction='vertical'>
                  <Button type='primary' htmlType='button' onClick={handleOpen}>
                    Upload Image
                  </Button>
                  <Button
                    type='danger'
                    htmlType='button'
                    onClick={() =>
                      setProfilePic({
                        ...profilePic,
                        doc_file_path: 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
                      })
                    }
                    hidden={deleting}
                  >
                    Delete Image
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Box>
        <Row justify='space-between'>
          <Space>
            {router.query && router.query?.redirect && (
              <Button htmlType='button' onClick={onBackToPreview}>
                Back to Application Preview
              </Button>
            )}
            <Button htmlType='button' onClick={() => personalForm.resetFields()}>
              Reset
            </Button>
          </Space>
          <Space>
            <Popconfirm
              title='Do you need to save the data?'
              okText='Yes'
              cancelText='No'
              onConfirm={() => personalForm.submit()}
              onCancel={() => {}}
              getPopupContainer={(trigger) => trigger.parentNode}
              placement='topRight'
            >
              <Button type='primary' htmlType='submit'>
                {submitting && <Spin indicator={antIcon} />}
                Save
              </Button>
            </Popconfirm>
            <Popconfirm
              title='Do you need to save the data?'
              okText='Yes'
              cancelText='No'
              visible={showConfirm}
              onConfirm={() => personalForm.submit()}
              onCancel={onNext}
              getPopupContainer={(trigger) => trigger.parentNode}
              placement='left'
            >
              <Button type='primary' htmlType='button' onClick={() => setShowConfirm(true)}>
                {submitting && <Spin indicator={antIcon} />}
                Next
              </Button>
            </Popconfirm>
          </Space>
        </Row>
      </Form>

      {modalOpen && (
        <DashboardModal
          uppy={uppy}
          plugins={['Webcam', 'ImageEditor']}
          metaFields={[{ id: 'name', name: 'Name', placeholder: 'File name' }]}
          closeModalOnClickOutside
          open={modalOpen}
          onRequestClose={handleClose}
          autoOpenFileEditor={true}
          // hideUploadButton={true}
        />
      )}
    </FormStyles>
  );
};

Personal.propTypes = {
  onNext: PropTypes.func.isRequired,
};

export default Personal;
