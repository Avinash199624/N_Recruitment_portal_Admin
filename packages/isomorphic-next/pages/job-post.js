import React, { useEffect, useState } from 'react';
import { useAuthState } from '../src/components/auth/hook';
import Table from '@iso/components/uielements/table';
import useUser from '../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../containers/DashboardLayout/DashboardLayout';
import ManageJobPostStyles from '../containers/Admin/ManageJobPost/ManageJobPost.styles';
import ListingStyles from '../styled/Listing.styles';
import { InputSearch } from '@iso/components/uielements/input';
import { Space, Card } from 'antd';

const JobPost = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/job_posting/job_posting_list/');
      if (!response.data.isEmpty) {
        const dataSource = response.data.map((res) => ({
          key: res.job_posting_id,
          description: res.description,
          publication_date: res.publication_date,
          end_date: res.end_date,
          status: res.status,
          job_type: res.job_type,
        }));
        setJobs(dataSource);
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (loading) return <p>loading...</p>;

  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date of Opening',
      dataIndex: 'publication_date',
      key: 'publication_date',
    },
    {
      title: 'Date of Closing',
      dataIndex: 'end_date',
      key: 'end_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Job Type',
      dataIndex: 'job_type',
      key: 'job_type',
    },
  ];

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <DashboardLayout>
      <LayoutContentWrapper>
        <ManageJobPostStyles>
          <Space direction='vertical' style={{ width: '100%' }}>
            <InputSearch placeholder='Search' style={{ width: '50%' }} />
            <ListingStyles>
              <Table dataSource={jobs} columns={columns} />
            </ListingStyles>
          </Space>
        </ManageJobPostStyles>
      </LayoutContentWrapper>
    </DashboardLayout>
  );
};

export default JobPost;
