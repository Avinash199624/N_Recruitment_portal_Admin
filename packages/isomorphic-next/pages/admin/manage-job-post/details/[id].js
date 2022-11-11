import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import draftToHtml from 'draftjs-to-html';
// Components
import { Descriptions, Typography, Divider, Row, Col } from 'antd';
import Box from '@iso/components/utility/box';
import Table from '@iso/components/uielements/table';
import Button from '@iso/ui/Antd/Button/Button';
import PageHeader from '@iso/components/utility/pageHeader';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
// Hooks / API Calls / Helper functions
import useUser from '../../../../src/components/auth/useUser';
import { createMarkup } from '../../../../src/helper';
import { jobTypes } from '../../../../src/constants';
// Styles
import JobPostsStyles from '../../../../src/components/job-posts/JobPosts.styles';
import FormStyles from '../../../../styled/Form.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
};

const ViewJobPosts = () => {
  const { user } = useUser({});
  const router = useRouter();
  const {
    query: { id },
  } = router;
  const { Title, Text } = Typography;
  const [roles, setRoles] = useState('');
  const [positions, setPositions] = useState([]);
  const [jobPostDetails, setJobPostDetails] = useState(null);
  const [hideButton, setHideButton] = useState(false);
  const [ellipsis, setEllipsis] = React.useState(true);

  const columns = [
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Age Limit',
      dataIndex: 'age_limit',
      key: 'age_limit',
    },
    {
      title: 'No. of Vacancies',
      dataIndex: 'number_of_vacancies',
      key: 'number_of_vacancies',
    },
    {
      title: 'Qualifications',
      dataIndex: 'qualification',
      key: 'qualification',
      render: (qualification) => (
        <>
          {qualification &&
            qualification.map((v, index) => {
              if (qualification.length > 1) {
                return <span key={index}>{(index ? ' , ' : '') + v.education_degree}</span>;
              } else {
                return v.education_degree;
              }
            })}
        </>
      ),
    },
    {
      title: 'Qualification Desc',
      dataIndex: 'extra_note',
      key: 'extra_note',
      render: (text, record) => (
        <Text
          style={
            ellipsis
              ? {
                  width: 150,
                }
              : undefined
          }
          ellipsis={
            ellipsis
              ? {
                  tooltip: record.extra_note,
                }
              : false
          }
        >
          {record.extra_note}
        </Text>
      ),
    },
    {
      title: 'Salary',
      dataIndex: 'monthly_emolements',
      key: 'monthly_emolements',
    },
    {
      title: 'Quota',
      dataIndex: 'quota',
      key: 'quota',
    },
  ];

  useEffect(() => {
    const data = [];
    setRoles(JSON.parse(localStorage.getItem('roles')));
    const load = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/applicant/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        response &&
          response.data.manpower_positions &&
          response.data.manpower_positions.map((res) => {
            data.push({
              key: res.id,
              position: res.position,
              age_limit:
                res.min_age && res.max_age
                  ? `${res.min_age}-${res.max_age}`
                  : res.min_age === 0 && res.max_age === 0
                  ? 'Apply for all'
                  : res.min_age === 0
                  ? `Upto ${res.max_age}`
                  : res.max_age === 0
                  ? `${res.min_age} Above `
                  : '',
              qualification: res.qualification,
              monthly_emolements: res.monthly_emolements,
              number_of_vacancies: res.number_of_vacancies,
              quota: res.quota?.toUpperCase(),
              job_type: response.data.job_type,
              extra_note: res.extra_note,
              status: res.status,
            });
          });
        setJobPostDetails(response.data);
        if (response.data.status === 'published') {
          if (roles[0] === 'job posting (temporary)' || roles[0] === 'job posting (permanent)') {
            setHideButton(false);
          }
          setHideButton(true);
        }
        setPositions(data);
      } catch (error) {
        router.push('/404');
      }
    };

    if (user && user.isLoggedIn) load();
  }, [user]);
  if (!jobPostDetails) return null;

  return (
    <>
      <Head>
        <title>Job Post Details</title>
      </Head>
      <JobPostsStyles>
        <DashboardLayout>
          <LayoutWrapper>
            <ManageJobPostStyles>
              <FormStyles>
                <PageHeader>Job Post Details</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Button
                        style={{ marginRight: 16, marginBottom: 10 }}
                        onClick={() => {
                          router.push({
                            pathname: router.query?.redirect,
                          });
                        }}
                        type='button'
                      >
                        Back
                      </Button>
                    </Row>
                  </Col>
                </Row>
                <Box>
                  <Descriptions bordered style={{ marginBottom: 20 }}>
                    <Descriptions.Item label='Notification ID' span={3}>
                      {jobPostDetails.notification_id}
                    </Descriptions.Item>
                    <Descriptions.Item label='Notification Title' span={3}>
                      {jobPostDetails.notification_title}
                    </Descriptions.Item>
                    <Descriptions.Item label='Recruitment type' span={2}>
                      {jobTypes[jobPostDetails.job_type]}
                    </Descriptions.Item>
                    <Descriptions.Item label='Divison / Zonal' span={2}>
                      {jobPostDetails.division.division_name} / {jobPostDetails.zonal_lab.zonal_lab_name}
                    </Descriptions.Item>
                    <Descriptions.Item label='Opening Date' span={2}>
                      {moment(jobPostDetails.publication_date).format('DD-MM-YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label='Closing Date' span={2}>
                      {moment(jobPostDetails.end_date).format('DD-MM-YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label='Advertisement  Documents' span={4}>
                      {jobPostDetails.documents_uploaded.length > 0 ? (
                        <a href={`${jobPostDetails.documents_uploaded[0].doc_file_path}`} target='_blank'>
                          {`${jobPostDetails.documents_uploaded[0].doc_name}`}
                        </a>
                      ) : (
                        ''
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label='Additional  Documents' span={4}>
                      {jobPostDetails.additional_documents_uploaded.length > 0
                        ? jobPostDetails.additional_documents_uploaded.map((item, index) => (
                            <a href={`${item.doc_file_path}`} target='_blank'>
                              {`${index + 1}. ${item.doc_name}`}
                              <br />
                            </a>
                          ))
                        : ''}
                    </Descriptions.Item>
                  </Descriptions>
                </Box>
                <Box>
                  {jobPostDetails.pre_ad_description &&
                    jobPostDetails.pre_ad_description !== '' &&
                    jobPostDetails.pre_ad_description !== null && (
                      <div
                        className='isoDescription'
                        dangerouslySetInnerHTML={createMarkup(
                          draftToHtml(JSON.parse(jobPostDetails.pre_ad_description))
                        )}
                      />
                    )}
                  <Divider />
                  <Row className='action-bar' gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <Title level={4} type='primary'>
                        Positions
                      </Title>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Row justify='end'>
                        <Col lg={12}></Col>
                        <Row xs={24} lg={12}>
                          <Button
                            type='primary'
                            onClick={() =>
                              roles[0] === 'job posting (temporary)'
                                ? router.push(`/admin/manage-job-post/temporary/edit/${id}`)
                                : router.push(`/admin/manage-job-post/permanent/edit/${id}`)
                            }
                            hidden={hideButton}
                          >
                            Add New
                          </Button>
                        </Row>
                      </Row>
                    </Col>
                  </Row>
                  <Table bordered dataSource={positions} columns={columns} pagination={false} />
                  <Divider />
                  {jobPostDetails.post_ad_description &&
                    jobPostDetails.post_ad_description !== '' &&
                    jobPostDetails.post_ad_description !== null && (
                      <div
                        className='isoDescription'
                        dangerouslySetInnerHTML={createMarkup(
                          draftToHtml(JSON.parse(jobPostDetails.post_ad_description))
                        )}
                      />
                    )}
                </Box>
              </FormStyles>
            </ManageJobPostStyles>
          </LayoutWrapper>
        </DashboardLayout>
      </JobPostsStyles>
    </>
  );
};

export default ViewJobPosts;
