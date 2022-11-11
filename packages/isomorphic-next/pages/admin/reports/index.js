import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import { Row, Col, Space, Form, Select } from 'antd';
import Button from '@iso/components/uielements/button';
import { useAuthState } from '../../../src/components/auth/hook';
import PageHeader from '@iso/components/utility/pageHeader';
import useUser from '../../../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../containers/DashboardLayout/DashboardLayout';
import ManageJobPostStyles from '../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import ListingStyles from '../../../styled/Listing.styles';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { CSVLink } from 'react-csv';
import { useRouter } from 'next/router';

const csvHeaders = [
  { label: 'Position', key: 'position' },
  { label: 'Name', key: 'name' },
  { label: 'Mobile no', key: 'mobile_no' },
  { label: 'Place of birth', key: 'place_of_birth' },
  { label: 'Skype id', key: 'skype_id' },
  { label: 'Whatsapp id', key: 'whatsapp_id' },
  { label: 'Father name', key: 'father_name' },
  { label: 'Father occupation', key: 'father_occupation' },
  { label: 'Fax number', key: 'fax_number' },
  { label: 'Gender', key: 'gender' },
  { label: 'Is Indian citizen', key: 'is_indian_citizen' },
  { label: 'Aplication Id', key: 'application_id' },
  { label: 'Job Status', key: 'applied_job_status' },
  { label: 'Division', key: 'division' },
  { label: 'Date of application', key: 'date_of_application' },
  { label: 'Education details', key: 'education_details' },
  { label: 'Experiences', key: 'experiences' },
  { label: 'Languages', key: 'languages' },
  { label: 'Local address', key: 'local_address' },
  { label: 'Permanent address', key: 'permanent_address' },
  { label: 'Father address', key: 'father_address' },
  { label: 'Neeri relation', key: 'neeri_relation' },
  { label: 'Other info', key: 'other_info' },
  { label: 'Overseas visits', key: 'overseas_visits' },
  { label: 'Passport number', key: 'passport_number' },
  { label: 'Passport expiry', key: 'passport_expiry' },
  { label: 'Religion', key: 'religion' },
  { label: 'Professional trainings', key: 'professional_trainings' },
  { label: 'Fellowship details', key: 'fellow_ships' },
  { label: 'Published papers', key: 'published_papers' },
];

const Report = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [positions, setPositions] = useState([]);
  const [jobDetails, setJobDetails] = useState([]);
  const [jobId, setJobId] = useState('');
  const [posId, setPosId] = useState('');
  const [CSVFile, setCSVFile] = useState([]);
  const [CSVDisable, setCSVDisable] = useState(true);

  useEffect(() => {
    const load = async () => {
      // For Public API use axios directly
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/job_posting_list/applicant/`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setJobDetails(response.data);
    };

    load();
  }, []);

  const handleJobChange = async (value) => {
    value === null ? setCSVDisable(true) : setCSVDisable(false);
    const response = await client.get(`job_posting/positions_list/?job_posting_id=${value}`);
    const responseCSV = await client.get(`job_posting/export/non_rejected_applicants/${value}/`);
    const data = responseCSV.data.map((item) => ({
      position: item.position,
      user_id: item.user_id,
      job_posting_id: item.job_posting_id,
      name: item.user_profile.name_of_applicant,
      mobile_no: item.user_profile.mobile_no,
      place_of_birth: item.user_profile.place_of_birth,
      skype_id: item.user_profile.skype_id,
      whatsapp_id: item.user_profile.whatsapp_id,
      application_id: item.application_id,
      applied_job_status: item.applied_job_status,
      division: item.division,
      date_of_application: item.date_of_application,
      education_details:
        item &&
        item.user_profile &&
        item.user_profile.education_details.length &&
        item.user_profile.education_details.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      experiences:
        item &&
        item.user_profile &&
        item.user_profile.experiences.length &&
        item.user_profile.experiences.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      fellow_ships:
        item &&
        item.user_profile &&
        item.user_profile.fellow_ships.length &&
        item.user_profile.fellow_ships.map(
          (v) =>
            `Id: ${v.id} , Exam Name: ${v.entrance_examination} , Passing Year: ${v.passing_year} , Score: ${v.score}\r`
        ),
      father_address:
        item &&
        item.user_profile &&
        item.user_profile.father_address &&
        (item.user_profile.father_address.address1,
        item.user_profile.father_address.address2,
        item.user_profile.father_address.address3,
        item.user_profile.father_address.telephone_no,
        item.user_profile.father_address.city,
        item.user_profile.father_address.country,
        item.user_profile.father_address.postcode,
        item.user_profile.father_address.state),
      father_name: item.user_profile.father_name,
      father_occupation: item.user_profile.father_occupation,
      fax_number: item.user_profile.fax_number,
      gender: item.user_profile.gender,
      is_indian_citizen: item.user_profile.is_indian_citizen,
      languages:
        item &&
        item.user_profile &&
        item.user_profile.languages.length &&
        item.user_profile.languages.map(
          (v) =>
            `Name: ${v.name} , Read level: ${v.read_level} , Speak level: ${v.speak_level} , Write level: ${v.write_level} , Exam passed: ${v.exam_passed}\r`
        ),
      local_address:
        item &&
        item.user_profile &&
        item.user_profile.local_address &&
        (item.user_profile.local_address.address1,
        item.user_profile.local_address.address2,
        item.user_profile.local_address.address3,
        item.user_profile.local_address.telephone_no,
        item.user_profile.local_address.city,
        item.user_profile.local_address.country,
        item.user_profile.local_address.postcode,
        item.user_profile.local_address.state),
      permanent_address:
        item &&
        item.user_profile &&
        item.user_profile.permanent_address &&
        (item.user_profile.permanent_address.address1,
        item.user_profile.permanent_address.address2,
        item.user_profile.permanent_address.address3,
        item.user_profile.permanent_address.telephone_no,
        item.user_profile.permanent_address.city,
        item.user_profile.permanent_address.country,
        item.user_profile.permanent_address.postcode,
        item.user_profile.permanent_address.state),
      neeri_relation:
        item &&
        item.user_profile &&
        item.user_profile.neeri_relation.length &&
        item.user_profile.neeri_relation.map(
          (v) =>
            `Relation Name: ${v.relation_name} , Realation: ${v.relation} , Designation: ${v.designation} , Center Name: ${v.center_name}\r`
        ),
      other_info:
        item &&
        item.user_profile &&
        item.user_profile.other_info &&
        (item.user_profile.other_info.notice_period_max,
        item.user_profile.other_info.notice_period_min,
        item.user_profile.other_info.bond_title,
        item.user_profile.other_info.bond_details,
        item.user_profile.other_info.organisation_name,
        item.user_profile.other_info.bond_start_date,
        item.user_profile.other_info.bond_end_date),
      overseas_visits:
        item &&
        item.user_profile &&
        item.user_profile.overseas_visits.length &&
        item.user_profile.overseas_visits.map(
          (v) =>
            `Purpose of visit: ${v.purpose_of_visit} , Duration of visit: ${v.duration_of_visit} , Date of visit: ${v.date_of_visit} , Country visit: ${v.country_visited}\r`
        ),
      passport_number: item.user_profile.passport_number,
      passport_expiry: item.user_profile.passport_expiry,
      religion: item.user_profile.religion.religion_name,
      professional_trainings:
        item &&
        item.user_profile &&
        item.user_profile.professional_trainings.length &&
        item.user_profile.professional_trainings.map(
          (v) =>
            `Title: ${v.title} , Description: , ${v.description} , From date: ${v.from_date} , To date: ${v.to_date}\r`
        ),
      published_papers:
        item &&
        item.user_profile &&
        item.user_profile.published_papers.length &&
        item.user_profile.published_papers.map((v) => `Paper title: ${v.paper_title}\r`),
    }));
    setCSVFile(data);
    setJobId(value);
    setPosId('');
    setPositions(response.data[0].manpower_positions);
  };

  const handlePositionChange = async (value) => {
    const response = await client.get(`job_posting/export/non_rejected_applicants/${jobId}/?position_id=${value}`);
    const data = response.data.map((item) => ({
      position: item.position,
      user_id: item.user_id,
      job_posting_id: item.job_posting_id,
      name: item.user_profile.name_of_applicant,
      mobile_no: item.user_profile.mobile_no,
      place_of_birth: item.user_profile.place_of_birth,
      skype_id: item.user_profile.skype_id,
      whatsapp_id: item.user_profile.whatsapp_id,
      application_id: item.application_id,
      applied_job_status: item.applied_job_status,
      division: item.division,
      date_of_application: item.date_of_application,
      education_details:
        item &&
        item.user_profile &&
        item.user_profile.education_details.length &&
        item.user_profile.education_details.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      experiences:
        item &&
        item.user_profile &&
        item.user_profile.experiences.length &&
        item.user_profile.experiences.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      fellow_ships:
        item &&
        item.user_profile &&
        item.user_profile.fellow_ships.length &&
        item.user_profile.fellow_ships.map(
          (v) =>
            `Id: ${v.id} , Exam Name: ${v.entrance_examination} , Passing Year: ${v.passing_year} , Score: ${v.score}\r`
        ),
      father_address:
        item &&
        item.user_profile &&
        item.user_profile.father_address &&
        (item.user_profile.father_address.address1,
        item.user_profile.father_address.address2,
        item.user_profile.father_address.address3,
        item.user_profile.father_address.telephone_no,
        item.user_profile.father_address.city,
        item.user_profile.father_address.country,
        item.user_profile.father_address.postcode,
        item.user_profile.father_address.state),
      father_name: item.user_profile.father_name,
      father_occupation: item.user_profile.father_occupation,
      fax_number: item.user_profile.fax_number,
      gender: item.user_profile.gender,
      is_indian_citizen: item.user_profile.is_indian_citizen,
      languages:
        item &&
        item.user_profile &&
        item.user_profile.languages.length &&
        item.user_profile.languages.map(
          (v) =>
            `Name: ${v.name} , Read level: ${v.read_level} , Speak level: ${v.speak_level} , Write level: ${v.write_level} , Exam passed: ${v.exam_passed}\r`
        ),
      local_address:
        item &&
        item.user_profile &&
        item.user_profile.local_address &&
        (item.user_profile.local_address.address1,
        item.user_profile.local_address.address2,
        item.user_profile.local_address.address3,
        item.user_profile.local_address.telephone_no,
        item.user_profile.local_address.city,
        item.user_profile.local_address.country,
        item.user_profile.local_address.postcode,
        item.user_profile.local_address.state),
      permanent_address:
        item &&
        item.user_profile &&
        item.user_profile.permanent_address &&
        (item.user_profile.permanent_address.address1,
        item.user_profile.permanent_address.address2,
        item.user_profile.permanent_address.address3,
        item.user_profile.permanent_address.telephone_no,
        item.user_profile.permanent_address.city,
        item.user_profile.permanent_address.country,
        item.user_profile.permanent_address.postcode,
        item.user_profile.permanent_address.state),
      neeri_relation:
        item &&
        item.user_profile &&
        item.user_profile.neeri_relation.length &&
        item.user_profile.neeri_relation.map(
          (v) =>
            `Relation Name: ${v.relation_name} , Realation: ${v.relation} , Designation: ${v.designation} , Center Name: ${v.center_name}\r`
        ),
      other_info:
        item &&
        item.user_profile &&
        item.user_profile.other_info &&
        (item.user_profile.other_info.notice_period_max,
        item.user_profile.other_info.notice_period_min,
        item.user_profile.other_info.bond_title,
        item.user_profile.other_info.bond_details,
        item.user_profile.other_info.organisation_name,
        item.user_profile.other_info.bond_start_date,
        item.user_profile.other_info.bond_end_date),
      overseas_visits:
        item &&
        item.user_profile &&
        item.user_profile.overseas_visits.length &&
        item.user_profile.overseas_visits.map(
          (v) =>
            `Purpose of visit: ${v.purpose_of_visit} , Duration of visit: ${v.duration_of_visit} , Date of visit: ${v.date_of_visit} , Country visit: ${v.country_visited}\r`
        ),
      passport_number: item.user_profile.passport_number,
      passport_expiry: item.user_profile.passport_expiry,
      religion: item.user_profile.religion.religion_name,
      professional_trainings:
        item &&
        item.user_profile &&
        item.user_profile.professional_trainings.length &&
        item.user_profile.professional_trainings.map(
          (v) =>
            `Title: ${v.title} , Description: , ${v.description} , From date: ${v.from_date} , To date: ${v.to_date}\r`
        ),
      published_papers:
        item &&
        item.user_profile &&
        item.user_profile.published_papers.length &&
        item.user_profile.published_papers.map((v) => `Paper title: ${v.paper_title}\r`),
    }));
    setCSVFile(data);
  };

  const nameWithTimestamp = `non_rejected_candidate_${
    new Date().getDate() +
    '-' +
    (new Date().getMonth() + 1) +
    '-' +
    new Date().getFullYear() +
    'T' +
    new Date().getHours() +
    ':' +
    (new Date().getMinutes().toString().length > 1 ? new Date().getMinutes() : '0' + new Date().getMinutes())
  }.csv`;

  return (
    <>
      <Head>
        <title>Reports List</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <Space direction='vertical' style={{ width: '100%' }}>
              <ListingStyles>
                <PageHeader>Non-rejected candidate List</PageHeader>
                <FormStyles>
                  <Box>
                    <Form name='formStep1' scrollToFirstError>
                      <Row gutter={[16, 0]}>
                        <Col xs={24} lg={12}>
                          <Form.Item label='Select Job Post' labelCol={{ span: 24 }}>
                            <Select
                              placeholder='Select Job Post'
                              showSearch
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={handleJobChange}
                              rules={[
                                {
                                  required: true,
                                  message: 'Select Job Post',
                                },
                              ]}
                            >
                              {jobDetails.map((detail) => (
                                <Option value={detail.job_posting_id}>{detail.notification_title}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} lg={12}>
                          <Form.Item label='Select Job Position' labelCol={{ span: 24 }}>
                            <Select
                              placeholder='Select Job Position'
                              showSearch
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              onChange={handlePositionChange}
                              rules={[
                                {
                                  required: true,
                                  message: 'Select Job Position',
                                },
                              ]}
                            >
                              {positions.map((position) => (
                                <Option value={position.id}>{position.position_display_name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <Form.Item>
                          <Space size='middle'>
                            <Link href='/admin/dashboard'>
                              <Button type='button' htmlType='button'>
                                Back
                              </Button>
                            </Link>
                            <CSVLink data={CSVFile} headers={csvHeaders} filename={nameWithTimestamp}>
                              <Button type='primary' disabled={CSVDisable}>
                                Export to CSV
                              </Button>
                            </CSVLink>
                          </Space>
                        </Form.Item>
                      </Row>
                    </Form>
                  </Box>
                </FormStyles>
              </ListingStyles>
            </Space>
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default Report;
