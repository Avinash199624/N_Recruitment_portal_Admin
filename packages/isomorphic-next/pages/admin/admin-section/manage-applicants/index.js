import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Space, Row, Col, Popconfirm, notification, Input, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { LockTwoTone, UnlockTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone } from '@ant-design/icons';
import Table from '@iso/components/uielements/table';
import Button from '@iso/components/uielements/button';
import { InputSearch } from '@iso/components/uielements/input';
import { useAuthState } from '../../../../src/components/auth/hook';
import PageHeader from '@iso/components/utility/pageHeader';
import useUser from '../../../../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import ListingStyles from '../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';

const Applicants = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [applicants, setApplicants] = useState();
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/user/manage_applicants/');
      if (!response.data.isEmpty) {
        const dataSource = response.data.map((res, index) => ({
          key: res.user_id,
          sr_no: index + 1,
          first_name: res.first_name,
          last_name: res.last_name,
          email: res.email,
          mobile_no: res.mobile_no,
          is_locked: res.is_locked,
          is_suspended: res.is_suspended,
        }));
        setApplicants(dataSource);
        setLoading(false);
      }
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmDelete = async (id) => {
    await client.delete(`/user/manage_applicants/${id}/ `);
    const data = applicants.filter((document) => document.key !== id);
    setApplicants(data);
    notification['success']({
      description: 'Applicant deleted successfully',
    });
  };

  const onConfirmCheckSuspend = async (id, suspended) => {
    await client.put(`/user/applicant_suspend/${id}/`, {
      is_suspended: !suspended,
    });
    if (suspended == false) {
      notification['success']({
        description: 'User suspended successfully',
      });
    } else {
      notification['success']({
        description: 'Suspend reverted successfully',
      });
    }
    const response = await client.get('/user/manage_applicants/');
    if (!response.data.isEmpty) {
      const dataSource = response.data.map((res, index) => ({
        key: res.user_id,
        sr_no: index + 1,
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
        mobile_no: res.mobile_no,
        is_locked: res.is_locked,
        is_suspended: res.is_suspended,
      }));
      setApplicants(dataSource);
      setLoading(false);
    }
  };

  const onConfirmCheckLock = async (id, locked) => {
    await client.put(`/user/applicant_locked/${id}/`, {
      is_locked: !locked,
    });
    if (locked == false) {
      notification['success']({
        description: 'User locked successfully',
      });
    } else {
      notification['success']({
        description: 'User unlocked successfully',
      });
    }
    const response = await client.get('/user/manage_applicants/');
    if (!response.data.isEmpty) {
      const dataSource = response.data.map((res, index) => ({
        key: res.user_id,
        sr_no: index + 1,
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
        mobile_no: res.mobile_no,
        is_locked: res.is_locked,
        is_suspended: res.is_suspended,
      }));
      setApplicants(dataSource);
      setLoading(false);
    }
  };

  const getColumnSearchProps = (dataIndex, name) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${name}`}
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
    render: (text) => (searchedColumn === dataIndex ? <div>{text ? text.toString() : ''}</div> : text),
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
        <title>Applicants List</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Applicant List</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Row span={12}></Row>
                    </Row>
                  </Col>
                </Row>
                <ListingStyles>
                  <Row>
                    <Col span={24}>
                      <Table dataSource={applicants} getPopupContainer={(trigger) => trigger.parentNode}>
                        <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                        <Column
                          title='First Name'
                          dataIndex='first_name'
                          key='first_name'
                          sorter={(a, b) => a.first_name.localeCompare(b.first_name)}
                          {...getColumnSearchProps('first_name', 'First Name')}
                        />
                        <Column
                          title='Last Name'
                          dataIndex='last_name'
                          key='last_name'
                          sorter={(a, b) => a.last_name.localeCompare(b.last_name)}
                          {...getColumnSearchProps('last_name', 'Last Name')}
                        />
                        <Column
                          title='Email'
                          dataIndex='email'
                          key='email'
                          {...getColumnSearchProps('email', 'Email')}
                        />
                        <Column title='Mobile No' dataIndex='mobile_no' key='mobile_no' />
                        <Column
                          title='Action'
                          key='action'
                          width='5%'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Popconfirm
                                title={
                                  record.is_locked
                                    ? 'Are you sure to unlock this applicant?'
                                    : 'Are you sure to lock this applicant?'
                                }
                                onConfirm={() => onConfirmCheckLock(record.key, record.is_locked)}
                                onCancel={() => {}}
                                getPopupContainer={(trigger) => trigger.parentNode}
                                placement='left'
                              >
                                <Tooltip placement='bottom' title={record.is_locked ? 'Unlock' : 'Lock'}>
                                  {record.is_locked ? <LockTwoTone /> : <UnlockTwoTone />}
                                </Tooltip>
                              </Popconfirm>
                              <Popconfirm
                                title={
                                  record.is_suspended
                                    ? 'Are you sure to revert this applicant? '
                                    : 'Are you sure to suspend this applicant?'
                                }
                                onConfirm={() => onConfirmCheckSuspend(record.key, record.is_suspended)}
                                onCancel={() => {}}
                                getPopupContainer={(trigger) => trigger.parentNode}
                                placement='left'
                              >
                                <Tooltip placement='bottom' title={record.is_suspended ? 'Revert' : 'Suspend'}>
                                  {record.is_suspended ? <CheckCircleTwoTone /> : <CloseCircleTwoTone />}
                                </Tooltip>
                              </Popconfirm>
                              <Popconfirm
                                title='Are you sure to delete this applicant?'
                                onConfirm={() => onConfirmDelete(record.key)}
                                onCancel={() => {}}
                                getPopupContainer={(trigger) => trigger.parentNode}
                                placement='left'
                              >
                                <Tooltip placement='bottom' title='Delete'>
                                  <DeleteTwoTone />
                                </Tooltip>
                              </Popconfirm>
                            </Space>
                          )}
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

export default Applicants;
