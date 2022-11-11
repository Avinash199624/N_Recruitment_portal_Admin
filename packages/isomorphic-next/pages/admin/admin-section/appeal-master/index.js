import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Space, Row, Col, Popconfirm, Input, Tooltip, notification } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
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

const Appeal = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [appeals, setAppeals] = useState();
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/job_posting/appeal_reason_master/');
      if (!response.data.isEmpty) {
        const dataSource = response.data.map((res, index) => ({
          sr_no: index + 1,
          key: res.appeal_id,
          appeal_reason_master: res.appeal_reason_master,
        }));
        setAppeals(dataSource);
        setLoading(false);
      }
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmDelete = async (id) => {
    await client.delete(`/job_posting/appeal_reason_master/${id}/ `);
    const data = appeals.filter((document) => document.key !== id);
    setAppeals(data);
    notification['success']({
      description: 'Appeal reason deleted successfully',
    });
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
        <title>Appeal List</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Appeal List</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Row span={12}>
                        <Link href='/admin/admin-section/appeal-master/add'>
                          <Button type='primary'>Add New</Button>
                        </Link>
                      </Row>
                    </Row>
                  </Col>
                </Row>
                <ListingStyles>
                  <Row>
                    <Col span={24}>
                      <Table dataSource={appeals} getPopupContainer={(trigger) => trigger.parentNode}>
                        <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                        <Column
                          title='Appeal Name'
                          dataIndex='appeal_reason_master'
                          key='appeal_reason_master'
                          sorter={(a, b) => a.appeal_reason_master.localeCompare(b.appeal_reason_master)}
                          {...getColumnSearchProps('appeal_reason_master', 'Appeal Name')}
                        />
                        <Column
                          title='Action'
                          key='action'
                          width='5%'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Link href={`/admin/admin-section/appeal-master/edit/${record.key}`}>
                                <a href={`/admin/admin-section/appeal-master/edit/${record.key}`}>
                                  <Tooltip placement='bottom' title='Edit'>
                                    <EditTwoTone />
                                  </Tooltip>
                                </a>
                              </Link>
                              <Popconfirm
                                title='Are you sure to delete this appeal?'
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

export default Appeal;
