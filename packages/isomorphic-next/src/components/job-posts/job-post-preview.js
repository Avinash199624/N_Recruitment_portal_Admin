import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Table, Descriptions, Image, Typography, Row, Button, Space, Form, Popconfirm, notification } from 'antd';
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
import { EditOutlined } from '@ant-design/icons';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';
import { RequireInfoType } from '../../constants';
import { confirmJobApplication } from '../../apiCalls';

const JobPostPreview = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();

  const [initialData, setInitialData] = useState();
  const [infoPending, setInfoPending] = useState(false);

  const { Text } = Typography;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(
        `/user/candidate_preview_details/${user.user_id}/?job_posting_id=${router.query.job_posting_id}&position_id=${router.query.position_id}`
      );

      if (response.data?.information_provided) {
        Object.entries(response.data.information_provided).forEach(([key, value]) => {
          if (!value) {
            setInfoPending(true);
          }
        });
      }

      setInitialData(response.data);
    };

    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmApplicaton = async () => {
    const request = {
      application_id: router.query.applicantId,
      application_status: 'applied',
    };

    const response = await confirmJobApplication(client, request, user.user_id);

    if (response.status === 200) {
      if (response.data?.message) {
        notification['success']({
          description: response.data?.message,
        });
        window.setTimeout(() => {
          router.push(
            `/job-posts/application-preview/?job_posting_id=${router.query.job_posting_id}&position_id=${router.query.position_id}`
          );
        }, 1000);
      }
    } else {
      if (response.data?.message) {
        notification['warning']({
          description: response.data?.message,
        });
      } else {
        notification['warning']({
          description: `Something went wrong`,
        });
      }
    }
  };

  if (!initialData) return null;

  return (
    <FormStyles>
      <PageHeader>Applicant Details Preview</PageHeader>
      <Box>
        <div className='ant-descriptions-header'>
          <div className='ant-descriptions-title'>
            Personal Information{' '}
            <Link href={`/applicant-profile-main/?tab=0&redirect=${router.asPath}`}>
              <a style={{ marginLeft: 10 }}>
                <EditOutlined />
              </a>
            </Link>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Descriptions bordered>
            <Descriptions.Item label='Name Of Applicant' span={2}>
              {initialData.candidate_preview.user_profile.name_of_applicant}
            </Descriptions.Item>
            <Descriptions.Item label='Profile'>
              <Image
                width={100}
                height={100}
                src={
                  initialData.candidate_preview.user_profile.profile_photo
                    ? initialData.candidate_preview.user_profile.profile_photo
                    : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Father's (Full Name)">
              {initialData.candidate_preview.user_profile.father_name}
            </Descriptions.Item>
            <Descriptions.Item label='Occupation' span={2}>
              {initialData.candidate_preview.user_profile.father_occupation}
            </Descriptions.Item>
            <Descriptions.Item label='Sex'>
              {initialData.candidate_preview.user_profile.gender === null
                ? ''
                : initialData.candidate_preview.user_profile.gender.charAt(0).toUpperCase() +
                  initialData.candidate_preview.user_profile.gender.slice(1)}
            </Descriptions.Item>
            <Descriptions.Item label='Date of Birth'>
              {initialData.candidate_preview.user_profile.date_of_birth}
            </Descriptions.Item>
            <Descriptions.Item label='Birth Place'>
              {initialData.candidate_preview.user_profile.place_of_birth}
            </Descriptions.Item>
            <Descriptions.Item label='Are you a Citizen of India by Birth and /or By Domicile?' span={2}>
              {initialData.candidate_preview.user_profile.is_indian_citizen === true ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label='Religion'>
              {initialData.candidate_preview.user_profile.religion?.religion_name}
            </Descriptions.Item>
            <Descriptions.Item label='Caste/Community'>
              {initialData.candidate_preview.user_profile.caste === null
                ? ''
                : initialData.candidate_preview.user_profile.caste.toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label='Passport Details'>
              {initialData.candidate_preview.user_profile.passport_number}
            </Descriptions.Item>
            <Descriptions.Item label='Fax Number'>
              {initialData.candidate_preview.user_profile.fax_number}
            </Descriptions.Item>
            <Descriptions.Item label='Whatsapp Id/No.'>
              {initialData.candidate_preview.user_profile.whatsapp_id}
            </Descriptions.Item>
            <Descriptions.Item label='Skype Id' span={2}>
              {initialData.candidate_preview.user_profile.skype_id}
            </Descriptions.Item>
          </Descriptions>
          {initialData?.information_provided[RequireInfoType.PERSONAL] !== undefined &&
            !initialData?.information_provided[RequireInfoType.PERSONAL] && (
              <Text type='danger' style={{ top: -16, position: 'relative' }}>
                Personal Information Required
              </Text>
            )}
        </div>
        <div className='ant-descriptions-header'>
          <div className='ant-descriptions-title'>
            Address Details
            <Link href={`/applicant-profile-main/?tab=1&redirect=${router.asPath}`}>
              <a style={{ marginLeft: 10 }}>
                <EditOutlined />
              </a>
            </Link>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Descriptions bordered>
            <Descriptions.Item label='Residential Address' span={3}>
              {initialData.candidate_preview.user_profile.local_address?.address1}
              <br />
              {initialData.candidate_preview.user_profile.local_address?.address2}
              <br />
              {initialData.candidate_preview.user_profile.local_address?.address3}
              <br />
              {initialData.candidate_preview.user_profile.local_address?.city}
            </Descriptions.Item>
            <Descriptions.Item label='Permanent Address' span={3}>
              {initialData.candidate_preview.user_profile.local_address !== null &&
              initialData.candidate_preview.user_profile.permanent_address === null
                ? 'same as above'
                : ''}
              {initialData.candidate_preview.user_profile.permanent_address?.address1} <br />
              {initialData.candidate_preview.user_profile.permanent_address?.address2} <br />
              {initialData.candidate_preview.user_profile.permanent_address?.address3} <br />
              {initialData.candidate_preview.user_profile.permanent_address?.city}
            </Descriptions.Item>
          </Descriptions>
          {initialData?.information_provided[RequireInfoType.ADDRESS] !== undefined &&
            !initialData?.information_provided[RequireInfoType.ADDRESS] && (
              <Text type='danger'>Address Details Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Educational Details{' '}
              <Link href={`/applicant-profile-main/?tab=2&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.education_details}
          >
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
          {initialData?.information_provided[RequireInfoType.EDUCATION] !== undefined &&
            !initialData?.information_provided[RequireInfoType.EDUCATION] && (
              <Text type='danger'>Educations Details Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Professional Training{' '}
              <Link href={`/applicant-profile-main/?tab=2&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.professional_trainings}
          >
            <Table.Column title='Title' dataIndex='title' key='title' />
            <Table.Column title='Description' dataIndex='description' key='description' />
            <Table.Column title='From Date' dataIndex='from_date' key='from_date' />
            <Table.Column title='To Date' dataIndex='to_date' key='to_date' />
          </Table>
          {initialData?.information_provided[RequireInfoType.PROFESSIONAL_TRAINING] !== undefined &&
            !initialData?.information_provided[RequireInfoType.PROFESSIONAL_TRAINING] && (
              <Text type='danger'>Professional Training Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Fellowship Details{' '}
              <Link href={`/applicant-profile-main/?tab=2&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.fellow_ships}
          >
            <Table.Column title='Entrance Exam Name' dataIndex='entrance_examination' key='entrance_examination' />
            <Table.Column title='Passing Year' dataIndex='passing_year' key='passing_year' />
            <Table.Column title='Score' dataIndex='score' key='score' />
          </Table>
          {initialData?.information_provided[RequireInfoType.FELLOWSHIP] !== undefined &&
            !initialData?.information_provided[RequireInfoType.FELLOWSHIP] && (
              <Text type='danger'>Fellowship Details Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Published Paper{' '}
              <Link href={`/applicant-profile-main/?tab=2&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.published_papers}
          >
            <Table.Column title='Paper Title' dataIndex='paper_title' key='paper_title' />
          </Table>
          {initialData?.information_provided[RequireInfoType.PUBLISHED_PAPERS] !== undefined &&
            !initialData?.information_provided[RequireInfoType.PUBLISHED_PAPERS] && (
              <Text type='danger'>Published Paper Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Experience Details{' '}
              <Link href={`/applicant-profile-main/?tab=3&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.experiences}
          >
            <Table.Column title='Name' dataIndex='employer_name' key='employer_name' />
            <Table.Column title='Type' dataIndex='employment_type' key='employment_type' />
            <Table.Column title='Employed From' dataIndex='employed_from' key='employed_from' />
            <Table.Column title='Employed To' dataIndex='employed_to' key='employed_to' />
          </Table>
          {initialData?.information_provided[RequireInfoType.EXPERIENCE] !== undefined &&
            !initialData?.information_provided[RequireInfoType.EXPERIENCE] && (
              <Text type='danger'>Experience Details Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Existing Bond With Govt. Or Private organisation{' '}
              <Link href={`/applicant-profile-main/?tab=4&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Descriptions layout='vertical' bordered size='small'>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}>Bond Name </p>}>
              {initialData.candidate_preview.user_profile.other_info?.bond_title}
            </Descriptions.Item>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}>Organisation Name</p>}>
              {initialData.candidate_preview.user_profile.other_info?.organisation_name != null
                ? initialData.candidate_preview.user_profile.other_info?.organisation_name
                : 'No data added'}
            </Descriptions.Item>
            <Descriptions.Item label={<p style={{ fontWeight: 500 }}> Max Notice Period</p>}>
              {initialData.candidate_preview.user_profile.other_info?.notice_period_max}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Relation with Neeri Employee{' '}
              <Link href={`/applicant-profile-main/?tab=4&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.neeri_relation}
          >
            <Table.Column title='Relation Name' dataIndex='relation_name' key='relation_name' />
            <Table.Column title='Designation' dataIndex='designation' key='designation' />
            <Table.Column title='Center' dataIndex='center_name' key='center_name' />
            <Table.Column title='Relation' dataIndex='relation' key='relation' />
          </Table>
          {initialData?.information_provided[RequireInfoType.RELATIVES_IN_NEERI] !== undefined &&
            !initialData?.information_provided[RequireInfoType.RELATIVES_IN_NEERI] && (
              <Text type='danger'>Experience Details Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Overseas Visits
              <Link href={`/applicant-profile-main/?tab=4&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.overseas_visits}
          >
            <Table.Column title='Country Visited' dataIndex='country_visited' key='country_visited' />
            <Table.Column title='Date of visit' dataIndex='date_of_visit' key='date_of_visit' />
            <Table.Column title='Duration' dataIndex='duration_of_visit' key='duration_of_visit' />
            <Table.Column title='Purpose' dataIndex='purpose_of_visit' key='purpose_of_visit' />
          </Table>
          {initialData?.information_provided[RequireInfoType.OVERSEAS_VISITS] !== undefined &&
            !initialData?.information_provided[RequireInfoType.OVERSEAS_VISITS] && (
              <Text type='danger'>Overseas Visits Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Known Languages{' '}
              <Link href={`/applicant-profile-main/?tab=4&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.languages}
          >
            <Table.Column title='Name' dataIndex='name' key='name' />
            <Table.Column title='Name' dataIndex='exam_passed' key='exam_passed' />
          </Table>
          {initialData?.information_provided[RequireInfoType.LANGUAGES] !== undefined &&
            !initialData?.information_provided[RequireInfoType.LANGUAGES] && (
              <Text type='danger'>Known Languages Required</Text>
            )}
        </div>
        <div className='ant-descriptions ant-descriptions-bordered'>
          <div className='ant-descriptions-header'>
            <div className='ant-descriptions-title'>
              Reference Details{' '}
              <Link href={`/applicant-profile-main/?tab=4&redirect=${router.asPath}`}>
                <a style={{ marginLeft: 10 }}>
                  <EditOutlined />
                </a>
              </Link>
            </div>
          </div>
          <Table
            bordered
            pagination={false}
            size='small'
            dataSource={initialData.candidate_preview.user_profile.references}
          >
            <Table.Column title='Reference Name' dataIndex='reference_name' key='reference_name' />
            <Table.Column title='Reference Name' dataIndex='reference_name' key='reference_name' />
          </Table>
          {initialData?.information_provided[RequireInfoType.REFERENCES] !== undefined &&
            !initialData?.information_provided[RequireInfoType.REFERENCES] && (
              <Text type='danger'>Reference Details Required</Text>
            )}
        </div>
        <Row justify='center'>
          <Form.Item>
            <Space>
              {!infoPending ? (
                <Popconfirm
                  title='Are you sure to submit details ?'
                  okText='Yes'
                  cancelText='No'
                  onConfirm={() => onConfirmApplicaton()}
                  onCancel={() => {}}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  placement='left'
                >
                  <Button type='primary' htmlType='submit'>
                    Confirm your application
                  </Button>
                </Popconfirm>
              ) : (
                <Text type='danger'>Please verify all required information is filled before submit.</Text>
              )}
            </Space>
          </Form.Item>
        </Row>
      </Box>
    </FormStyles>
  );
};

JobPostPreview.propTypes = {};

export default JobPostPreview;
