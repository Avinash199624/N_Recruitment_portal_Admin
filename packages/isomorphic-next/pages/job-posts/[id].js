import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import draftToHtml from 'draftjs-to-html';
// Components
import { Descriptions, Typography, Divider, Form, notification, Button, Tag } from 'antd';
import Box from '@iso/components/utility/box';
import Table from '@iso/components/uielements/table';
import FormStyles from '../../styled/Form.styles';
import PageHeader from '@iso/components/utility/pageHeader';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
// Hooks / API Calls / Helper functions
import useUser from '../../src/components/auth/useUser';
import { createMarkup } from '../../src/helper';
// Styles
import JobPostsStyles from '../../src/components/job-posts/JobPosts.styles';
import { jobTypes } from '../../src/constants';
import { useAuthState } from '../../src/components/auth/hook';

const ViewJobPosts = () => {
  const router = useRouter();
  const { client } = useAuthState();

  const {
    query: { id },
  } = router;

  const { Title, Text } = Typography;

  const [form] = Form.useForm();

  const [positions, setPositions] = useState([]);
  const [positionsData, setPositionsData] = useState([]);
  const [jobPostDetails, setJobPostDetails] = useState(null);
  const [token, setToken] = useState(null);
  const [jobPostingId, setJobPostingId] = useState('');
  const [jobType, setJobType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { Column } = Table;
  const [ellipsis, setEllipsis] = React.useState(true);

  useEffect(() => {
    const data = [];
    const load = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/applicant/${id}/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setJobPostingId(response.data?.job_posting_id);
        response &&
          response.data.manpower_positions.map((res, index) => {
            data.push({
              key: index + 1,
              id: res.id,
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
              quota: res.quota.toUpperCase(),
              extra_note: res.extra_note,
              job_type: response.data.job_type,
              status: '',
            });
          });
        setJobPostDetails(response.data);
        setPositions(data);
        setJobType(response.data?.job_type);
        setToken(localStorage.getItem('token'));
      } catch (error) {
        router.push('/404');
      }
    };

    load();
  }, []);

  useEffect(() => {
    const data = [];
    const load = async () => {
      const response = await client.get(`/job_posting/job_application_status/${id}/`);
      const jobPostResponse = await client.get(`/job_posting/applicant/${id}/`);
      jobPostResponse &&
        jobPostResponse.data.manpower_positions.map((res, index) => {
          data.push({
            key: index + 1,
            id: res.id,
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
            quota: res.quota.toUpperCase(),
            extra_note: res.extra_note,
            job_type: jobType,
            status: response && response.data.find((item) => (item.position_id === res.id ? item.status : '')),
          });
        });
      setPositionsData(data);
    };
    const token = localStorage.getItem('token');
    if (token) load();
  }, []);
  const onApplyJob = async (pos_id, jobType, position, record) => {
    if (!token) {
      notification['error']({
        description: 'You need to signin before applying',
      });
      window.setTimeout(() => {
        router.push(`/login/?redirect=/job-posts/${id}`);
      }, 1000);
    } else if (jobType === 'Contract_Basis') {
      const response = await client.post(`/user/apply/${id}/`, { positions: [pos_id] });
      if (response.data?.success === false && response.data?.message === 'User subscription expired') {
        // @TODO: redirect to PG
        // before applying redirect to payment page
        setSubmitting(true);
        if (response.data?.fee > 0) {
          window.setTimeout(() => {
            router.push({
              pathname: `/subscription/create/`,
              query: { job_posting: jobPostingId, fee: response.data?.fee, position_id: pos_id },
            });
          }, 1000);
        } else {
          window.setTimeout(() => {
            router.push({
              pathname: `/job-posts/document_upload`,
              query: {
                position_id: pos_id,
                applicantId: response.data.applications[0],
                job_posting: jobPostingId,
                url: `/job-posts/${id}/`,
              },
            });
          }, 1000);
        }
      } else if (response.data?.success === true && response.data?.message === 'Fee not required.') {
        // @TODO: redirect to document page, move this code to document page
        setSubmitting(true);
        window.setTimeout(() => {
          router.push({
            pathname: `/job-posts/document_upload`,
            query: {
              position_id: pos_id,
              applicantId: response.data.applications[0],
              job_posting: jobPostingId,
              url: `/job-posts/${id}/`,
            },
          });
        }, 1000);
      } else if (
        response.data?.success === false &&
        response.data?.message === "'NoneType' object has no attribute 'year'"
      ) {
        // @TODO: show message f"Age eligibility not fulfilled for {position.position_display_name}"
        notification['error']({
          description: 'Please complete your profile first',
        });
        return;
      } else if (response.data?.success === false) {
        // @TODO: show message f"Age eligibility not fulfilled for {position.position_display_name}"
        notification['error']({
          description: `${response.data.message}`,
        });
      } else if (response.data?.success === true) {
        // @TODO: redirect to document page, move this code to document page
        setSubmitting(true);
        window.setTimeout(() => {
          router.push({
            pathname: `/job-posts/document_upload`,
            query: {
              position_id: pos_id,
              applicantId: response.data.applications[0],
              job_posting: jobPostingId,
              url: `/job-posts/${id}/`,
            },
          });
        }, 1000);
      }
    } else {
      const response = await client.post(`/user/apply/${id}/`, { positions: [pos_id] });
      if (response.data?.success === false && response.data?.fee) {
        // @TODO: show show amount to be paid, then redirect to PG & redirect to payment gateway
        if (response.data?.fee > 0) {
          window.setTimeout(() => {
            router.push({
              pathname: `/job-posts/payment`,
              query: {
                job_posting: jobPostingId,
                fee: response.data.fee,
                job_position: pos_id,
                job_type: jobType,
                details: position,
                notification_title: jobPostDetails.notification_title,
                notification_id: jobPostDetails.notification_id,
                age_limit: record.age_limit,
                number_of_vacancies: record.number_of_vacancies,
                monthly_emolements: record.monthly_emolements,
                url: `/job-posts/${id}`,
              },
            });
          }, 1000);
        } else {
          window.setTimeout(() => {
            router.push({
              pathname: `/job-posts/document_upload`,
              query: {
                position_id: pos_id,
                applicantId: response.data.applications[0],
                job_posting: jobPostingId,
                url: `/job-posts/${id}/`,
              },
            });
          }, 1000);
        }
      }
      // }
      else if (
        response.data?.success === false &&
        response.data?.message === "'NoneType' object has no attribute 'year'"
      ) {
        // @TODO: show message f"Age eligibility not fulfilled for {position.position_display_name}"
        notification['error']({
          description: `Please complete your profile first`,
        });
        return;
      } else if (response.data?.success === false) {
        // @TODO: show message f"Age eligibility not fulfilled for {position.position_display_name}"
        notification['error']({
          description: response.data.message,
        });
      } else if (response.data?.success === true) {
        // @TODO: redirect to document page, move this code to document page
        setSubmitting(true);
        window.setTimeout(() => {
          router.push({
            pathname: `/job-posts/document_upload`,
            query: {
              position_id: pos_id,
              applicantId: response.data.applications[0],
              job_posting: jobPostingId,
              url: `/job-posts/${id}/`,
            },
          });
        }, 1000);
      }
    }
  };

  const redirectToInfo = async (pos_id) => {
    const response = await client.post(`/user/apply/${id}/`, { positions: [pos_id] });
    if (response.data.success === false) {
      notification['error']({
        description: response.data.message,
      });
    } else {
      router.push(
        `/job-posts/require-information/?position_id=${pos_id}&applicantId=${response.data?.applications[0]}&job_posting_id=${jobPostingId}`
      );
    }
  };

  if (!jobPostDetails) return null;

  return (
    <>
      <Head>
        <title>Job Post Details</title>
      </Head>
      <JobPostsStyles>
        <FormStyles>
          <DashboardLayout>
            <LayoutWrapper>
              <PageHeader>Job Post Details</PageHeader>
              <Box>
                <Descriptions bordered style={{ marginBottom: 20 }}>
                  <Descriptions.Item label='Notification ID' span={2}>
                    {jobPostDetails.notification_id}
                  </Descriptions.Item>
                  <Descriptions.Item label='Notification Title' span={2}>
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
                {jobPostDetails.pre_ad_description !== null && jobPostDetails.pre_ad_description !== '' && (
                  <>
                    <div
                      className='isoDescription'
                      dangerouslySetInnerHTML={createMarkup(draftToHtml(JSON.parse(jobPostDetails.pre_ad_description)))}
                    />
                    <Divider />
                  </>
                )}
                <Title level={4}>Positions</Title>
                {token === null ? (
                  <Table bordered dataSource={positions} pagination={false}>
                    <Column title='Sr.No' key='key' dataIndex='key' />
                    <Column title='Position' dataIndex='position' key='position' />
                    <Column title='Age Limit' dataIndex='age_limit' key='age_limit' />
                    <Column title='No. of Vacancies' dataIndex='number_of_vacancies' key='number_of_vacancies' />
                    <Column
                      title='Qualification'
                      dataIndex='qualification'
                      key='qualification'
                      render={(text, record) =>
                        record.qualification.map((qualification, index) => {
                          if (record.qualification.length > 1) {
                            return <span key={index}>{(index ? ' , ' : '') + qualification.education_degree}</span>;
                          } else {
                            return qualification.qualification;
                          }
                        })
                      }
                    />
                    <Column
                      title='Qualification Desc'
                      dataIndex='extra_note'
                      key='extra_note'
                      render={(text, record) => (
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
                      )}
                    />
                    <Column title='Salary' dataIndex='monthly_emolements' key='monthly_emolements' />
                    <Column title='Quota' dataIndex='quota' key='quota' />
                    <Column
                      title='Apply'
                      dataIndex='key'
                      key='key'
                      render={(text, record) => (
                        <>
                          <Button
                            type='primary'
                            disabled={submitting || router.query?.expired === 'true'}
                            onClick={() => onApplyJob(record.id, record.job_type, record.position, record)}
                          >
                            Apply
                          </Button>
                        </>
                      )}
                    />
                  </Table>
                ) : (
                  <Table bordered dataSource={positionsData} pagination={false}>
                    <Column title='Sr.No' key='key' dataIndex='key' />
                    <Column title='Position' dataIndex='position' key='position' />
                    <Column title='Age Limit' dataIndex='age_limit' key='age_limit' />
                    <Column title='No. of Vacancies' dataIndex='number_of_vacancies' key='number_of_vacancies' />
                    <Column
                      title='Qualification'
                      dataIndex='qualification'
                      key='qualification'
                      render={(text, record) =>
                        record.qualification.map((qualification, index) => {
                          if (record.qualification.length > 1) {
                            return <span key={index}>{(index ? ' , ' : '') + qualification.education_degree}</span>;
                          } else {
                            return qualification.qualification;
                          }
                        })
                      }
                    />
                    <Column
                      title='Qualification Desc'
                      dataIndex='extra_note'
                      key='extra_note'
                      render={(text, record) => (
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
                      )}
                    />
                    <Column title='Salary' dataIndex='monthly_emolements' key='monthly_emolements' />
                    <Column title='Quota' dataIndex='quota' key='quota' />
                    <Column
                      title='Status'
                      dataIndex='status'
                      key='status'
                      render={(text, record) =>
                        router.query.expired === 'true' ? (
                          <Tag style={{ textAlign: 'center', borderRadius: '40px' }} color={'#e72708'}>
                            {'EXPIRED'}
                          </Tag>
                        ) : record.status?.status === 'applied' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-received`}
                            color={'#069633'}
                          >
                            {`APPLIED`}
                          </Tag>
                        ) : record.status?.status === 'payment pending' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#D3B636'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : record.status?.status === 'document pending' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px', whiteSpace: 'normal' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#D3B636'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : record.status?.status === 'information pending' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px', whiteSpace: 'normal' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'rgb(57, 57, 58)'}
                          >
                            {`INFORMATION PENDING`}
                          </Tag>
                        ) : record.status?.status === 'rejected' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#D5202F'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : record.status?.status === 'shortlisted' || record.status?.status === 'applied' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#069633'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : record.status?.status === 'hired' ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#069633'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : record.status?.status !== undefined ? (
                          <Tag
                            style={{ textAlign: 'center', borderRadius: '40px' }}
                            className={`ant-tag-${record.status?.status}`}
                            color={'#39393A'}
                          >
                            {record.status?.status.toUpperCase()}
                          </Tag>
                        ) : (
                          '-'
                        )
                      }
                    />
                    <Column
                      title='Action'
                      dataIndex=''
                      key=''
                      render={(text, record) =>
                        router.query?.expired === 'true' ? (
                          ''
                        ) : record.status?.status === 'payment pending' ? (
                          <a
                            type='button'
                            onClick={() => onApplyJob(record.id, record.job_type, record.position, record)}
                          >
                            {`Complete Payment`}
                          </a>
                        ) : record.status?.status === 'document pending' ? (
                          <a
                            type='button'
                            onClick={() => onApplyJob(record.id, record.job_type, record.position, record)}
                          >
                            {`Complete Document`}
                          </a>
                        ) : record.status?.status === 'information pending' ? (
                          <a type='button' onClick={() => redirectToInfo(record.id)}>
                            {`Complete Info`}
                          </a>
                        ) : record.status?.status !== 'applied' &&
                          record.status?.status !== 'shortlisted' &&
                          record.status?.status !== 'hired' &&
                          record.status?.status !== 'awaiting review' &&
                          record.status?.status !== 'rejected' &&
                          record.status?.status !== 'closed' ? (
                          <Button
                            type='primary'
                            disabled={submitting || router.query?.expired === 'true'}
                            onClick={() => onApplyJob(record.id, record.job_type, record.position, record)}
                          >
                            Apply
                          </Button>
                        ) : (
                          ''
                        )
                      }
                    />
                  </Table>
                )}
                <Divider />
                {jobPostDetails.post_ad_description !== null && jobPostDetails.post_ad_description !== '' && (
                  <>
                    <div
                      className='isoDescription'
                      dangerouslySetInnerHTML={createMarkup(
                        draftToHtml(JSON.parse(jobPostDetails.post_ad_description))
                      )}
                    />
                    <Divider />
                  </>
                )}
                {token ? (
                  <Button
                    style={{ marginRight: 16 }}
                    onClick={() => {
                      router.push({
                        pathname: `${router.query.url}`,
                      });
                    }}
                    type='button'
                  >
                    Back
                  </Button>
                ) : (
                  ''
                )}
              </Box>
            </LayoutWrapper>
          </DashboardLayout>
        </FormStyles>
      </JobPostsStyles>
    </>
  );
};

export default ViewJobPosts;
