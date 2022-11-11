import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Router from 'next/router';
import moment from 'moment';
import { Row, Col, Form, Input, Button, Checkbox, Select, DatePicker, notification, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '@iso/components/utility/pageHeader';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';

const Experience = ({ onNext, onPrevious }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { Option } = Select;
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialData, setInitialData] = useState();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isNoExperienceYet, setIsNoExperienceYet] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/applicant_experiences/${user.user_id}/`);
      const responsePersonalInfo = await client.get(`/user/public/personal_info/${user.user_id}/`);

      setIsNoExperienceYet(responsePersonalInfo.data.is_fresher);

      setInitialData({
        ...(response.data.isEmpty && response.data.isEmpty === 'true'
          ? { past_employment_details: [] }
          : {
              past_employment_details: response.data.map((data) => ({
                ...data,
                ...(data.employed_from !== null && data.employed_to !== null
                  ? {
                      experience_from_to: [moment(data.employed_from), moment(data.employed_to)],
                      currently_working: false,
                    }
                  : { employed_from: moment(data.employed_from), currently_working: true }),
              })),
            }),
      });
      if (!response.data.isEmpty && response.data.isEmpty !== 'true') {
        const formdata = response.data.map((res, index) => ({
          ...res,
          ...(res.employed_from !== null && res.employed_to !== null
            ? { experience_from_to: [moment(res.employed_from), moment(res.employed_to)], currently_working: false }
            : { employed_from: moment(res.employed_from), currently_working: true }),
        }));

        await form.setFieldsValue({ past_employment_details: formdata });
      }
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onSubmitForm = async (values) => {
    try {
      if (!isNoExperienceYet && values.past_employment_details.length === 0) {
        notification['error']({
          description: 'Please fill experience details',
        });
        return;
      }

      const updateData = values.past_employment_details.filter((dt) => !!dt.id);
      const createData = values.past_employment_details.filter((dt) => !dt.id);

      if (updateData.length > 0) {
        await client.put(
          `/user/public/applicant_experience_update/${user.user_id}/`,
          updateData.map((data) => ({
            ...data,
            ...(data.currently_working
              ? { employed_from: moment(data.employed_from).format('YYYY-MM-DD'), employed_to: null }
              : {
                  employed_from: moment(data.experience_from_to[0]).format('YYYY-MM-DD'),
                  employed_to: moment(data.experience_from_to[1]).format('YYYY-MM-DD'),
                }),
          }))
        );
      }
      if (createData.length > 0) {
        await client.post(
          `/user/public/applicant_experience_create/${user.user_id}/`,

          createData.map((data) => ({
            ...data,
            ...(data.currently_working
              ? { employed_from: moment(data.employed_from).format('YYYY-MM-DD'), employed_to: null }
              : {
                  employed_from: moment(data.experience_from_to[0]).format('YYYY-MM-DD'),
                  employed_to: moment(data.experience_from_to[1]).format('YYYY-MM-DD'),
                }),
            is_fresher: isNoExperienceYet,
          }))
        );
        // }
      }
      notification['success']({
        description: `Experience details updated successfully`,
      });

      const response = await client.get(`/user/public/applicant_experiences/${user.user_id}/`);
      const fields = form.getFieldsValue();
      const { past_employment_details } = fields;
      const data = response.data.map((res, index) => ({
        ...res,
        ...(res.employed_from !== null && res.employed_to !== null
          ? { experience_from_to: [moment(res.employed_from), moment(res.employed_to)], currently_working: false }
          : { employed_from: moment(res.employed_from), currently_working: true }),
      }));

      await form.setFieldsValue({ past_employment_details: data });

      setShowConfirm(false);
    } catch (error) {
      setShowConfirm(false);
    }
  };

  const onNextSubmit = async () => {
    setShowConfirm(false);
    if (isNoExperienceYet) {
      onNext();
      return;
    } else if (
      form.isFieldsTouched() &&
      form.getFieldsValue().past_employment_details &&
      form.getFieldsValue().past_employment_details.length > 0
    ) {
      await form
        .validateFields()
        .then(() => form.submit())
        .catch((x) => {
          notification['error']({
            description: 'Please fill details',
          });
          throw x;
        });
    }
    if (!form.getFieldsValue().past_employment_details || form.getFieldsValue().past_employment_details.length === 0) {
      notification['error']({
        description: 'Please add details',
      });
      return;
    }
    onNext();
  };

  const onDeleteEmploymentDetails = async (index) => {
    const { getFieldsValue } = form;
    const data = getFieldsValue().past_employment_details[index];
    if (data && data.id) {
      await client.delete(`/user/public/applicant_experience_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Experience details deleted successfully`,
    });
  };

  const onNoExperienceYetChange = async (e) => {
    await Promise.all(
      form.getFieldsValue().past_employment_details.map(async (data) => {
        if (data && data.id && data.id !== null)
          await client.delete(`/user/public/applicant_experience_delete/${user.user_id}/`, {
            data: { id: data.id },
          });
      })
    );

    form.setFieldsValue({ past_employment_details: [] });
    setInitialData(form.getFieldsValue());
    setIsNoExperienceYet(e.target.checked);
    await client.put(`/user/public/applicant_is_fresher/${user.user_id}/`, {
      is_fresher: !isNoExperienceYet,
    });
  };

  const onChangeCurrentlyWorking = async (value, key) => {
    const fields = form.getFieldsValue();

    const { past_employment_details } = fields;

    const data = past_employment_details.map((res, index) => ({
      ...res,
      currently_working: index === key ? value : false,
      experience_from_to: index === key ? [undefined, undefined] : [moment(res.employed_from), moment(res.employed_to)],
      employed_from: index === key ? undefined : moment(res.employed_from),
      employed_to: value ? null : moment(res.employed_to),
    }));

    // Object.assign(past_employment_details[key], { specialization: value === 'ssc' ? 'NA' : undefined });
    await form.setFieldsValue({ past_employment_details: data });
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

  return (
    <FormStyles>
      <Form form={form} name='form' onFinish={onSubmitForm} initialValues={{ ...initialData }} scrollToFirstError>
        <Box>
          <Row gutter={[16, 0]}>
            <Col span={16}>
              <PageHeader>Past Employment Details</PageHeader>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name='no_experience_yet' label='' labelCol={{ span: 24 }}>
                <Checkbox checked={isNoExperienceYet} onChange={onNoExperienceYetChange} style={{ lineHeight: '32px' }}>
                  No Experience yet
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.List name='past_employment_details'>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Box>
                    <Form.Item
                      {...field}
                      name={[field.name, 'id']}
                      fieldKey={[field.fieldKey, 'id']}
                      style={{ height: 0, marginBottom: 0 }}
                    >
                      <Input type='hidden' />
                    </Form.Item>
                    <Row gutter={[16, 0]}>
                      <Col xs={24} lg={10}>
                        <Form.Item
                          {...field}
                          label='Employer'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'employer_name']}
                          fieldKey={[field.fieldKey, 'employer_name']}
                          rules={[
                            {
                              required: !isNoExperienceYet,
                              message: "Employer name can't be empty",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={10}>
                        <Form.Item
                          {...field}
                          label='Designation'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'post']}
                          fieldKey={[field.fieldKey, 'post']}
                          rules={[{ required: !isNoExperienceYet, message: "Post can't be empty" }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={4}>
                        <Form.Item
                          {...field}
                          label='Currently working'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'currently_working']}
                          fieldKey={[field.fieldKey, 'currently_working']}
                          valuePropName='checked'
                        >
                          <Checkbox
                            style={{ lineHeight: '32px' }}
                            onChange={(e) => onChangeCurrentlyWorking(e.target.checked, field.key)}
                          />
                        </Form.Item>
                      </Col>
                      {(!form.getFieldsValue().past_employment_details ||
                        !form.getFieldsValue().past_employment_details[index] ||
                        form.getFieldsValue().past_employment_details[index]?.currently_working === false) && (
                        <Col xs={24} lg={12}>
                          <Form.Item
                            {...field}
                            label='Employed from - Employed to'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'experience_from_to']}
                            fieldKey={[field.fieldKey, 'experience_from_to']}
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
                      )}
                      {form.getFieldsValue().past_employment_details &&
                        form.getFieldsValue().past_employment_details[index]?.currently_working === true && (
                          <>
                            <Col xs={24} lg={12}>
                              <Form.Item
                                {...field}
                                label='Employed From'
                                labelCol={{ span: 24 }}
                                name={[field.name, 'employed_from']}
                                fieldKey={[field.fieldKey, 'employed_from']}
                                rules={[{ required: !isNoExperienceYet, message: 'Please select date' }]}
                              >
                                <DatePicker
                                  format='DD-MM-YYYY'
                                  disabledDate={(d) => !d || d.isAfter(moment())}
                                  getPopupContainer={(trigger) => trigger.parentNode}
                                />
                              </Form.Item>
                            </Col>
                          </>
                        )}
                      <Col xs={24} lg={12}>
                        <Form.Item
                          {...field}
                          label='Employment Type'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'employment_type']}
                          fieldKey={[field.fieldKey, 'employment_type']}
                          rules={[
                            {
                              required: !isNoExperienceYet,
                              message: 'Please select employment type',
                            },
                          ]}
                        >
                          <Select
                            placeholder='Select Employment Type'
                            getPopupContainer={(trigger) => trigger.parentNode}
                          >
                            <Option value='permanent'>Permanent</Option>
                            <Option value='temporary'>Temporary</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          {...field}
                          label='Salary'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'salary']}
                          fieldKey={[field.fieldKey, 'salary']}
                          rules={[
                            {
                              required: !isNoExperienceYet,
                              message: "Salary can't be empty",
                            },
                            {
                              pattern: new RegExp(/^[0-9\b]+$/),
                              message: 'Salary must be numeric',
                            },
                          ]}
                        >
                          <Input type='tel' maxLength={8} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Form.Item
                          {...field}
                          label='Grade'
                          labelCol={{ span: 24 }}
                          name={[field.name, 'grade']}
                          fieldKey={[field.fieldKey, 'grade']}
                          rules={[
                            {
                              required: !isNoExperienceYet,
                              message: "Grade to can't be empty",
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={[16, 0]} justify='end' style={{ marginBottom: '5px' }}>
                      <Col>
                        <Popconfirm
                          title='Are you sure to delete this detail?'
                          onConfirm={() => {
                            onDeleteEmploymentDetails(index);
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
                  <Button
                    disabled={isNoExperienceYet}
                    type='dashed'
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Past Employment Details
                  </Button>
                </Form.Item>
                {fields.length > 0 && (
                  <Row justify='space-between'>
                    <Button htmlType='button' onClick={() => form.resetFields()}>
                      Reset
                    </Button>
                    <Popconfirm
                      title='Do you need to save the data?'
                      okText='Yes'
                      cancelText='No'
                      onConfirm={() => form.submit()}
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
        </Row>
      </Form>
    </FormStyles>
  );
};

Experience.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default Experience;
