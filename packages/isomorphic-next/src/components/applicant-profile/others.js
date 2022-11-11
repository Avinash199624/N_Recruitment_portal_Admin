import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Router from 'next/router';
import PageHeader from '@iso/components/utility/pageHeader';
import { Row, Col, Form, Input, Button, Divider, Select, DatePicker, notification, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';
import moment from 'moment';

const { RangePicker } = DatePicker;
const Others = ({ onNext, onPrevious }) => {
  const router = useRouter();
  const [formRelations] = Form.useForm();
  const [formLanguages] = Form.useForm();
  const [formReferences] = Form.useForm();
  const [formOverseasVisits] = Form.useForm();
  const [formOtherInfo] = Form.useForm();

  const { Option } = Select;
  const { client } = useAuthState();
  const { user } = useUser({});
  const [showConfirm, setShowConfirm] = useState(false);

  const [initialRelations, setInitialRelations] = useState();
  const [initialLanguages, setInitialLanguages] = useState();
  const [initialReferences, setInitialReferences] = useState();
  const [initialOverseasVisits, setInitialOverseasVisits] = useState();
  const [initialOtherInfo, setInitialOtherInfo] = useState();

  const [isRelationsSubmitted, setRelationsSubmitted] = useState();
  const [isLanguagesSubmitted, setLanguagesSubmitted] = useState();
  const [isOverseasSubmitted, setOverseasSubmitted] = useState();
  const [isOtherInfoSubmitted, setOtherInfoSubmitted] = useState();
  const [isReferencesSubmitted, setReferencesSubmitted] = useState();
  const [projectDate, setProjectDate] = useState([moment(), moment()]);
  const [dateStr, setDateString] = useState();
  const [country, setCountry] = useState([]);
  const [states, setStatelist] = useState([]);
  const [city, setCity] = useState([]);
  // const [countryID, setCountryID] = useState();

  useEffect(() => {
    const load = async () => {
      const responseRelations = await client.get(`/user/public/neeri_relations/${user.user_id}/`);
      const responseLanguages = await client.get(`/user/public/applicant_languages/${user.user_id}/`);
      const responseReferences = await client.get(`/user/public/applicant_references/${user.user_id}/`);
      const responseOverseasVisits = await client.get(`/user/public/overseas_visits/${user.user_id}/`);
      const responseOtherInfo = await client.get(`/user/public/other_info/${user.user_id}/`);
      const CountryResponse = await client.get(`/user/countries/`);
      //static state list show
      const Stateresponse = await client.get(`/user/state-country-wise/101/`);
      setStatelist(Stateresponse.data);
      setCountry(CountryResponse.data);

      setInitialRelations({
        ...(responseRelations.data.isEmpty && responseRelations.data.isEmpty === 'true'
          ? { relation_with_neeri_employee: [] }
          : {
              relation_with_neeri_employee: responseRelations.data,
            }),
      });

      setInitialLanguages({
        ...(responseLanguages.data.isEmpty && responseLanguages.data.isEmpty === 'true'
          ? { known_languages: [] }
          : {
              known_languages: responseLanguages.data,
            }),
      });

      setInitialReferences({
        ...(responseReferences.data.isEmpty && responseReferences.data.isEmpty === 'true'
          ? { reference: [{}, {}, {}] }
          : {
              reference: responseReferences.data.map((ref) => ({
                ...ref,
                address1: ref.address.address1,
                address2: ref.address.address2,
                address3: ref.address.address3,
                city: ref.address.city,
                state: ref.address.state,
                country: ref.address.country,
                postcode: ref.address.postcode,
                telephone_no: ref.address.telephone_no,
              })),
            }),
      });

      setInitialOverseasVisits({
        ...(responseOverseasVisits.data.isEmpty && responseOverseasVisits.data.isEmpty === 'true'
          ? { overseas_visits: [] }
          : {
              overseas_visits: responseOverseasVisits.data.map((data) => ({
                ...data,
                date_of_visit: moment(data.date_of_visit),
              })),
            }),
      });

      setInitialOtherInfo({
        ...{
          ...responseOtherInfo.data,
          bond_start_date:
            responseOtherInfo.data.bond_start_date && responseOtherInfo.data.bond_start_date !== null
              ? moment(responseOtherInfo.data.bond_start_date)
              : '',
          bond_end_date:
            responseOtherInfo.data.bond_end_date && responseOtherInfo.data.bond_end_date !== null
              ? moment(responseOtherInfo.data.bond_end_date)
              : '',
          project_date:
            responseOtherInfo.data.bond_start_date && responseOtherInfo.data.bond_end_date !== null
              ? [moment(responseOtherInfo.data.bond_start_date), moment(responseOtherInfo.data.bond_end_date)]
              : '',
        },
      });
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const dateChangeHandler = (date, dateString) => {
    setProjectDate(date);
    setDateString(dateString);
  };

  const onDeleteRelation = async (index) => {
    const { getFieldsValue } = formRelations;
    const data = getFieldsValue().relation_with_neeri_employee[index];
    if (data && data.id) {
      await client.delete(`/user/public/neeri_relation_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Others details deleted successfully`,
    });
  };

  const onDeleteLanguage = async (index) => {
    const { getFieldsValue } = formLanguages;
    const data = getFieldsValue().known_languages[index];
    if (data && data.id) {
      await client.delete(`/user/public/applicant_language_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Language details deleted successfully`,
    });
  };

  const onDeleteOverseas = async (index) => {
    const { getFieldsValue } = formOverseasVisits;
    const data = getFieldsValue().overseas_visits[index];
    if (data && data.id) {
      await client.delete(`/user/public/overseas_visit_delete/${user.user_id}/`, { data: { id: data.id } });
    }
    notification['success']({
      description: `Overseas details deleted successfully`,
    });
  };

  // const handleCountryChange = async (value, key) => {
  //   setCountryID(key.key);
  //   const Stateresponse = await client.get(`/user/state-country-wise/${key.key}/`);
  //   setStatelist(Stateresponse.data);
  // };

  const handleStateChange = async (value, key) => {
    const Stateresponse = await client.get(`/user/cities-data/${key.key}/${101}/`);
    setCity(Stateresponse.data);
  };

  const onNextSubmit = async () => {
    setShowConfirm(false);

    if (
      formRelations.isFieldsTouched() &&
      formRelations.getFieldsValue().relation_with_neeri_employee &&
      formRelations.getFieldsValue().relation_with_neeri_employee.length > 0
    ) {
      await formRelations
        .validateFields()
        .then(() => formRelations.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill relation details`,
          });
          throw x;
        });
    }

    if (
      formLanguages.isFieldsTouched() &&
      formLanguages.getFieldsValue().known_languages &&
      formLanguages.getFieldsValue().known_languages.length > 0
    ) {
      await formLanguages
        .validateFields()
        .then(() => formLanguages.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill language details`,
          });
          throw x;
        });
    }

    if (
      formOverseasVisits.isFieldsTouched() &&
      formOverseasVisits.getFieldsValue().overseas_visits &&
      formOverseasVisits.getFieldsValue().overseas_visits.length > 0
    ) {
      await formOverseasVisits
        .validateFields()
        .then(() => formOverseasVisits.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill overseas visit details`,
          });
          throw x;
        });
    }

    if (
      formReferences.isFieldsTouched() &&
      formReferences.getFieldsValue().reference &&
      formReferences.getFieldsValue().reference.length > 0
    ) {
      await formReferences
        .validateFields()
        .then(() => formReferences.submit())
        .catch((x) => {
          notification['error']({
            description: `Please fill reference details`,
          });
          throw x;
        });
    }

    // if (formOtherInfo.isFieldsTouched() && formOtherInfo.getFieldsValue()) {
    //   await formOtherInfo
    //     .validateFields()
    //     .then(() => formOtherInfo.submit())
    //     .catch((x) => {
    //       message.error('Please fill other details');
    //       throw x;
    //     });
    // }

    // if (
    //   !formRelations.getFieldsValue().relation_with_neeri_employee ||
    //   formRelations.getFieldsValue().relation_with_neeri_employee.length === 0
    // ) {
    //   message.error('Please add relationship details');
    //   return;
    // }

    // if (
    //   !formLanguages.getFieldsValue().known_languages ||
    //   formLanguages.getFieldsValue().known_languages.length === 0
    // ) {
    //   message.error('Please add language details');
    //   return;
    // }

    // if (
    //   !formOverseasVisits.getFieldsValue().overseas_visits ||
    //   formOverseasVisits.getFieldsValue().overseas_visits.length === 0
    // ) {
    //   message.error('Please add overseas visits details');
    //   return;
    // }

    onNext();
  };

  const onSubmitRelationsForm = async (values) => {
    if (formRelations.getFieldsValue().relation_with_neeri_employee.length === 0) {
      notification['error']({
        description: `Please add relationship`,
      });
      return;
    }
    if (!isRelationsSubmitted || formRelations.isFieldsTouched()) {
      if (initialRelations.relation_with_neeri_employee.length === 0) {
        await client.post(`/user/public/neeri_relation_create/${user.user_id}/`, values.relation_with_neeri_employee);
        notification['success']({
          description: `Relation added successfully`,
        });
      } else {
        const updateData = values.relation_with_neeri_employee.filter((dt) => !!dt.id);
        const createData = values.relation_with_neeri_employee.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(`/user/public/neeri_relation_update/${user.user_id}/`, updateData);
        }
        if (createData.length > 0) {
          await client.post(`/user/public/neeri_relation_create/${user.user_id}/`, createData);
        }
        notification['success']({
          description: `Relation updated successfully`,
        });
      }
      setRelationsSubmitted(true);

      const responseRelations = await client.get(`/user/public/neeri_relations/${user.user_id}/`);
      await formRelations.setFieldsValue({ relation_with_neeri_employee: responseRelations.data });
      setInitialRelations({
        ...(responseRelations.data.isEmpty && responseRelations.data.isEmpty === 'true'
          ? { relation_with_neeri_employee: [] }
          : {
              relation_with_neeri_employee: responseRelations.data,
            }),
      });
    }
  };

  const onSubmitOverseasVisitsForm = async (values) => {
    if (formOverseasVisits.getFieldsValue().overseas_visits.length === 0) {
      notification['error']({
        description: `Please add overseas visit`,
      });
      return;
    }
    if (!isOverseasSubmitted || formOverseasVisits.isFieldsTouched()) {
      if (initialOverseasVisits.overseas_visits.length === 0) {
        await client.post(
          `/user/public/overseas_visit_create/${user.user_id}/`,
          values.overseas_visits.map((visit) => ({
            country_visited: visit.country_visited,
            duration_of_visit: visit.duration_of_visit,
            purpose_of_visit: visit.purpose_of_visit,
            date_of_visit: moment(visit.date_of_visit).format('YYYY-MM-DD'),
          }))
        );
        notification['success']({
          description: `Overseas visit added successfully`,
        });
      } else {
        const updateData = values.overseas_visits.filter((dt) => !!dt.id);
        const createData = values.overseas_visits.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(
            `/user/public/overseas_visit_update/${user.user_id}/`,
            updateData.map((visit) => ({
              id: visit.id,
              country_visited: visit.country_visited,
              duration_of_visit: visit.duration_of_visit,
              purpose_of_visit: visit.purpose_of_visit,
              date_of_visit: moment(visit.date_of_visit).format('YYYY-MM-DD'),
            }))
          );
        }
        if (createData.length > 0) {
          await client.post(
            `/user/public/overseas_visit_create/${user.user_id}/`,
            createData.map((visit) => ({
              country_visited: visit.country_visited,
              duration_of_visit: visit.duration_of_visit,
              purpose_of_visit: visit.purpose_of_visit,
              date_of_visit: moment(visit.date_of_visit).format('YYYY-MM-DD'),
            }))
          );
        }
        notification['success']({
          description: `Overseas visit updated successfully`,
        });
      }
      setOverseasSubmitted(true);

      const responseOverseasVisits = await client.get(`/user/public/overseas_visits/${user.user_id}/`);
      await formOverseasVisits.setFieldsValue({
        overseas_visits: responseOverseasVisits.data.map((data) => ({
          ...data,
          date_of_visit: moment(data.date_of_visit),
        })),
      });
      setInitialOverseasVisits({
        ...(responseOverseasVisits.data.isEmpty && responseOverseasVisits.data.isEmpty === 'true'
          ? { overseas_visits: [] }
          : {
              overseas_visits: responseOverseasVisits.data.map((data) => ({
                ...data,
                date_of_visit: moment(data.date_of_visit),
              })),
            }),
      });
    }
  };

  const onSubmitLanguagesForm = async (values) => {
    if (formLanguages.getFieldsValue().known_languages.length === 0) {
      notification['error']({
        description: `Please add known languages`,
      });
      return;
    }
    //if (!isLanguagesSubmitted) {
    if (!isLanguagesSubmitted || formLanguages.isFieldsTouched()) {
      if (initialLanguages.known_languages.length === 0) {
        await client.post(`/user/public/applicant_language_create/${user.user_id}/`, values.known_languages);
        notification['success']({
          description: `Languages added successfully`,
        });
      } else {
        const updateData = values.known_languages.filter((dt) => !!dt.id);
        const createData = values.known_languages.filter((dt) => !dt.id);
        if (updateData.length > 0) {
          await client.put(`/user/public/applicant_language_update/${user.user_id}/`, updateData);
        }
        if (createData.length > 0) {
          await client.post(`/user/public/applicant_language_create/${user.user_id}/`, createData);
        }
        notification['success']({
          description: `Languages updated successfully`,
        });
      }
      setLanguagesSubmitted(true);

      // const response = await client.get(`/user/public/applicant_languages/${user.user_id}/`);
      // const fields = formLanguages.getFieldsValue();
      // const { known_languages } = fields;

      // await formLanguages.setFieldsValue({ known_languages: response.data });
    }

    const responseLanguages = await client.get(`/user/public/applicant_languages/${user.user_id}/`);
    await formLanguages.setFieldsValue({ known_languages: responseLanguages.data });
    setInitialLanguages({
      ...(responseLanguages.data.isEmpty && responseLanguages.data.isEmpty === 'true'
        ? { known_languages: [] }
        : {
            known_languages: responseLanguages.data,
          }),
    });
  };
  //};

  const onSubmitOtherInfoForm = async (values) => {
    if (!isOtherInfoSubmitted || formOtherInfo.isFieldsTouched()) {
      if (initialOtherInfo.bond_title !== null && !values.id) {
        try {
          await client.post(`/user/public/other_info_create/${user.user_id}/`, {
            bond_title: values.bond_title,
            bond_details: values.bond_details,
            organisation_name: values.organisation_name,
            bond_start_date: moment(values['project_date'][0]).format('YYYY-MM-DD'),
            bond_end_date: moment(values['project_date'][1]).format('YYYY-MM-DD'),
            notice_period_min: values.notice_period_min,
            notice_period_max: values.notice_period_max,
          });
          notification['success']({
            description: `Other info added successfully`,
          });
        } catch (error) {
          setShowConfirm(false);
          notification['error']({
            description: `Error`,
          });
        }
      } else {
        try {
          await client.put(`/user/public/other_info_update/${user.user_id}/`, {
            id: values.id,
            bond_title: values.bond_title,
            bond_details: values.bond_details,
            organisation_name: values.organisation_name,
            bond_start_date: moment(values['project_date'][0]).format('YYYY-MM-DD'),
            bond_end_date: moment(values['project_date'][1]).format('YYYY-MM-DD'),
            notice_period_min: values.notice_period_min,
            notice_period_max: values.notice_period_max,
          });
          notification['success']({
            description: `Other info updated successfully`,
          });
        } catch (error) {
          notification['error']({
            description: `Error`,
          });
          setShowConfirm(false);
        }
      }
      setOtherInfoSubmitted(true);
    }
  };

  const onSubmitReferencesForm = async (values) => {
    if (!isReferencesSubmitted || formReferences.isFieldsTouched()) {
      if (initialReferences.reference) {
        if (initialReferences.reference.length === 0) {
          const response = await client.post(
            `/user/public/applicant_reference_create/${user.user_id}/`,
            values.reference.map((ref) => ({
              reference_name: ref.reference_name,
              position: ref.position,
              address: {
                address1: ref.address1,
                address2: ref.address2,
                address3: ref.address3,
                city: ref.city,
                state: ref.state,
                country: 'India',
                postcode: ref.postcode,
                telephone_no: ref.telephone_no,
              },
            }))
          );
          if (response.status === 200) {
            notification['success']({
              description: `Reference created successfully`,
            });
          }
        } else {
          const updateData = values.reference.filter((dt) => !!dt.id);
          const createData = values.reference.filter((dt) => !dt.id);
          if (updateData.length > 0) {
            const response = await client.put(
              `/user/public/applicant_reference_update/${user.user_id}/`,
              updateData.map((ref) => ({
                id: ref.id,
                reference_name: ref.reference_name,
                position: ref.position,
                address: {
                  address1: ref.address1,
                  address2: ref.address2,
                  address3: ref.address3,
                  city: ref.city,
                  state: ref.state,
                  country: 'India',
                  postcode: ref.postcode,
                  telephone_no: ref.telephone_no,
                },
              }))
            );
            if (response.status === 200) {
              notification['success']({
                description: `Relation updated successfully`,
              });
            }
          }
          if (createData.length > 0) {
            const response = await client.post(
              `/user/public/applicant_reference_create/${user.user_id}/`,
              createData.map((ref) => ({
                reference_name: ref.reference_name,
                position: ref.position,
                address: {
                  address1: ref.address1,
                  address2: ref.address2,
                  address3: ref.address3,
                  city: ref.city,
                  state: ref.state,
                  country: 'India',
                  postcode: ref.postcode,
                  telephone_no: ref.telephone_no,
                },
              }))
            );
            if (response.status === 200) {
              notification['success']({
                description: `Reference updated successfully`,
              });
            }
          }
        }
      }
      setReferencesSubmitted(true);
    }
  };

  const onBackToPreview = () => {
    Router.push(
      `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
    );
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialRelations || !initialLanguages || !initialReferences || !initialOverseasVisits || !initialOtherInfo) {
    return null;
  }

  return (
    <FormStyles>
      <>
        <Box>
          <Form
            form={formReferences}
            name='formReferences'
            onFinish={onSubmitReferencesForm}
            initialValues={{ ...initialReferences }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={16}>
                <PageHeader>Reference Details</PageHeader>
              </Col>
            </Row>
            <Form.List name='reference'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box>
                      <Row gutter={[16, 0]}>
                        <Col span={24}>
                          <Divider orientation='left' style={{ textTransform: 'capitalize', marginTop: 0 }}>
                            Reference Details {index + 1}
                          </Divider>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'reference_name']}
                            fieldKey={[field.fieldKey, 'reference_name']}
                            label='Reference Name'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: "Reference name can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'position']}
                            fieldKey={[field.fieldKey, 'position']}
                            label='Position'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: "Position can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'telephone_no']}
                            fieldKey={[field.fieldKey, 'telephone_no']}
                            label='Phone Number'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: "Telephone no. can't be empty",
                              },
                              {
                                pattern: new RegExp(/^[0-9\b]+$/),
                                message: 'Telephone no. must be numeric',
                              },
                            ]}
                          >
                            <Input type='tel' maxLength={13} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'address1']}
                            fieldKey={[field.fieldKey, 'address1']}
                            label='Address 1'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter Address 1',
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'address2']}
                            fieldKey={[field.fieldKey, 'address2']}
                            label='Address 2'
                            labelCol={{ span: 24 }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'address3']}
                            fieldKey={[field.fieldKey, 'address3']}
                            label='Address 3'
                            labelCol={{ span: 24 }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'country']}
                            fieldKey={[field.fieldKey, 'country']}
                            label='Country'
                            labelCol={{ span: 24 }}
                          >
                            <Select
                              placeholder='Select Country'
                              //onChange={handleCountryChange}
                              showSearch
                              optionFilterProp='children'
                              getPopupContainer={(trigger) => trigger.parentNode}
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              defaultValue='India'
                              disabled
                            >
                              {country.map((list, index) => (
                                <Option value={list.country_name} key={list.id}>
                                  {list.country_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'state']}
                            fieldKey={[field.fieldKey, 'state']}
                            label='State'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please setect state',
                              },
                            ]}
                          >
                            <Select
                              placeholder='Select State'
                              onChange={handleStateChange}
                              showSearch
                              getPopupContainer={(trigger) => trigger.parentNode}
                            >
                              {states.map((list, index) => (
                                <Option value={list.state_name} key={list.id}>
                                  {list.state_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'city']}
                            fieldKey={[field.fieldKey, 'city']}
                            label='City'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter city',
                              },
                            ]}
                          >
                            <Select
                              placeholder='Select City'
                              getPopupContainer={(trigger) => trigger.parentNode}
                              showSearch
                            >
                              {city.map((list, index) => (
                                <Option value={list.city_name} key={list.id}>
                                  {list.city_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'postcode']}
                            fieldKey={[field.fieldKey, 'postcode']}
                            label='Post Code'
                            labelCol={{ span: 24 }}
                            rules={[
                              {
                                required: true,
                                message: 'Please enter post code',
                              },
                              {
                                pattern: new RegExp(/^[0-9\b]+$/),
                                message: 'Pincode must be numeric',
                              },
                            ]}
                          >
                            <Input maxLength={6} type='tel' />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Box>
                  ))}
                </>
              )}
            </Form.List>
            <Row justify='space-between'>
              <Button htmlType='button' onClick={() => formReferences.resetFields()}>
                Reset
              </Button>
              <Popconfirm
                title='Do you need to save the data?'
                okText='Yes'
                cancelText='No'
                onConfirm={() => formReferences.submit()}
                onCancel={() => {}}
                getPopupContainer={(trigger) => trigger.parentNode}
                placement='topRight'
              >
                <Button type='primary' htmlType='submit'>
                  Save
                </Button>
              </Popconfirm>
            </Row>
          </Form>
        </Box>
        <Box>
          <Form
            form={formOtherInfo}
            name='formOtherInfo'
            onFinish={onSubmitOtherInfoForm}
            initialValues={{ ...initialOtherInfo }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={16}>
                <PageHeader>Other Details</PageHeader>
              </Col>
            </Row>
            <Form.Item name='id' style={{ height: 0, marginBottom: 0 }}>
              <Input type='hidden' />
            </Form.Item>
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={8}>
                <Form.Item
                  name='bond_title'
                  label='Bond Name'
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Bond title can't be empty",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={16}>
                <Form.Item
                  name='bond_details'
                  label='Bond Details'
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Bond details can't be empty",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name='organisation_name'
                  label='Organisation Name'
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Organisation Name can't be empty",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name='project_date'
                  label='Bond Start Date - Bond End Date'
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
                    getPopupContainer={(trigger) => trigger.parentNode}
                    value={projectDate}
                    onChange={dateChangeHandler}
                    separator='-'
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name='notice_period_min'
                  label='Min Notice Period (Day)'
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Min Notice Period can't be empty",
                    },
                    {
                      pattern: new RegExp(/^[0-9\b]+$/),
                      message: 'Min Notice must be numeric',
                    },
                  ]}
                >
                  <Input type='tel' maxLength={3} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name='notice_period_max'
                  label='Max Notice Period'
                  labelCol={{ span: 24 }}
                  rules={[
                    {
                      required: true,
                      message: "Max Notice Period can't be empty",
                    },
                    {
                      pattern: new RegExp(/^[0-9\b]+$/),
                      message: 'Max Notice must be numeric',
                    },
                  ]}
                >
                  <Input type='tel' maxLength={3} />
                </Form.Item>
              </Col>
            </Row>
            <Row justify='space-between'>
              <Button htmlType='button' onClick={() => formOtherInfo.resetFields()}>
                Reset
              </Button>
              <Popconfirm
                title='Do you need to save the data?'
                okText='Yes'
                cancelText='No'
                onConfirm={() => formOtherInfo.submit()}
                onCancel={() => {}}
                getPopupContainer={(trigger) => trigger.parentNode}
                placement='topRight'
              >
                <Button type='primary' htmlType='submit'>
                  Save
                </Button>
              </Popconfirm>
            </Row>
          </Form>
        </Box>
        <Box>
          <Form
            form={formLanguages}
            name='formLanguages'
            onFinish={onSubmitLanguagesForm}
            initialValues={{ ...initialLanguages }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={16}>
                <PageHeader>Known Languages</PageHeader>
              </Col>
            </Row>
            <Form.List name='known_languages'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Language Name'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'name']}
                            fieldKey={[field.fieldKey, 'name']}
                            rules={[{ required: true, message: "Name can't be empty" }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={4}>
                          <Form.Item
                            {...field}
                            label='Read Level'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'read_level']}
                            fieldKey={[field.fieldKey, 'read_level']}
                            rules={[
                              {
                                required: true,
                                message: "Read level can't be empty",
                              },
                            ]}
                          >
                            <Select placeholder='Select Level' getPopupContainer={(trigger) => trigger.parentNode}>
                              <Option value='beginner'>Beginner</Option>
                              <Option value='intermediate'>Intermediate</Option>
                              <Option value='expert'>Expert</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={4}>
                          <Form.Item
                            {...field}
                            label='Write Level'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'write_level']}
                            fieldKey={[field.fieldKey, 'write_level']}
                            rules={[
                              {
                                required: true,
                                message: "Write level can't be empty",
                              },
                            ]}
                          >
                            <Select placeholder='Select Level' getPopupContainer={(trigger) => trigger.parentNode}>
                              <Option value='beginner'>Beginner</Option>
                              <Option value='intermediate'>Intermediate</Option>
                              <Option value='expert'>Expert</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={4}>
                          <Form.Item
                            {...field}
                            label='Speak Level'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'speak_level']}
                            fieldKey={[field.fieldKey, 'speak_level']}
                            rules={[
                              {
                                required: true,
                                message: "Speak level can't be empty",
                              },
                            ]}
                          >
                            <Select placeholder='Select Level' getPopupContainer={(trigger) => trigger.parentNode}>
                              <Option value='beginner'>Beginner</Option>
                              <Option value='intermediate'>Intermediate</Option>
                              <Option value='expert'>Expert</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Exam Passed'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'exam_passed']}
                            fieldKey={[field.fieldKey, 'exam_passed']}
                            rules={[
                              {
                                required: true,
                                message: "Exam passed can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={[16, 0]} justify='end'>
                        <Col style={{ height: 0 }}>
                          <Form.Item {...field} name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']}>
                            <Input type='hidden' />
                          </Form.Item>
                        </Col>
                        <Col>
                          <Popconfirm
                            title='Are you sure to delete this detail?'
                            onConfirm={() => {
                              onDeleteLanguage(index);
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
                      type='dashed'
                      onClick={() => {
                        add();
                        setLanguagesSubmitted(false);
                      }}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Known Languages
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formLanguages.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formLanguages.submit()}
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
            form={formRelations}
            name='formRelations'
            onFinish={onSubmitRelationsForm}
            initialValues={{ ...initialRelations }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={16}>
                <PageHeader>Relation with Neeri Employee</PageHeader>
              </Col>
            </Row>
            <Form.List name='relation_with_neeri_employee'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Name of the relation'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'relation_name']}
                            fieldKey={[field.fieldKey, 'relation_name']}
                            rules={[
                              {
                                required: true,
                                message: "Relation name can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Designation'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'designation']}
                            fieldKey={[field.fieldKey, 'designation']}
                            rules={[
                              {
                                required: true,
                                message: "Designation can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Work Loc. Centre Name'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'center_name']}
                            fieldKey={[field.fieldKey, 'center_name']}
                            rules={[
                              {
                                required: true,
                                message: "Center name can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Relationship'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'relation']}
                            fieldKey={[field.fieldKey, 'relation']}
                            rules={[
                              {
                                required: true,
                                message: "Relation to can't be empty",
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
                              onDeleteRelation(index);
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
                      Add Relation with Neeri Employee
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formRelations.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formRelations.submit()}
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
            form={formOverseasVisits}
            name='formOverseasVisits'
            onFinish={onSubmitOverseasVisitsForm}
            initialValues={{ ...initialOverseasVisits }}
            scrollToFirstError
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} lg={16}>
                <PageHeader>Overseas Visits</PageHeader>
              </Col>
            </Row>
            <Form.List name='overseas_visits'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Box>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Country Visited'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'country_visited']}
                            fieldKey={[field.fieldKey, 'country_visited']}
                            rules={[
                              {
                                required: true,
                                message: "Country visited can't be empty",
                              },
                            ]}
                          >
                            <Select
                              placeholder='Select Country'
                              getPopupContainer={(trigger) => trigger.parentNode}
                              showSearch
                            >
                              {country.map((list, index) => (
                                <Option value={list.country_name} key={list.id}>
                                  {list.country_name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Visit Date'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'date_of_visit']}
                            fieldKey={[field.fieldKey, 'date_of_visit']}
                            rules={[
                              {
                                required: true,
                                message: "Designation can't be empty",
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

                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Duration'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'duration_of_visit']}
                            fieldKey={[field.fieldKey, 'duration_of_visit']}
                            rules={[
                              {
                                required: true,
                                message: "Duration of visit can't be empty",
                              },
                            ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={6}>
                          <Form.Item
                            {...field}
                            label='Purpose'
                            labelCol={{ span: 24 }}
                            name={[field.name, 'purpose_of_visit']}
                            fieldKey={[field.fieldKey, 'purpose_of_visit']}
                            rules={[
                              {
                                required: true,
                                message: "Purpose of visit to can't be empty",
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
                              onDeleteOverseas(index);
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
                      Add Overseas Visits
                    </Button>
                  </Form.Item>
                  {fields.length > 0 && (
                    <Row justify='space-between'>
                      <Button htmlType='button' onClick={() => formOverseasVisits.resetFields()}>
                        Reset
                      </Button>
                      <Popconfirm
                        title='Do you need to save the data?'
                        okText='Yes'
                        cancelText='No'
                        onConfirm={() => formOverseasVisits.submit()}
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

        <Row justify='space-between'>
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
      </>
    </FormStyles>
  );
};

Others.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default Others;
