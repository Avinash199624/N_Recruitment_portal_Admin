import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Components
import { Col, Input, Form, Select } from 'antd';
import { STATIC_APPLICANT_FILTERS } from '../../../static/constants/applicantFilters';
import { useAuthState } from '../../../src/components/auth/hook';
import { getEducations, getEducationStreams, getRelaxation } from '../../../src/apiCalls';
import useUser from '../../../src/components/auth/useUser';

const ApplicantFilter = ({ fieldKey, name, form, key, ...restField }) => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const { Option, OptGroup } = Select;

  const [subCategoryDisabled, setSubCategoryDisabled] = useState(false);
  const [operatorsDisabled, setOperatorsDisabled] = useState(false);
  const [scoreDisabled, setScoreDisabled] = useState(false);
  const [educationsList, setEducations] = useState([]);
  const [relaxationList, setRelaxation] = useState([]);
  const [streamList, setStreams] = useState([]);
  const [streamValue, setStreamValue] = useState(null);

  useEffect(() => {
    const getEducationList = async () => {
      const response = await getEducations(client);

      setEducations(response);
    };

    if (user && user.isLoggedIn) {
      getEducationList();
    }
  }, [user]);

  const handleFilterCategoryChange = async (value) => {
    if (value === STATIC_APPLICANT_FILTERS[0].id) {
      // selected category = Age
      setRelaxation([]);
      setStreams([]);
      setSubCategoryDisabled(true);
      setOperatorsDisabled(false);
      setScoreDisabled(false);
    } else if (value === STATIC_APPLICANT_FILTERS[1].id) {
      setStreams([]);
      setRelaxation([]);
      // selected category = Relaxation
      setSubCategoryDisabled(false);
      setOperatorsDisabled(true);
      setScoreDisabled(true);

      const response = await getRelaxation(client);
      setRelaxation(response);
      setStreamValue(response[0].relaxation_cat_id);

      const field = form.getFieldsValue();
      const { fields } = field;
      fields[name].sub_category = response[0].relaxation_cat_id;
      form.setFieldsValue({ fields });
    } else {
      setSubCategoryDisabled(false);
      setOperatorsDisabled(false);
      setScoreDisabled(false);
      setRelaxation([]);

      const response = await getEducationStreams(client, value);
      setStreams(response);
      setStreamValue(response[0].stream_id);

      const field = form.getFieldsValue();
      const { fields } = field;
      fields[name].sub_category = response[0].stream_id;
      form.setFieldsValue({ fields });
    }
  };

  const onStreamChange = (value) => {
    setStreamValue(value);
  };

  return (
    <>
      <Col lg={7} md={12} xs={24}>
        <Form.Item
          {...restField}
          name={[name, 'category']}
          fieldKey={[fieldKey, 'category']}
          label='Select Category'
          labelCol={{ span: 24 }}
          rules={[{ required: true, message: 'Please select category' }]}
        >
          <Select
            placeholder='Category'
            getPopupContainer={(trigger) => trigger.parentNode}
            onChange={handleFilterCategoryChange}
          >
            <OptGroup label='Education'>
              {educationsList.map((education) => (
                <Option value={education.education_id} key={education.education_id}>
                  {education.education_degree}
                </Option>
              ))}
            </OptGroup>
            {STATIC_APPLICANT_FILTERS.map((relaxation) => (
              <Option value={relaxation.id} key={relaxation.id}>
                {relaxation.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col lg={7} md={12} xs={24}>
        <Form.Item
          {...restField}
          name={[name, 'sub_category']}
          fieldKey={[fieldKey, 'sub_category']}
          label='Select Sub Category'
          labelCol={{ span: 24 }}
          rules={[{ required: !subCategoryDisabled, message: 'Please select sub category' }]}
        >
          <Select
            placeholder='Select sub category'
            getPopupContainer={(trigger) => trigger.parentNode}
            disabled={subCategoryDisabled}
            value={streamValue}
            onChange={onStreamChange}
          >
            {relaxationList &&
              relaxationList.map((relaxation) => (
                <OptGroup
                  label={relaxation.relaxation.relaxation_category}
                  key={relaxation.relaxation.relaxation_cat_id}
                >
                  <Option value={relaxation.relaxation_rule_id}>Age: {relaxation.age_relaxation || 0} Years</Option>
                </OptGroup>
              ))}
            {streamList &&
              streamList.map((stream) => (
                <Option value={stream.stream_id} key={stream.stream_id}>
                  {stream.stream_name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Col>
      <Col lg={4} md={12} xs={24}>
        <Form.Item
          {...restField}
          name={[name, 'operator']}
          fieldKey={[fieldKey, 'operator']}
          label='Select Operator'
          labelCol={{ span: 24 }}
          rules={[{ required: !operatorsDisabled, message: 'Please select operator' }]}
        >
          <Select
            placeholder='Select Operator'
            getPopupContainer={(trigger) => trigger.parentNode}
            disabled={operatorsDisabled}
          >
            <Option value='>='>{'>'}=</Option>
            <Option value='>'>{'>'}</Option>
            <Option value='<='>{`<=`}</Option>
            <Option value='<'>{`<`}</Option>
            <Option value='='>{`=`}</Option>
            <Option value='!='>{`!=`}</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col lg={4} md={12} xs={24}>
        <Form.Item
          {...restField}
          name={[name, 'value']}
          fieldKey={[fieldKey, 'value']}
          label='Enter Value'
          labelCol={{ span: 24 }}
          rules={[{ required: !scoreDisabled, message: 'Please enter value' }]}
        >
          <Input placeholder='Enter value' disabled={scoreDisabled} />
        </Form.Item>
      </Col>
    </>
  );
};

ApplicantFilter.propTypes = {
  name: PropTypes.string.isRequired,
  form: PropTypes.string.isRequired,
  fieldKey: PropTypes.number.isRequired,
};

export default ApplicantFilter;
