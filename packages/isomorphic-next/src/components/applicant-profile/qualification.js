import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import moment from 'moment';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Upload,
  notification,
  Space,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';
import EducationFilter from '../../../containers/Admin/EducationFilters/EducationFilter';

const Qualification = ({ onNext, onPrevious }) => {
  const router = useRouter();
  const [formEducation] = Form.useForm();
  const [formProfessionalTraining] = Form.useForm();
  const [formFellowship] = Form.useForm();
  const [formPublishedPaper] = Form.useForm();
  const { Text } = Typography;
  const { Option } = Select;
  const { client } = useAuthState();
  const { user } = useUser({});
  const [documents, setDocuments] = useState([]);
  const [publishedPaper, setPublishedPaper] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [initialEducationData, setInitialEducationData] = useState();
  const [initialProfessionalTraining, setInitialProfessionalTraining] = useState();
  const [initialFellowshipData, setInitialFellowshipData] = useState();
  const [initialPublishedPaper, setInitialPublishedPaper] = useState();
  const [isEducationDataSubmitted, setEducationDataSubmitted] = useState();
  const [isProfessionalTrainingSubmitted, setProfessionalTrainingSubmitted] = useState();
  const [isFellowshipDataSubmitted, setFellowshipDataSubmitted] = useState([]);
  const [isPublishedPaperSubmitted, setPublishedPaperSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const responseQualifications = await client.get(`/user/public/applicant_qualifications/${user.user_id}/`);
      const responseTrainings = await client.get(`/user/public/professional_trainings/${user.user_id}/`);
      const responseFellowships = await client.get(`/user/public/applicant_fellow_ships/${user.user_id}/`);
      const responsePapers = await client.get(`/user/public/published_papers/${user.user_id}/`);
      // const responseDegree = await client.get('/user/public/education_degree_list/');
      // const responseStream = await client.get('/user/public/education_stream_list/');

      setInitialEducationData({
        ...(responseQualifications.data.isEmpty && responseQualifications.data.isEmpty === 'true'
          ? { education_details: [] }
          : {
              education_details: responseQualifications.data.map((data) => ({
                id: data.id,
                college_name: data.college_name,
                education_degree: data.exam_name.education_id,
                passing_year: data.passing_year,
                score: data.score,
                status: data.status,
                stream_name: data.specialization.stream_id,
                university: data.university,
              })),
            }),
      });

      setInitialProfessionalTraining({
        ...(responseTrainings.data.isEmpty && responseTrainings.data.isEmpty === 'true'
          ? { professional_training: [] }
          : {
              professional_training: responseTrainings.data.map((data) => ({
                ...data,
                from_date: moment(data.from_date),
                to_date: moment(data.to_date),
                training_period: [moment(data.from_date), moment(data.to_date)],
              })),
            }),
      });

      setInitialFellowshipData({
        ...(responseFellowships.data.isEmpty && responseFellowships.data.isEmpty === 'true'
          ? { fellowship_details: [] }
          : { fellowship_details: responseFellowships.data }),
      });

      setInitialPublishedPaper({
        ...(responsePapers.data.isEmpty && responsePapers.data.isEmpty === 'true'
          ? { published_paper: [] }
          : {
              published_paper: responsePapers.data.map((data) => ({
                ...data,
              })),
            }),
      });

      if (responsePapers.data && responsePapers.data.length > 0) {
        const publishedPaperFilter = responsePapers.data.map((paper) => ({
          doc_id: paper.attachments[0]?.doc_id,
          doc_file_path: paper.attachments[0]?.doc_file_path,
          doc_name: paper.attachments[0]?.doc_name,
        }));

        setDocuments(publishedPaperFilter);
        setPublishedPaper(publishedPaperFilter);
      }
    };

    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onNextSubmit = async () => {
    setShowConfirm(false);

    if (
      formEducation.isFieldsTouched() &&
      formEducation.getFieldsValue().education_details &&
      formEducation.getFieldsValue().education_details.length > 0
    ) {
      await formEducation
        .validateFields()
        .then(() => formEducation.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill education details`,
          });
          throw x;
        });
    }

    if (
      formProfessionalTraining.isFieldsTouched() &&
      formProfessionalTraining.getFieldsValue().professional_training &&
      formProfessionalTraining.getFieldsValue().professional_training.length > 0
    ) {
      await formProfessionalTraining
        .validateFields()
        .then(() => formProfessionalTraining.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill professional details`,
          });
          throw x;
        });
    }

    if (
      formFellowship.isFieldsTouched() &&
      formFellowship.getFieldsValue().fellowship_details &&
      formFellowship.getFieldsValue().fellowship_details.length > 0
    ) {
      await formFellowship
        .validateFields()
        .then(() => formFellowship.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill fellowship details`,
          });
          throw x;
        });
    }

    if (
      formPublishedPaper.isFieldsTouched() &&
      formPublishedPaper.getFieldsValue().published_paper &&
      formPublishedPaper.getFieldsValue().published_paper.length > 0
    ) {
      await formPublishedPaper
        .validateFields()
        .then(() => formPublishedPaper.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill published paper details`,
          });
          throw x;
        });
    }
    onNext();
  };

  const onSubmitEducationForm = async (values) => {
    if (!isEducationDataSubmitted || formEducation.isFieldsTouched()) {
      if (initialEducationData.education_details.length === 0) {
        await client.post(
          `/user/public/applicant_qualification_create/${user.user_id}/`,
          values.education_details.map((data) => ({
            ...data,
            exam_name: { education_id: data.education_degree },
            specialization: { stream_id: data.stream_name },
          }))
        );
        notification['success']({
          description: `Education details added successfully`,
        });
      } else {
        const updateData = values.education_details.filter((dt) => !!dt.id);
        const createData = values.education_details.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(
            `/user/public/applicant_qualification_update/${user.user_id}/`,
            updateData.map((data) => ({
              ...data,
              exam_name: { education_id: data.education_degree },
              specialization: { stream_id: data.stream_name },
            }))
          );
        }
        if (createData.length > 0) {
          await client.post(
            `/user/public/applicant_qualification_create/${user.user_id}/`,
            createData.map((data) => ({
              ...data,
              exam_name: { education_id: data.education_degree },
              specialization: { stream_id: data.stream_name },
            }))
          );
        }
        notification['success']({
          description: `Education details updated successfully`,
        });
      }
      setEducationDataSubmitted(true);

      const responseQualifications = await client.get(`/user/public/applicant_qualifications/${user.user_id}/`);
      await formEducation.setFieldsValue({
        education_details: responseQualifications.data.map((data) => ({
          ...data,
          education_degree: data.exam_name.education_id,
          stream_name: data.specialization.stream_id,
        })),
      });
      setInitialEducationData({
        ...(responseQualifications.data.isEmpty && responseQualifications.data.isEmpty === 'true'
          ? { education_details: [] }
          : {
              education_details: responseQualifications.data.map((data) => ({
                id: data.id,
                college_name: data.college_name,
                education_degree: data.exam_name.education_id,
                passing_year: data.passing_year,
                score: data.score,
                status: data.status,
                stream_name: data.specialization.stream_id,
                university: data.university,
              })),
            }),
      });
    }
  };

  const onSubmitProfessionalTraining = async (values) => {
    if (!isProfessionalTrainingSubmitted || formProfessionalTraining.isFieldsTouched()) {
      if (initialProfessionalTraining.professional_training.length === 0) {
        await client.post(
          `/user/public/professional_training_create/${user.user_id}/`,
          values.professional_training.map((data) => ({
            ...data,
            from_date: moment(data.training_period[0]).format('YYYY-MM-DD'),
            to_date: moment(data.training_period[1]).format('YYYY-MM-DD'),
          }))
        );
        notification['success']({
          description: `Professional training details added successfully`,
        });
      } else {
        const updateData = values.professional_training.filter((dt) => !!dt.id);
        const createData = values.professional_training.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(
            `/user/public/professional_training_update/${user.user_id}/`,
            updateData.map((data) => ({
              ...data,
              from_date: moment(data.training_period[0]).format('YYYY-MM-DD'),
              to_date: moment(data.training_period[1]).format('YYYY-MM-DD'),
            }))
          );
        }
        if (createData.length > 0) {
          await client.post(
            `/user/public/professional_training_create/${user.user_id}/`,
            createData.map((data) => ({
              ...data,
              from_date: moment(data.training_period[0]).format('YYYY-MM-DD'),
              to_date: moment(data.training_period[1]).format('YYYY-MM-DD'),
            }))
          );
        }
        notification['success']({
          description: `Professional training details updated successfully`,
        });
      }

      const responseTrainings = await client.get(`/user/public/professional_trainings/${user.user_id}/`);

      await formProfessionalTraining.setFieldsValue({
        professional_training: responseTrainings.data.map((data) => ({
          ...data,
          from_date: moment(data.from_date),
          to_date: moment(data.to_date),
          training_period: [moment(data.from_date), moment(data.to_date)],
        })),
      });

      setInitialProfessionalTraining({
        ...(responseTrainings.data.isEmpty && responseTrainings.data.isEmpty === 'true'
          ? { professional_training: [] }
          : {
              professional_training: responseTrainings.data.map((data) => ({
                ...data,
                from_date: moment(data.from_date),
                to_date: moment(data.to_date),
                training_period: [moment(data.from_date), moment(data.to_date)],
              })),
            }),
      });

      setProfessionalTrainingSubmitted(true);
    }
  };

  const onSubmitFellowshipForm = async (values) => {
    if (!isFellowshipDataSubmitted || formFellowship.isFieldsTouched()) {
      if (initialFellowshipData.fellowship_details.length === 0) {
        await client.post(`/user/public/applicant_fellow_ships_create/${user.user_id}/`, values.fellowship_details);
        notification['success']({
          description: `Fellowship details added successfully`,
        });
      } else {
        const updateData = values.fellowship_details.filter((dt) => !!dt.id);
        const createData = values.fellowship_details.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(`/user/public/applicant_fellow_ships_update/${user.user_id}/`, updateData);
        }
        if (createData.length > 0) {
          await client.post(`/user/public/applicant_fellow_ships_create/${user.user_id}/`, createData);
        }
        notification['success']({
          description: `Fellowship details updated successfully`,
        });
      }
      setFellowshipDataSubmitted(true);

      const responseFellowships = await client.get(`/user/public/applicant_fellow_ships/${user.user_id}/`);
      await formFellowship.setFieldsValue({ fellowship_details: responseFellowships.data });
      setInitialFellowshipData({
        ...(responseFellowships.data.isEmpty && responseFellowships.data.isEmpty === 'true'
          ? { fellowship_details: [] }
          : { fellowship_details: responseFellowships.data }),
      });
    }
  };

  const onSubmitPublishedPaper = async (values) => {
    if (!isPublishedPaperSubmitted && formPublishedPaper.isFieldsTouched()) {
      if (initialPublishedPaper.published_paper.length === 0) {
        await client.post(
          `/user/public/published_paper_create/${user.user_id}/`,
          values.published_paper.map((data, index) => ({
            paper_title: data.paper_title,
            attachments: [
              {
                doc_id: documents[index].doc_id,
              },
            ],
          }))
        );
        notification['success']({
          description: `Published paper details added successfully`,
        });
      } else {
        await client.put(
          `/user/public/published_paper_update/${user.user_id}/`,
          values.published_paper.map((data, index) => ({
            id: data.id ? data.id : '',
            paper_title: data.paper_title,
            attachments: [documents[index]],
          }))
        );

        notification['success']({
          description: `Published paper details updated successfully`,
        });
      }
      setPublishedPaperSubmitted(true);

      const responsePapers = await client.get(`/user/public/published_papers/${user.user_id}/`);

      if (responsePapers.isEmpty !== undefined) {
        await formPublishedPaper.setFieldsValue({ professional_training: responsePapers.data });

        if (!responsePapers.data.isEmpty && responsePapers.data.isEmpty !== 'true') {
          const docs = responsePapers.data.map((doc) => doc.attachments[0]);

          setDocuments(docs);
        }

        setInitialPublishedPaper({
          ...(responsePapers.data.isEmpty && responsePapers.data.isEmpty === 'true'
            ? { published_paper: [] }
            : { published_paper: responsePapers.data }),
        });
      }

      router.replace(`/applicant-profile-main/?tab=2`);
      setTimeout(() => {
        router.reload();
      }, 1000);
    }
  };

  const onDeleteEducationalDetails = async (name) => {
    const { getFieldsValue } = formEducation;
    const data = getFieldsValue().education_details[name];
    if (data && data.id) {
      await client.delete(`/user/public/applicant_qualification_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Education detail deleted successfully`,
    });
  };

  const onDeleteProfessionalTraining = async (index) => {
    const { getFieldsValue } = formProfessionalTraining;
    const data = getFieldsValue().professional_training[index];
    if (data && data.id) {
      await client.delete(`/user/public/professional_training_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Professional training deleted successfully`,
    });
  };

  const onDeleteFellowshipDetails = async (index) => {
    const { getFieldsValue } = formFellowship;
    const data = getFieldsValue().fellowship_details[index];
    if (data && data.id) {
      await client.delete(`/user/public/applicant_fellow_ships_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Fellowship deleted successfully`,
    });
  };

  const onDeletePaper = async (index) => {
    const { getFieldsValue } = formPublishedPaper;
    const data = getFieldsValue().published_paper[index];
    getFieldsValue().published_paper.pop(index);

    if (data && data.id) {
      await client.delete(`/user/public/published_paper_delete/${user.user_id}/`, { data: { id: data.id } });

      const docsFilter = getFieldsValue().published_paper.map((doc) => ({
        doc_id: doc.attachments[0].doc_id,
        doc_file_path: doc.attachments[0].doc_file_path,
        doc_name: doc.attachments[0].doc_name,
      }));

      setDocuments(docsFilter);
    }
    notification['success']({
      description: `Publish paper deleted successfully`,
    });
  };

  const handleDeletePaper = async (data) => {
    try {
      let req = {
        document_id: data.uid,
        document_type: 'papers',
      };
      const response = await client.delete(`/user/delete/document/`, { data: req });
      if (response.status === 200) {
        notification['success']({
          description: `Docuement deleted successfully`,
        });
      }
    } catch (err) {
      notification['error']({
        description: `Unable to delete document`,
      });
    }
  };

  const onBackToPreview = () => {
    router.push(
      `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
    );
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialEducationData || !initialProfessionalTraining || !initialFellowshipData || !initialPublishedPaper)
    return null;

  return (
    <FormStyles>
      <>
        <Box>
          <Form
            form={formEducation}
            name='formEducation'
            onFinish={onSubmitEducationForm}
            initialValues={{ ...initialEducationData }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col span={16}>
                <PageHeader>Education Details</PageHeader>
              </Col>
            </Row>

            <Form.List name='education_details'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((key, name, fieldKey, ...restField) => (
                    <Box>
                      <Row gutter={[16, 0]} key={key}>
                        <EducationFilter
                          key={key}
                          name={name}
                          fieldKey={fieldKey}
                          form={formEducation}
                          {...restField}
                        />
                      </Row>
                      <Row gutter={[16, 0]} mb={5} justify='end'>
                        <Col>
                          <Popconfirm
                            title='Are you sure to delete this detail?'
                            onConfirm={() => {
                              onDeleteEducationalDetails(name);
                              remove(name);
                            }}
                            onCancel={() => {}}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            placement='left'
                          >
                            <Button type='danger' htmlType='button'>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    </Box>
                  ))}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Education Details
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formEducation.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formEducation.submit()}
                        onCancel={() => {}}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        placement='topRight'
                      >
                        <Button type='primary' htmlType='submit'>
                          Save
                        </Button>
                      </Popconfirm>
                    </Row>
                  )}
                </>
              )}
            </Form.List>
          </Form>
        </Box>
        <Box>
          <Form
            form={formProfessionalTraining}
            name='formProfessionalTraining'
            onFinish={onSubmitProfessionalTraining}
            initialValues={{ ...initialProfessionalTraining }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col span={16}>
                <PageHeader>Professional Training</PageHeader>
              </Col>
            </Row>

            <Form.List name='professional_training'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box key={String(index)}>
                      <Row gutter={[16, 0]}>
                        <Form.Item {...field} name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                          <Input type='hidden' />
                        </Form.Item>
                        <Col xs={24} lg={16}>
                          <Form.Item
                            {...field}
                            label='Title'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'title']}
                            fieldKey={[field.fieldKey, 'title']}
                            rules={[{ required: true, message: 'Please enter title' }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            label='From - To'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'training_period']}
                            fieldKey={[field.fieldKey, 'training_period']}
                            rules={[
                              {
                                required: true,
                                message: 'Please select dates',
                              },
                            ]}
                          >
                            <DatePicker.RangePicker
                              format='DD-MM-YYYY'
                              getPopupContainer={(trigger) => trigger.parentNode}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            {...field}
                            label='Description'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'description']}
                            fieldKey={[field.fieldKey, 'description']}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter description',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 0]} justify='end'>
                        <Col>
                          <Popconfirm
                            title='Are you sure to delete this detail?'
                            onConfirm={() => {
                              onDeleteProfessionalTraining(index);
                              remove(field.name);
                            }}
                            onCancel={() => {}}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            placement='left'
                          >
                            <Button type='danger' htmlType='button'>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    </Box>
                  ))}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Professional Training
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formProfessionalTraining.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formProfessionalTraining.submit()}
                        onCancel={() => {}}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        placement='topRight'
                      >
                        <Button type='primary' htmlType='submit'>
                          Save
                        </Button>
                      </Popconfirm>
                    </Row>
                  )}
                </>
              )}
            </Form.List>
          </Form>
        </Box>
        <Box>
          <Form
            form={formFellowship}
            name='formFellowship'
            onFinish={onSubmitFellowshipForm}
            initialValues={{ ...initialFellowshipData }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col span={16}>
                <PageHeader>Fellowship Details</PageHeader>
              </Col>
            </Row>

            <Form.List name='fellowship_details'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box>
                      <Row gutter={[16, 0]}>
                        <Form.Item {...field} name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                          <Input type='hidden' />
                        </Form.Item>
                        <Col xs={24} lg={12}>
                          <Form.Item
                            {...field}
                            label='Entrance Examination Name'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'entrance_examination']}
                            fieldKey={[field.fieldKey, 'entrance_examination']}
                            rules={[
                              {
                                required: true,
                                message: 'Entrance examination name must be selected',
                              },
                            ]}
                          >
                            <Select
                              placeholder='Select Entrance Examination Name'
                              getPopupContainer={(trigger) => trigger.parentNode}
                            >
                              <Option value='gate'>GATE</Option>
                              <Option value='net'>NET</Option>
                              <Option value='set'>SET</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={4}>
                          <Form.Item
                            {...field}
                            label='Passing Year'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'passing_year']}
                            fieldKey={[field.fieldKey, 'passing_year']}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter passing year',
                              },
                              {
                                pattern: new RegExp(/^[0-9\b]+$/),
                                message: 'Passing year must be numeric',
                              },
                            ]}
                          >
                            <Input type='tel' maxLength={4} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} lg={12}>
                          <Form.Item
                            {...field}
                            label='Score'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'score']}
                            fieldKey={[field.fieldKey, 'score']}
                            rules={[
                              { required: true, message: 'Please enter Score' },
                              {
                                pattern: new RegExp(/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/),
                                message: 'Please enter valid score',
                              },
                              {
                                pattern: new RegExp(/^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/),
                                message: 'Score must be between 0 to 100',
                              },
                            ]}
                          >
                            <Input min={0} max={100} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} lg={12}>
                          <Form.Item
                            {...field}
                            label='Score Unit'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'scoring_unit']}
                            fieldKey={[field.fieldKey, 'scoring_unit']}
                            rules={[
                              {
                                required: true,
                                message: 'Score unit must be selected',
                              },
                            ]}
                          >
                            <Select
                              placeholder='Select Examination'
                              getPopupContainer={(trigger) => trigger.parentNode}
                            >
                              <Option value='%'>%</Option>
                              <Option value='division'>Division</Option>
                              <Option value='class'>Class</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 0]} mb={5} justify='end'>
                        <Col>
                          <Popconfirm
                            title='Are you sure to delete this detail?'
                            onConfirm={() => {
                              onDeleteFellowshipDetails(index);
                              remove(field.name);
                            }}
                            onCancel={() => {}}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            placement='left'
                          >
                            <Button type='danger' htmlType='button'>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    </Box>
                  ))}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Fellowship Details
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formFellowship.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formFellowship.submit()}
                        onCancel={() => {}}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        placement='topRight'
                      >
                        <Button type='primary' htmlType='submit'>
                          Save
                        </Button>
                      </Popconfirm>
                    </Row>
                  )}
                </>
              )}
            </Form.List>
          </Form>
        </Box>
        <Box>
          <Form
            form={formPublishedPaper}
            name='formPublishedPaper'
            onFinish={onSubmitPublishedPaper}
            initialValues={{ ...initialPublishedPaper }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col span={16}>
                <PageHeader>Published Paper</PageHeader>
              </Col>
            </Row>
            <Text type='danger'>
              <small>*Upload file format allowed is PDF and maximum size allowed is 500kb </small>
            </Text>
            <Form.List name='published_paper'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => {
                    return (
                      <Box key={String(index)}>
                        <Row gutter={[16, 0]}>
                          <Form.Item {...field} name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                            <Input type='hidden' />
                          </Form.Item>
                          <Col xs={24} lg={8}>
                            <Form.Item
                              {...field}
                              label='Paper Title'
                              labelCol={{ span: 24 }}
                              name={[field.name, 'paper_title']}
                              fieldKey={[field.fieldKey, 'paper_title']}
                              rules={[{ required: true, message: 'Please enter title' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col xs={24} lg={14}>
                            <Form.Item
                              {...field}
                              label='File'
                              labelCol={{ span: 24 }}
                              name={[field.name, 'attachments']}
                              fieldKey={[field.fieldKey, 'attachments']}
                              //getValueFromEvent={normFile}
                              //valuePropName='fileList'
                              rules={[{ required: true, message: 'Please upload' }]}
                              getValueFromEvent={(e) => {
                                return e && e.fileList;
                              }}
                              style={{ marginBottom: 0 }}
                            >
                              <Upload
                                listType='file'
                                accept='.pdf'
                                required
                                action={`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=paper_attachment&user_id=${user.user_id}`}
                                headers={{
                                  authorization: `Token ${localStorage.getItem('token')}`,
                                }}
                                beforeUpload={(file) => {
                                  if (file && file.size > 500000) {
                                    notification['error']({
                                      description: `file size should be less than 500Kb`,
                                    });
                                    return false;
                                  }
                                }}
                                onChange={(info) => {
                                  if (info.file.status !== 'uploading') {
                                  }
                                  if (info.file.status === 'done') {
                                    notification['success']({
                                      description: `${info.file.name} file uploaded successfully`,
                                    });
                                  } else if (info.file.status === 'error') {
                                    notification['error']({
                                      description: `${info.file.name} file upload failed`,
                                    });
                                  }
                                }}
                                onSuccess={(data) => {
                                  const newDocs = documents.length > 0 ? [...documents] : [...publishedPaper];
                                  newDocs[index] = {
                                    doc_id: data.doc_id,
                                    doc_file_path: data.doc_file_path,
                                    doc_name: data.doc_name,
                                  };

                                  setDocuments(newDocs);
                                  setPublishedPaperSubmitted(false);
                                }}
                                onRemove={handleDeletePaper}
                                maxCount={1}
                                multiple={false}
                                defaultFileList={
                                  initialPublishedPaper &&
                                  initialPublishedPaper?.published_paper.length > 0 &&
                                  initialPublishedPaper?.published_paper.length > field.fieldKey
                                    ? [
                                        {
                                          uid: initialPublishedPaper.published_paper[field.fieldKey].attachments[0]
                                            ?.doc_id,
                                          name: initialPublishedPaper.published_paper[field.fieldKey].attachments[0]
                                            ?.doc_name,
                                          status: initialPublishedPaper.published_paper[field.fieldKey].attachments[0]
                                            ?.doc_file_path
                                            ? 'done'
                                            : 'removed',
                                          url: initialPublishedPaper.published_paper[field.fieldKey].attachments[0]
                                            ?.doc_file_path,
                                        },
                                      ]
                                    : []
                                }
                                showUploadList={{
                                  showRemoveIcon: true,
                                }}
                              >
                                <Button icon={<UploadOutlined />}>Upload File</Button>
                                {/* <Button icon={<UploadOutlined />}>
                                  {documents[index]
                                    ? documents[index].doc_name?.split('/')[
                                        documents[index].doc_name?.split('/').length - 1
                                      ]
                                    : 'Upload File'}{' '}
                                </Button> */}
                              </Upload>
                            </Form.Item>
                          </Col>
                          <Col xs={2} lg={2}>
                            <Popconfirm
                              title='Are you sure to delete this detail?'
                              onConfirm={() => {
                                onDeletePaper(index);
                                remove(field.name);
                              }}
                              onCancel={() => {}}
                              getPopupContainer={(trigger) => trigger.parentNode}
                              placement='left'
                            >
                              <Button type='danger' htmlType='button'>
                                Delete
                              </Button>
                            </Popconfirm>
                          </Col>
                        </Row>
                      </Box>
                    );
                  })}
                  <Form.Item>
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Published Paper
                    </Button>
                  </Form.Item>
                  <Row justify='space-between'>
                    <Button htmlType='button' onClick={() => formPublishedPaper.resetFields()}>
                      Reset
                    </Button>
                    <Popconfirm
                      title='Do you need to save the data?'
                      okText='Yes'
                      cancelText='No'
                      onConfirm={() => formPublishedPaper.submit()}
                      onCancel={() => {}}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      placement='topRight'
                    >
                      <Button type='primary' htmlType='submit'>
                        Save
                      </Button>
                    </Popconfirm>
                  </Row>
                </>
              )}
            </Form.List>
          </Form>
        </Box>
        <Row justify='space-between'>
          <Form.Item>
            <Space>
              {router.query && router.query?.redirect && (
                <Button htmlType='button' onClick={onBackToPreview}>
                  Back to Application Preview
                </Button>
              )}
              <Button type='danger' htmlType='button' onClick={onPrevious}>
                Previous
              </Button>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Popconfirm
                title='Do you need to save the data?'
                okText='Yes'
                cancelText='No'
                visible={showConfirm}
                onConfirm={onNextSubmit}
                onCancel={onNext}
                getPopupContainer={(trigger) => trigger.parentNode}
                placement='left'
              >
                <Button type='primary' htmlType='button' onClick={() => setShowConfirm(true)}>
                  Next
                </Button>
              </Popconfirm>
            </Space>
          </Form.Item>
        </Row>
      </>
    </FormStyles>
  );
};

Qualification.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default Qualification;
