import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
// Components
import { Space, Row, Col, Input, message, Typography, Tooltip, notification, DatePicker, Popconfirm } from 'antd';
import Table from '@iso/components/uielements/table';
import Tag from '@iso/components/uielements/tag';
import Button from '@iso/components/uielements/button';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../containers/DashboardLayout/DashboardLayout';
import { SearchOutlined } from '@ant-design/icons';
// Hooks / API Calls
import { useAuthState } from '../../../src/components/auth/hook';
import useUser from '../../../src/components/auth/useUser';
import { getJobPostHistory } from '../../../src/apiCalls';
// Styles
import ListingStyles from '../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../containers/Admin/ManageJobPost/ManageJobPost.styles';

const JobPostTemporary = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [selectedRowKeys, setRowKeys] = useState([]);
  const searchInputRef = useRef(null);
  const [jobPosts, setJobPostsData] = useState();
  const [searchedColumn, setSearchedColumn] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const { Title } = Typography;
  const { Column } = Table;

  const getJobPostList = useCallback(async () => {
    const response = await getJobPostHistory(client);
    const filteredData = response.map((post, index) => ({
      key: index,
      jobPostID: post.job_posting_id,
      notificationID: post.notification_id,
      title: post.notification_title,
      job_posting_docs_path: post.job_posting_docs_path,
      dateOfOpening: post.publication_date ? moment(post.publication_date).format('YYYY-MM-DD') : '-',
      dateOfClosing: post.end_date ? moment(post.end_date).format('YYYY-MM-DD') : '-',
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
  }, []);

  useEffect(() => {
    if (user && user.isLoggedIn) getJobPostList();
  }, [user, client]);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <DatePicker
          ref={searchInputRef}
          placeholder={`Search ${dataIndex}`}
          format='YYYY-MM-DD'
          picker='month'
          value={moment(selectedKeys[0])}
          onChange={(e) => setSelectedKeys(e ? [moment(e).format('YYYY-MM-DD')] : [])}
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
    onFilter: (value, record) => (record[dataIndex] ? record[dataIndex].toString().includes(value) : ''),
    render: (text) => (searchedColumn === dataIndex ? <div>{text ? text.toString() : ''}</div> : text),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const onChangeStatus = async () => {
    await client.put(
      `job_posting/job_posting_history/`,
      selectedRowKeys.map((item) => item)
    );
    if (selectedRowKeys.length <= 0) {
      notification['error']({
        description: 'Information not available',
      });
    } else {
      notification['success']({
        description: 'Status Archived Successfully',
      });
      const response = await getJobPostHistory(client);
      setJobPostsData(
        response.map((post, index) => ({
          key: index,
          jobPostID: post.job_posting_id,
          notificationID: post.notification_id,
          title: post.notification_title,
          job_posting_docs_path: post.job_posting_docs_path,
          dateOfOpening: post.publication_date ? moment(post.publication_date).format('YYYY-MM-DD') : '-',
          dateOfClosing: post.end_date ? moment(post.end_date).format('DD-MM-YYYY') : '-',
          applied: post.applied_applicants,
          status: post.status,
        }))
      );
    }
  };

  const onSelectChange = (selectedRowKeys) => {
    setRowKeys(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <Head>
        <title>Job Post History</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <ListingStyles>
              <Row className='action-bar' gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Title level={3} type='primary'>
                    Job Post History
                  </Title>
                </Col>
                <Col xs={24} lg={12}>
                  <Row justify='end'>
                    <Row xs={24} lg={12}>
                      <Popconfirm
                        title='Do you want to changed status archive the selected job post?'
                        onConfirm={onChangeStatus}
                        onCancel={() => {}}
                      >
                        <Tooltip title='Click to archive the selected job post status'>
                          <Button type='primary'>Archive</Button>
                        </Tooltip>
                      </Popconfirm>
                    </Row>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={jobPosts}
                    getPopupContainer={(trigger) => trigger}
                    rowSelection={rowSelection}
                    rowKey={(record) => record.jobPostID}
                  >
                    <Column title='Sr.No' key='key' dataIndex='key' render={(text, record) => record.key + 1} />
                    <Column title='Job Posting ID' key='jobPostID' dataIndex='jobPostID' />
                    <Column
                      title='Notification ID'
                      dataIndex='notificationID'
                      key='notificationID'
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
                              query: { redirect: `/admin/job-post-history` },
                            });
                          },
                        };
                      }}
                    />
                    <Column
                      title='Title'
                      dataIndex='title'
                      key='title'
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
                              query: { redirect: `/admin/job-post-history` },
                            });
                          },
                        };
                      }}
                    />
                    <Column
                      title='Date of Opening'
                      dataIndex='dateOfOpening'
                      key='dateOfOpening'
                      {...getColumnSearchProps('dateOfOpening')}
                    />
                    <Column
                      title='Date of Closing'
                      dataIndex='dateOfClosing'
                      key='dateOfClosing'
                      {...getColumnSearchProps('dateOfClosing')}
                    />
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
                              : record.status === 'archived'
                              ? '#052c50'
                              : '#39393A'
                          }
                        >
                          {record.status.toUpperCase()}
                        </Tag>
                      )}
                    />
                    <Column title='Document Path' dataIndex='job_posting_docs_path' key='job_posting_docs_path' />
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
