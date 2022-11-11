import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// Components
import { Col, Input, Form, Select } from 'antd';
import { useAuthState } from '../../../src/components/auth/hook';
import { getEducations, getStream } from '../../../src/apiCalls';
import useUser from '../../../src/components/auth/useUser';

const EducationFilter = ({ fieldKey, name, form, key, ...restField }) => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const { Option, OptGroup } = Select;

  const [statusHide, setStatusHide] = useState(false);
  const [educationsList, setEducations] = useState([]);
  const [streamList, setStreams] = useState([]);
  const [streamValue, setStreamValue] = useState(null);

  useEffect(() => {
    const getEducationList = async () => {
      const response = await getEducations(client);
      const educations = response.map((data) => ({
        education_id: data.education_id,
        education_degree: data.education_degree,
      }));

      setEducations(educations);

      const currentPhdStatus = form.getFieldsValue().education_details[name].education_degree;
      if (currentPhdStatus) {
        const currentPhdName = educations.filter((education) => education.education_id === currentPhdStatus);

        setStatusHide(currentPhdName[0].education_degree === 'PHD');
      }
    };

    const getStreamList = async () => {
      const response = await getStream(client);

      setStreams(
        response.map((list) => ({
          stream_id: list.stream_id,
          stream_name: list.stream_name,
          education_degree: list.education_degree,
        }))
      );
    };

    if (user && user.isLoggedIn) {
      getEducationList();
      getStreamList();
    }
  }, [user]);

  const handleFilterCategoryChange = async (value, key) => {
    const responseStream = await client.get(`/user/public/education_stream_list/?exam_name=${value}`);
    const stream = responseStream.data.map((list) => ({
      stream_id: list.stream_id,
      stream_name: list.stream_name,
      education_degree: list.education_degree,
    }));

    setStreams(stream);
    setStreamValue(stream[0]?.stream_id);

    const fields = form.getFieldsValue();
    const { education_details } = fields;
    education_details[name].stream_name = stream[0]?.stream_id;
    form.setFieldsValue({ education_details });

    if (key.key === 'PHD') {
      setStatusHide(true);
    } else {
      setStatusHide(false);
    }
  };

  const onStreamChange = (value) => {
    setStreamValue(value);
  };

  return (
    <>
      <Col xs={24} lg={12}>
        <Form.Item
          {...restField}
          label='Degree Name'
          labelCol={{ span: 24 }}
          name={[name, 'education_degree']}
          fieldKey={[fieldKey, 'education_degree']}
          rules={[
            {
              required: true,
              message: 'Degree name must be selected',
            },
          ]}
        >
          <Select
            placeholder='Select Degree'
            getPopupContainer={(trigger) => trigger.parentNode}
            onChange={handleFilterCategoryChange}
          >
            <OptGroup label='Degree'>
              {educationsList.map((education) => (
                <Option value={education.education_id} key={education.education_degree}>
                  {education.education_degree}
                </Option>
              ))}
            </OptGroup>
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} lg={12}>
        <Form.Item
          {...restField}
          label='Specialization Name'
          labelCol={{ span: 24 }}
          name={[name, 'stream_name']}
          fieldKey={[fieldKey, 'stream_name']}
          rules={[
            {
              required: true,
              message: 'Specialization name must be selected',
            },
          ]}
          getValueFromEvent={(e) => {
            return e;
          }}
        >
          <Select
            {...restField}
            placeholder='Select Specialization'
            getPopupContainer={(trigger) => trigger.parentNode}
            value={streamValue}
            onChange={onStreamChange}
          >
            {streamList.map((data, index) => (
              <Option value={data.stream_id} name={data.stream_name} key={index}>
                {data.stream_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} lg={12}>
        <Form.Item
          {...restField}
          label='University'
          labelCol={{ span: 24 }}
          name={[name, 'university']}
          fieldKey={[fieldKey, 'university']}
          rules={[
            {
              required: true,
              message: "University can't be empty",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col xs={24} lg={12}>
        <Form.Item
          {...restField}
          label='Institute Name'
          labelCol={{ span: 24 }}
          name={[name, 'college_name']}
          fieldKey={[fieldKey, 'college_name']}
          rules={[
            {
              required: true,
              message: "Institute name can't be empty",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col xs={12} lg={6}>
        <Form.Item
          {...restField}
          label='Passing Year'
          labelCol={{ span: 24 }}
          name={[name, 'passing_year']}
          fieldKey={[fieldKey, 'passing_year']}
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
      <Col xs={12} lg={6}>
        <Form.Item
          {...restField}
          label='Score'
          labelCol={{ span: 24 }}
          name={[name, 'score']}
          fieldKey={[fieldKey, 'score']}
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
      {statusHide && (
        <Col xs={24} lg={12}>
          <Form.Item
            {...restField}
            label='Status'
            labelCol={{ span: 24 }}
            name={[name, 'status']}
            fieldKey={[fieldKey, 'status']}
          >
            <Select
              placeholder='Select Status'
              // onChange={(e) => onChange(e, field.key)}
              getPopupContainer={(trigger) => trigger.parentNode}
            >
              <Option value='awarded'>AWARDED</Option>
              <Option value='pursuing'>PURSUING</Option>
              <Option value='submitted'>SUBMITTED</Option>
            </Select>
          </Form.Item>
        </Col>
      )}
    </>
  );
};

EducationFilter.propTypes = {
  name: PropTypes.number.isRequired,
  form: PropTypes.object.isRequired,
  fieldKey: PropTypes.number.isRequired,
};

export default EducationFilter;
