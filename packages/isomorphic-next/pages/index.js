import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Components
import { Space, Input, Tooltip } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';
import Button from '@iso/components/uielements/button';
import Table from '@iso/components/uielements/table';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import { SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../containers/DashboardLayout/DashboardLayout';
// Hooks / API Calls
import { jobTypesFilters, jobTypes } from '../src/constants';

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
};

export const getStaticProps = async () => {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/cron_job/`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response) {
    return {
      props: { jobPostUpdateResponse: response.data },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once day 86400 seconds
      // revalidate: 43200
      revalidate: 120,
    };
  }
};

const JobPosts = () => {
  const router = useRouter();
  const searchInputRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [searchedColumn, setSearchedColumn] = useState('');

  const { Column } = Table;

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

      const data =
        response &&
        response.data.length > 0 &&
        response.data.map((res, index) => {
          return {
            key: index,
            jobPostID: res.job_posting_id,
            notificationID: res.notification_id,
            title: res.notification_title,
            publication_date: res.publication_date && moment(res.publication_date).format('DD-MM-YYYY'),
            end_date: res.end_date && moment(res.end_date).format('DD-MM-YYYY'),
            job_type: res.job_type,
            manpower_positions: res.manpower_positions,
            expired: moment(res.end_date).isBefore(moment(new Date()).format('YYYY-MM-DD')),
          };
        });
      setJobs(data);
    };

    load();
  }, []);

  const getColumnSearchProps = (dataIndex, searchLabel) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${searchLabel}`}
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

  return (
    <>
      <Head>
        <title>Job Posts</title>
      </Head>
      <DashboardLayout>
        <LayoutWrapper>
          <div style={styles.row}>
            <PageHeader>Job Posts</PageHeader>
            <Table dataSource={jobs} getPopupContainer={(trigger) => trigger}>
              <Column
                title='Sr.No'
                key='key'
                dataIndex='key'
                width='8%'
                sorter={(a, b) => a.key - b.key}
                render={(text, record) => record.key + 1}
              />
              <Column
                title='Notification ID'
                dataIndex='notificationID'
                key='notificationID'
                width='15%'
                sorter={(a, b) => a.notificationID.localeCompare(b.notificationID)}
                {...getColumnSearchProps('notificationID', 'Notification Id')}
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
                        query: { url: '/job-posts/', expired: record.expired },
                      });
                    },
                  };
                }}
              />
              <Column
                title='Title'
                dataIndex='title'
                key='title'
                width='30%'
                sorter={(a, b) => a.title.localeCompare(b.title.length)}
                {...getColumnSearchProps('title', 'Title')}
                render={(text, record) => (
                  <Tooltip title='Go to job post detail'>
                    <span style={{ color: '#40a9ff', cursor: 'pointer' }}> {record.title}</span>
                  </Tooltip>
                )}
                onCell={(record) => {
                  return {
                    onClick: () => {
                      router.push({
                        pathname: `/job-posts/${record.jobPostID}`,
                        query: { url: '/job-posts/', expired: record.expired },
                      });
                    },
                  };
                }}
              />
              <Column
                title='Positions'
                dataIndex='positions'
                key='positions'
                render={(text, record) =>
                  record.manpower_positions.map((position, index) => {
                    if (record.manpower_positions.length > 1) {
                      return <span key={index}>{(index ? ' / ' : '') + position.position}</span>;
                    } else {
                      return position.position;
                    }
                  })
                }
              />
              <Column title='Date of Opening' dataIndex='publication_date' key='publication_date' />
              <Column title='Date of Closing' dataIndex='end_date' key='end_date' />
              <Column
                title='Recruitment Type'
                dataIndex='job_type'
                key='job_type'
                filters={jobTypesFilters}
                onFilter={(value, record) => record.job_type.indexOf(value) === 0}
                render={(text, record) => <div key={record.job_type}>{jobTypes[record.job_type]}</div>}
              />
            </Table>
          </div>
        </LayoutWrapper>
      </DashboardLayout>
    </>
  );
};

JobPosts.defaultProps = {
  jobPostUpdateResponse: {},
};

JobPosts.propTypes = {
  jobPostUpdateResponse: PropTypes.object,
};

export default JobPosts;
