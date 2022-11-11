import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthState } from '../src/components/auth/hook';
import Table from '@iso/components/uielements/table';
import useUser from '../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../containers/DashboardLayout/DashboardLayout';
import ManageJobPostStyles from '../containers/Admin/ManageJobPost/ManageJobPost.styles';
import ListingStyles from '../styled/Listing.styles';
import { Space, Row, Col, Tag, Form, Button, Input, Modal, Select, Tooltip, notification } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import PageHeader from '@iso/components/utility/pageHeader';
import moment from 'moment';

const ManageApplications = () => {
  const { client } = useAuthState();
  const router = useRouter();
  const { user } = useUser({});
  const [jobs, setJobs] = useState([]);
  const [jobsfilter, setJobsFilter] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonMaster, setReasonMaster] = useState([]);
  const [reason, setReason] = useState(undefined);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState('');
  const [position, setPosition] = useState('');
  const [jobId, setJobId] = useState();
  const [startDateFilter, setStartDateFilter] = useState([]);
  const [endDateFilter, setEndDateFilter] = useState([]);
  const [appliedStatus, setappliedStatus] = useState([]);
  const { Column } = Table;

  const loadApplicantJobList = async () => {
    const obj = JSON.parse(window.localStorage.getItem('authUser'));
    const response = await client.get(`/user/public/applicant_job_list/${obj.data.user.user_id}/`);

    if (!response.data.isEmpty) {
      const dataSource = response.data.map((res, index) => ({
        sr_no: index + 1,
        key: res.id,
        jobPostID: res.job_posting,
        position: res.position,
        notificationID: res.notification_id,
        description: res.description,
        date_of_application: res.date_of_application,
        date_of_closing: res.date_of_closing,
        applied_job_status: res.applied_job_status,
        appeal: res.appeal,
        job_type: res.job_type,
        expired: moment(res.date_of_closing).isBefore(moment(new Date()).format('YYYY-MM-DD')),
      }));

      const jobs = response.data.map((res) => ({
        value: res.description,
        text: res.description,
      }));
      const applied = response.data.map((res) => ({
        value: res.applied_job_status,
        text: res.applied_job_status.toUpperCase(),
      }));
      const startdate = response.data.map((res) => ({
        value: res.date_of_application,
        text: res.date_of_application,
      }));
      const enddate = response.data.map((res) => ({
        value: res.date_of_closing,
        text: res.date_of_closing,
      }));
      setJobsFilter(jobs.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setStartDateFilter(startdate.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setEndDateFilter(enddate.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setappliedStatus(applied.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setJobs(dataSource);
      setTableList(dataSource);
    }
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      await loadApplicantJobList();
    };

    const loadAppealReasons = async () => {
      const response = await client.get('/job_posting/appeal_reason_master/');
      if (response.data) {
        const appealReasons = response.data.map((reason) => ({
          appeal_id: reason.appeal_id,
          appeal_reason_master: reason.appeal_reason_master,
        }));
        setReasonMaster(appealReasons);
      }
    };

    if (user && user.isLoggedIn) {
      load();
      loadAppealReasons();
    }
  }, [user, client]);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size='small' style={{ width: 90 }}>
            Reset
          </Button>
          {/* <Button
            type='link'
            size='small'
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button> */}
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    render: (text) =>
      searchedColumn === dataIndex ? (
        <div>
          {text ? (
            <div>{dataIndex === 'title' || 'notificationID' ? <a>{text.toString()}</a> : text.toString()}</div>
          ) : (
            ''
          )}
        </div>
      ) : (
        <div>{dataIndex === 'title' || 'notificationID' ? <a>{text.toString()}</a> : text}</div>
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const handleReason = (value, obj) => {
    setReason(obj.value);
  };

  const onConfirmAppeal = async () => {
    const response = await client.put(`/job_posting/update_user_appeal_for_job_position/${jobId}/`, {
      appeal: reason,
      reason_to_appeal: comments,
    });
    if (response.data.message === "You've already appealed for this job...") {
      notification['error']({
        description: `You've already appealed for this job`,
      });
      setReason(undefined);
      setModalVisible(false);
    } else {
      const data = jobs.filter((user) => user.key !== jobId);
      setJobs(data);
      notification['success']({
        description: 'Appeal has been made Successfully',
      });
      setReason(undefined);
      setModalVisible(false);
      loadApplicantJobList();
    }
  };

  const openModal = (id, desc) => {
    setModalVisible(true);
    setJobId(id);
    setPosition(desc);
  };

  const closeModal = () => {
    setModalVisible(false);
    setReason(undefined);
    form.resetFields();
  };

  const redirectToPayment = async (id, position_id, applicant_id) => {
    const response = await client.post(`/user/apply/${id}/`, { positions: [position_id] });
    if (response.data?.fee > 0) {
      window.setTimeout(() => {
        router.push({
          pathname: `/job-posts/payment`,
          query: {
            job_posting: id,
            job_position: position_id,
            fee: response.data?.fee,
            url: '/manage-applications/',
          },
        });
      }, 1000);
    } else {
      router.push({
        pathname: `/job-posts/document_upload`,
        query: {
          job_posting: id,
          position_id: position_id,
          applicantId: applicant_id,
          url: '/manage-applications/',
        },
      });
    }
  };

  const redirectToSubscribe = async (id, position_id, applicant_id) => {
    const response = await client.post(`/user/apply/${id}/`, { positions: [position_id] });
    if (response.data?.fee > 0) {
      window.setTimeout(() => {
        router.push({
          pathname: `/subscription/create`,
          query: {
            job_posting: id,
            position_id: position_id,
            fee: response.data?.fee,
            url: '/manage-applications/',
          },
        });
      }, 1000);
    } else {
      router.push({
        pathname: `/job-posts/document_upload`,
        query: {
          job_posting: id,
          position_id: position_id,
          applicantId: applicant_id,
          url: '/manage-applications/',
        },
      });
    }
  };

  const [form] = Form.useForm();

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <DashboardLayout>
        <LayoutContentWrapper>
          <Modal
            title={`Appealing for ${position}`}
            style={{ top: 20 }}
            width={1000}
            visible={modalVisible}
            onOk={() => {
              form
                .validateFields()
                .then(() => {
                  form.resetFields();
                  onConfirmAppeal();
                })
                .catch((info) => {
                  console.log('Validate Failed:', info);
                });
            }}
            onCancel={closeModal}
          >
            <Form name='formStep1' form={form} scrollToFirstError>
              <Row gutter={[16, 0]}>
                <Col span={24}>
                  <Form.Item
                    name='reason'
                    labelCol={{ span: 24 }}
                    label='Reason'
                    rules={[{ required: true, message: 'Please select reason!' }]}
                  >
                    <Select placeholder='Select Reason' value={reason} onChange={handleReason}>
                      {reasonMaster.map((reason) => (
                        <Select.Option value={reason.appeal_id} name={reason.appeal_reason_master}>
                          {reason.appeal_reason_master}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name='comments' label='Comments' labelCol={{ span: 24 }}>
                    <Input.TextArea
                      placeholder='Add Comments'
                      rows={3}
                      value={comments}
                      maxLength={200}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Applied Job List</PageHeader>
                {/* <Row>
                  <InputSearch
                    placeholder='Search'
                    style={{ width: '50%' }}
                    value={value}
                    onChange={(e) => handleSearch(e)}
                  />
                </Row> */}
                <ListingStyles>
                  {/* <Table dataSource={jobs} columns={columns} /> */}
                  <Row>
                    <Col span={24}>
                      <Table dataSource={jobs} getPopupContainer={(trigger) => trigger}>
                        <Column title='Sr No' dataIndex='sr_no' key='sr_no' />
                        <Column
                          title='Notification ID'
                          dataIndex='notificationID'
                          key='notificationID'
                          width='15%'
                          sorter={(a, b) => a.notificationID.localeCompare(b.notificationID)}
                          {...getColumnSearchProps('notificationID', 'Notification Id')}
                          getPopupContainer={(trigger) => trigger}
                          render={(text, record) => (
                            <Tooltip title='Go to job post detail'>
                              <span style={{ color: '#40a9ff', cursor: 'pointer' }}> {record.notificationID}</span>
                            </Tooltip>
                          )}
                          onCell={(record) => {
                            return {
                              onClick: () => {
                                router.push({
                                  pathname: `/job-posts/${record.jobPostID}`,
                                  query: { url: '/manage-applications/', expired: record.expired },
                                });
                              },
                            };
                          }}
                        />
                        <Column
                          title='Job Position'
                          dataIndex='description'
                          key='description'
                          // filters={jobsfilter}
                          // onFilter={(value, record) => record.description.indexOf(value) === 0}
                          sorter={(a, b) => a.description.localeCompare(b.description)}
                          {...getColumnSearchProps('description', 'Job Position')}
                          getPopupContainer={(trigger) => trigger}
                          render={(text, record) => (
                            <Tooltip title='Go to job post detail'>
                              <span style={{ color: '#40a9ff', cursor: 'pointer' }}> {record.description}</span>
                            </Tooltip>
                          )}
                          onCell={(record) => {
                            return {
                              onClick: () => {
                                router.push({
                                  pathname: `/job-posts/${record.jobPostID}`,
                                  query: { url: '/manage-applications/', expired: record.expired },
                                });
                              },
                            };
                          }}
                        />
                        <Column
                          title='Date of Application'
                          dataIndex='date_of_application'
                          key='date_of_application'
                          filters={startDateFilter}
                          onFilter={(value, record) => record.date_of_application.indexOf(value) === 0}
                          sorter={(a, b) => moment(a.date_of_application).unix() - moment(b.date_of_application).unix()}
                        />
                        <Column
                          title='Date of Closing'
                          dataIndex='date_of_closing'
                          key='date_of_closing'
                          filters={endDateFilter}
                          onFilter={(value, record) => record.date_of_closing.indexOf(value) === 0}
                          sorter={(a, b) => moment(a.date_of_closing).unix() - moment(b.date_of_closing).unix()}
                        />
                        <Column
                          title='Hiring Status'
                          key='applied_job_status'
                          filters={appliedStatus}
                          onFilter={(value, record) => record.applied_job_status.indexOf(value) === 0}
                          render={(text, record) => (
                            <Tag
                              key={record.applied_job_status}
                              style={{ textAlign: 'center', borderRadius: '40px' }}
                              className={`ant-tag-${record.applied_job_status}`}
                              color={
                                record.applied_job_status === 'applied'
                                  ? '#069633'
                                  : record.applied_job_status === 'shortlisted'
                                  ? '#069633'
                                  : record.applied_job_status === 'hired'
                                  ? '#384E77'
                                  : record.applied_job_status === 'payment pending'
                                  ? '#D3B636'
                                  : record.applied_job_status === 'appealed'
                                  ? '#D3B636'
                                  : record.applied_job_status === 'document pending'
                                  ? '#D3B636'
                                  : record.applied_job_status === 'rejected'
                                  ? '#D5202F'
                                  : '#39393A'
                              }
                            >
                              {record?.applied_job_status?.toUpperCase()}
                            </Tag>
                          )}
                        />
                        <Column
                          title='Action'
                          render={(text, record) =>
                            record.applied_job_status === 'rejected' && record.appeal === null ? (
                              <Space size='middle'>
                                <Tooltip title='Provide details to appeal against the rejetion for this job position'>
                                  <a href='#' onClick={() => openModal(record.key, record.description)}>
                                    Appeal
                                  </a>
                                </Tooltip>
                              </Space>
                            ) : record.applied_job_status === 'appealed' ? (
                              <Tooltip placement='bottom' title='Your appeal is in progress'>
                                <a href='#' onClick={() => {}} disabled>
                                  Appeal
                                </a>
                              </Tooltip>
                            ) : record.applied_job_status === 'payment pending' ? (
                              <Tooltip title='Please do the payment for this job position'>
                                <a
                                  href='#'
                                  onClick={() =>
                                    record.job_type === 'Permanent'
                                      ? redirectToPayment(record.jobPostID, record.position, record.key)
                                      : redirectToSubscribe(record.jobPostID, record.position, record.key)
                                  }
                                >
                                  {!record.expired ? `Complete Payment` : ``}
                                </a>
                              </Tooltip>
                            ) : record.applied_job_status === 'document pending' ? (
                              <Tooltip title='Upload the pending documents for this job position'>
                                <a
                                  href='#'
                                  onClick={() =>
                                    router.push({
                                      pathname: `/job-posts/document_upload`,
                                      query: {
                                        job_posting: record.jobPostID,
                                        position_id: record.position,
                                        applicantId: record.key,
                                        url: '/manage-applications/',
                                      },
                                    })
                                  }
                                >
                                  {!record.expired ? `Complete Document` : ``}
                                </a>
                              </Tooltip>
                            ) : record.applied_job_status === 'information pending' ? (
                              <Tooltip title='Update the missing mandatory information for this job position'>
                                <a
                                  href='#'
                                  onClick={() =>
                                    router.push(
                                      `/job-posts/require-information/?position_id=${record.position}&applicantId=${record.key}&job_posting_id=${record.jobPostID}`
                                    )
                                  }
                                >
                                  {!record.expired ? 'Complete Info' : ''}
                                </a>
                              </Tooltip>
                            ) : record.applied_job_status === 'applied' ? (
                              <Link
                                href={`/job-posts/application-preview/?job_posting_id=${record.jobPostID}&position_id=${record.position}&position=${record.description}`}
                              >
                                <Tooltip placement='top' title='Application Preview'>
                                  <a style={{ marginLeft: 10 }}>Preview</a>
                                </Tooltip>
                              </Link>
                            ) : (
                              ''
                            )
                          }
                        />
                      </Table>
                    </Col>
                  </Row>
                </ListingStyles>
              </Space>
            )}
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default ManageApplications;
