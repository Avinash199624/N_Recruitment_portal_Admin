import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import useUser from '../../src/components/auth/useUser';
import Head from 'next/head';
// Components
import { Space, Input, Tooltip } from 'antd';
import PageHeader from '@iso/components/utility/pageHeader';
import Button from '@iso/components/uielements/button';
import Table from '@iso/components/uielements/table';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import { SearchOutlined } from '@ant-design/icons';
import { useAuthState } from '../../src/components/auth/hook';
// Hooks / API Calls
import { jobTypesFilters, jobTypes } from '../../src/constants';

const styles = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
};

const JobPosts = () => {
  const router = useRouter();
  const searchInputRef = useRef(null);
  const { client } = useAuthState();
  const [jobs, setJobs] = useState([]);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [fees, setFees] = useState([]);
  const [jobTypeFilters, setJobTypes] = useState([]);
  const { user } = useUser({});

  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      try {
        const response = await client.get(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/job_posting_list/applicant/`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.data.isEmpty) {
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
          const jobTypes =
            response.data &&
            response.data.map((res, index) => ({
              value: res.job_type,
              text: res.job_type.replace(/_/g, ' '),
            }));
          setJobTypes(
            jobTypes.length > 0 ? jobTypes.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id) : []
          );
        }
      } catch (error) {
        router.push('/404');
      }
    };

    const loadFees = async () => {
      const response = await client.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/job_posting/fee/fee_list/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.data.isEmpty) {
        const data =
          response &&
          response.data.length > 0 &&
          response.data.map((res, index) => {
            return {
              id: res.id,
              fee: res.fee,
              category: res.category,
            };
          });
        setFees(data);
      }
    };

    load();
    if (user && user.isLoggedIn) loadFees();
  }, []);

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
              <Column title='Sr.No' key='key' dataIndex='key' width='8%' render={(text, record) => record.key + 1} />
              <Column
                title='Notification ID'
                dataIndex='notificationID'
                key='notificationID'
                width='15%'
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
                filters={jobTypeFilters}
                onFilter={(value, record) => record.job_type.indexOf(value) === 0}
                render={(text, record) => <div key={record.job_type}>{jobTypes[record.job_type]}</div>}
                getPopupContainer={(trigger) => trigger.parentNode}
              />
            </Table>
          </div>
        </LayoutWrapper>
      </DashboardLayout>
    </>
  );
};

export default JobPosts;
