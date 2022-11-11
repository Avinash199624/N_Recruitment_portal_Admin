import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Form, Button, Space, Table, Descriptions, Image } from 'antd';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';

const Preview = ({ onPrevious }) => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialData, setInitialData] = useState();

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/profile_details/${user.user_id}/`);
      setInitialData(response.data);
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  if (!initialData) return null;

  return (
    <FormStyles>
      <Box>
        <Descriptions title='Personal Info' bordered style={{ marginBottom: 20, color: '#1890ff' }}>
          <Descriptions.Item label='Name Of Applicant' span={2}>
            {initialData.name_of_applicant}
          </Descriptions.Item>
          <Descriptions.Item label='Profile' style={{ textAlign: 'center' }}>
            <Image
              width={100}
              height={100}
              src={
                initialData.profile_photo
                  ? initialData.profile_photo
                  : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Father's (Full Name)">{initialData.father_name}</Descriptions.Item>
          <Descriptions.Item label='Occupation' span={2}>
            {initialData.father_occupation}
          </Descriptions.Item>
          <Descriptions.Item label='Sex'>
            {initialData.gender === null
              ? ''
              : initialData.gender.charAt(0).toUpperCase() + initialData.gender.slice(1)}
          </Descriptions.Item>
          <Descriptions.Item label='Date of Birth'>{initialData.date_of_birth}</Descriptions.Item>
          <Descriptions.Item label='Birth Place'>{initialData.place_of_birth}</Descriptions.Item>
          <Descriptions.Item label='Are you a Citizen of India by Birth and /or By Domicile?'>
            {initialData.is_indian_citizen === true ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label='Whatsapp No.'>{initialData.whatsapp_id}</Descriptions.Item>
          <Descriptions.Item label='Religion'>{initialData.religion?.religion_name}</Descriptions.Item>
          <Descriptions.Item label='Caste/Community'>
            {initialData.caste === null ? '' : initialData.caste.toUpperCase()}
          </Descriptions.Item>
          <Descriptions.Item label='Passport Details'>{initialData.passport_number}</Descriptions.Item>
          <Descriptions.Item label='Fax Number'>{initialData.fax_number}</Descriptions.Item>
          <Descriptions.Item label='Mobile No.'>{initialData.mobile_no}</Descriptions.Item>
          <Descriptions.Item label='Skype Id' span={2}>
            {initialData.skype_id}
          </Descriptions.Item>
          <Descriptions.Item label='Residential Address' span={3}>
            {initialData.local_address?.address1}
            <br />
            {initialData.local_address?.address2}
            <br />
            {initialData.local_address?.address3}
            <br />
            {initialData.local_address?.city}
          </Descriptions.Item>
          <Descriptions.Item label='Permanent Address' span={3}>
            {initialData.local_address !== null && initialData.permanent_address === null ? 'same as above' : ''}
            {initialData.permanent_address?.address1} <br />
            {initialData.permanent_address?.address2} <br />
            {initialData.permanent_address?.address3} <br />
            {initialData.permanent_address?.city}
          </Descriptions.Item>
        </Descriptions>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Educational Details</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.education_details}>
            <Table.Column
              title='Exam Name'
              dataIndex='exam_name'
              key='exam_name'
              render={(text, record) => record.exam_name.education_degree}
            />
            <Table.Column title='College' dataIndex='college_name' key='college_name' />
            <Table.Column title='Passing Year' dataIndex='passing_year' key='passing_year' />
            <Table.Column title='Score' dataIndex='score' key='score' />
            <Table.Column title='University' dataIndex='university' key='university' />
            <Table.Column
              title='Specialization'
              dataIndex='specialization'
              key='specialization'
              render={(text, record) => record.specialization.stream_name}
            />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Professional Training</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.professional_trainings}>
            <Table.Column title='Title' dataIndex='title' key='title' />
            <Table.Column title='Description' dataIndex='description' key='description' />
            <Table.Column title='From Date' dataIndex='from_date' key='from_date' />
            <Table.Column title='To Date' dataIndex='to_date' key='to_date' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Fellowship Details</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.fellow_ships}>
            <Table.Column title='Entrance Exam Name' dataIndex='entrance_examination' key='entrance_examination' />
            <Table.Column title='Passing Year' dataIndex='passing_year' key='passing_year' />
            <Table.Column title='Score' dataIndex='score' key='score' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Published Paper</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.published_papers}>
            <Table.Column title='Paper Title' dataIndex='paper_title' key='paper_title' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Experience Details</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.experiences}>
            <Table.Column title='Name' dataIndex='employer_name' key='employer_name' />
            <Table.Column title='Type' dataIndex='employment_type' key='employment_type' />
            <Table.Column title='Employed From' dataIndex='employed_from' key='employed_from' />
            <Table.Column title='Employed To' dataIndex='employed_to' key='employed_to' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Existing Bond With Govt. Or Private organisation</div>
          </div>
          <Descriptions layout='vertical' bordered size='small'>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}>Bond Name </p>}>
              {initialData.other_info?.bond_title}
            </Descriptions.Item>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}>Organisation Name</p>}>
              {initialData.other_info?.organisation_name != null
                ? initialData.other_info?.organisation_name
                : 'No data added'}
            </Descriptions.Item>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}> Max Notice Period</p>}>
              {initialData.other_info?.notice_period_max}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Relation with Neeri Employee</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.neeri_relation}>
            <Table.Column title='Relation Name' dataIndex='relation_name' key='relation_name' />
            <Table.Column title='Designation' dataIndex='designation' key='designation' />
            <Table.Column title='Center' dataIndex='center_name' key='center_name' />
            <Table.Column title='Relation' dataIndex='relation' key='relation' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Overseas Visits</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.overseas_visits}>
            <Table.Column title='Country Visited' dataIndex='country_visited' key='country_visited' />
            <Table.Column title='Date of visit' dataIndex='date_of_visit' key='date_of_visit' />
            <Table.Column title='Duration' dataIndex='duration_of_visit' key='duration_of_visit' />
            <Table.Column title='Purpose' dataIndex='purpose_of_visit' key='purpose_of_visit' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Known Languages</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.languages}>
            <Table.Column title='Name' dataIndex='name' key='name' />
            <Table.Column title='Exam passed' dataIndex='exam_passed' key='exam_passed' />
          </Table>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>Reference Details</div>
          </div>
          <Table bordered pagination={false} size='small' dataSource={initialData.references}>
            <Table.Column title='Reference Name' dataIndex='reference_name' key='reference_name' />
            <Table.Column title='Position' dataIndex='position' key='position' />
          </Table>
        </div>
        <Row>
          <Form.Item>
            <Space>
              <Button type='danger' htmlType='button' onClick={onPrevious}>
                Previous
              </Button>
            </Space>
          </Form.Item>
        </Row>
      </Box>
    </FormStyles>
  );
};

Preview.propTypes = {
  onPrevious: PropTypes.func.isRequired,
};

export default Preview;
