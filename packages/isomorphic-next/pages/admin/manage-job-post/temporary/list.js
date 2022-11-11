import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import Link from 'next/link';
import { CSVLink } from 'react-csv';
// Components
import { Space, Row, Col, Input, notification, Popconfirm, Typography, Tooltip } from 'antd';
import Table from '@iso/components/uielements/table';
import Tag from '@iso/components/uielements/tag';
import Button from '@iso/components/uielements/button';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import { SearchOutlined } from '@ant-design/icons';
// Hooks / API Calls
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';
import { deleteJobPost, getJobPostContractBasis } from '../../../../src/apiCalls';
// Styles
import ListingStyles from '../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';

import { JOB_POSTING_T, APPLICATION_SCRUTINY } from '../../../../static/constants/userRoles';

const csvHeaders = [
  { label: 'Notification ID', key: 'notificationID' },
  { label: 'Title', key: 'title' },
  { label: 'Date of Opening', key: 'dateOfOpening' },
  { label: 'Date of Closing', key: 'dateOfClosing' },
  { label: 'Applied', key: 'applied' },
  { label: 'Status', key: 'status' },
];

const JobPostTemporary = () => {
  const { client } = useAuthState();
  const { user, roles } = useUser({});
  const userRole = roles && roles.length ? roles : '';
  const router = useRouter();

  const searchInputRef = useRef(null);

  const [jobPosts, setJobPostsData] = useState();
  const [csvData, setCsvDataData] = useState({});
  const [searchedColumn, setSearchedColumn] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const { Title } = Typography;
  const { Column } = Table;

  const getJobPostList = useCallback(async () => {
    const response = await getJobPostContractBasis(client);
    const filteredData = response.map((post, index) => ({
      key: index,
      jobPostID: post.job_posting_id,
      notificationID: post.notification_id,
      title: post.notification_title,
      dateOfOpening: post.publication_date ? moment(post.publication_date).format('DD-MM-YYYY') : '-',
      dateOfClosing: post.end_date ? moment(post.end_date).format('DD-MM-YYYY') : '-',
      applied: post.applied_applicants,
      // TODO: require all status and color code
      status: post.status,
    }));

    const csvFilteredData = response.map((post) => ({
      notificationID: post.notification_id,
      title: post.notification_title,
      dateOfOpening: post.publication_date ? moment(post.publication_date).format('DD-MM-YYYY') : '-',
      dateOfClosing: post.end_date ? moment(post.end_date).format('DD-MM-YYYY') : '-',
      applied: post.applied_applicants,
      // TODO: require all status and color code
      status: post.status,
    }));
    const statusList = response.map((res) => ({
      text: res.status.toUpperCase(),
      value: res.status,
    }));
    setStatusFilters(statusList.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
    setJobPostsData(filteredData);
    setCsvDataData(csvFilteredData);
  }, []);

  useEffect(() => {
    if (user && user.isLoggedIn) getJobPostList();
  }, [user, client]);

  const deleteJobPostHandler = async (id, status) => {
    if (status !== 'published') {
      const formRequest = {
        is_deleted: true,
      };
      const formResponse = await deleteJobPost(client, formRequest, id);
      if (formResponse) {
        notification['success']({
          description: `Job post deleted successfully`,
        });
        getJobPostList();
      }
    } else {
      notification['warning']({
        description: `Published job posts can't be deleted`,
      });
    }
  };

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
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    render: (text) =>
      searchedColumn === dataIndex ? (
        <div>{dataIndex === 'title' || 'notificationID' ? <a>{text.toString()}</a> : text.toString()}</div>
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

  const nameWithTimestamp = `job_post_temp_${
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
        <title>Manage Jobs (Temporary Jobs)</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <ListingStyles>
              <Row className='action-bar' gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Title level={3} type='primary'>
                    Manage Jobs (Temporary Jobs)
                  </Title>
                </Col>
                <Col xs={24} lg={12}>
                  <Row justify='end'>
                    <Col lg={12}>{/* <DropdownButton overlay={menuClicked}>Dropdown</DropdownButton> */}</Col>
                    <Row xs={24} lg={12}>
                      {csvData && csvData.length > 0 && (
                        <CSVLink data={csvData} headers={csvHeaders} filename={nameWithTimestamp}>
                          <Button type='primary'>Export to CSV</Button>
                        </CSVLink>
                      )}
                      {[JOB_POSTING_T].some((r) => userRole.indexOf(r) >= 0) && (
                        <Button type='primary' onClick={() => router.push('/admin/manage-job-post/temporary/add')}>
                          Add New
                        </Button>
                      )}
                    </Row>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Table dataSource={jobPosts} getPopupContainer={(trigger) => trigger}>
                    <Column
                      title='Sr.No'
                      key='key'
                      dataIndex='key'
                      width='8%'
                      render={(text, record) => record.key + 1}
                    />
                    <Column
                      title='Notification ID'
                      dataIndex='notificationID'
                      key='notificationID'
                      width='20%'
                      sorter={(a, b) => a.notificationID.localeCompare(b.notificationID)}
                      {...getColumnSearchProps('notificationID')}
                      render={(text, record) => (
                        <Tooltip title='Go to job post detail'>
                          <span style={{ color: '#40a9ff', cursor: 'pointer' }}> {record.notificationID}</span>
                        </Tooltip>
                      )}
                      onCell={(record) => {
                        return {
                          onClick: () => {
                            router.push({
                              pathname: `/admin/manage-job-post/details/${record.jobPostID}`,
                              query: { redirect: `/admin/manage-job-post/temporary/list` },
                            });
                          },
                        };
                      }}
                    />
                    <Column
                      title='Title'
                      dataIndex='title'
                      key='title'
                      width='35%'
                      sorter={(a, b) => a.title.localeCompare(b.title)}
                      {...getColumnSearchProps('title')}
                      render={(text, record) => (
                        <Tooltip title='Go to job post detail'>
                          <span style={{ color: '#40a9ff', cursor: 'pointer' }}> {record.title}</span>
                        </Tooltip>
                      )}
                      onCell={(record) => {
                        return {
                          onClick: () => {
                            router.push({
                              pathname: `/admin/manage-job-post/details/${record.jobPostID}`,
                              query: { redirect: `/admin/manage-job-post/temporary/list` },
                            });
                          },
                        };
                      }}
                    />
                    <Column
                      title='Date of Opening'
                      dataIndex='dateOfOpening'
                      key='dateOfOpening'
                      width='140px'
                      sorter={(a, b) => a.dateOfOpening.localeCompare(b.dateOfOpening)}
                    />
                    <Column
                      title='Date of Closing'
                      dataIndex='dateOfClosing'
                      key='dateOfClosing'
                      width='140px'
                      sorter={(a, b) => a.dateOfClosing.localeCompare(b.dateOfClosing)}
                    />
                    <Column title='Applied' dataIndex='applied' key='applied' />
                    <Column
                      title='Status'
                      key='status'
                      filters={statusFilters}
                      onFilter={(value, record) => record.status.indexOf(value) === 0}
                      render={(text, record) => (
                        <Tag
                          className={`ant-tag-${record.status}`}
                          key={record.status}
                          color={
                            record.status === 'published'
                              ? '#069633'
                              : record.status === 'on hold'
                              ? '#D3B636'
                              : '#39393A'
                          }
                        >
                          {record.status.toUpperCase()}
                        </Tag>
                      )}
                    />
                    <Column
                      title='Action'
                      key='action'
                      width='5%'
                      render={(text, record) => (
                        <Space size='small'>
                          {[JOB_POSTING_T].some((r) => userRole.indexOf(r) >= 0) && (
                            <Link href={`/admin/manage-job-post/temporary/edit/${record.jobPostID}`}>
                              <a href={`/admin/manage-job-post/temporary/edit/${record.jobPostID}`}>
                                <Tooltip placement='bottom' title='Edit'>
                                  <EditTwoTone />
                                </Tooltip>
                              </a>
                            </Link>
                          )}
                          {[JOB_POSTING_T].some((r) => userRole.indexOf(r) >= 0) && (
                            <Popconfirm
                              title='Are you sure delete this job?'
                              okText='Yes'
                              cancelText='No'
                              onConfirm={() => deleteJobPostHandler(record.jobPostID, record.status)}
                              getPopupContainer={(trigger) => trigger.parentNode}
                              placement='left'
                            >
                              <Tooltip placement='bottom' title='Delete'>
                                <DeleteTwoTone />
                              </Tooltip>
                            </Popconfirm>
                          )}
                          {[APPLICATION_SCRUTINY].some((r) => userRole.indexOf(r) >= 0) && (
                            <Tooltip title='Go to applicants list'>
                              <Button
                                type='text'
                                onClick={() => {
                                  router.push(`/admin/manage-job-post/applicants/${record.jobPostID}?type=temporary`);
                                }}
                              >
                                Applicants
                              </Button>
                            </Tooltip>
                          )}
                        </Space>
                      )}
                    />
                  </Table>
                </Col>
              </Row>
            </ListingStyles>
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

JobPostTemporary.propTypes = {
  response: PropTypes.arrayOf(PropTypes.object),
};

JobPostTemporary.defaultProps = {
  response: [],
};

export default JobPostTemporary;
