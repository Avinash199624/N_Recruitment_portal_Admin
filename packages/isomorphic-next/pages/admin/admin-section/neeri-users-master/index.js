import React, { useEffect, useState, useRef } from 'react';
import { useAuthState } from '../../../../src/components/auth/hook';
import Table from '@iso/components/uielements/table';
import useUser from '../../../../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import Head from 'next/head';
import Button from '@iso/components/uielements/button';
import { Space, Row, Col, Popconfirm, notification, Input, Tooltip, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { DropdownMenu, MenuItem } from '@iso/components/uielements/dropdown';
import ListingStyles from '../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import Link from 'next/link';
import PageHeader from '@iso/components/utility/pageHeader';

const menuClicked = (
  <DropdownMenu>
    <MenuItem key='1'>1st menu item</MenuItem>
    <MenuItem key='2'>2nd menu item</MenuItem>
    <MenuItem key='3'>3d menu item</MenuItem>
  </DropdownMenu>
);

const NeeriUsers = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const [userlist, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/user/public/neeri_user_personal_info/');
      const dataSource = response.data.map((res, index) => ({
        key: res.user_id,
        sr_no: index + 1,
        name: res.first_name + ' ' + res.last_name,
        email: res.email,
        mobile_no: res.mobile_no,
        date_of_birth: res.date_of_birth,
        division: res.division,
        zonal: res.zonal,
      }));
      setUsers(dataSource);
      setLoading(false);
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmDelete = async (id) => {
    await client.delete(`/user/neeri_user/${id}/ `);
    const data = userlist.filter((user) => user.key !== id);
    setUsers(data);
    notification['success']({
      description: 'User deleted successfully',
    });
  };

  const getColumnSearchProps = (dataIndex, search_placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${search_placeholder}`}
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
        <title>Neeri Users</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ListingStyles>
                <PageHeader>Neeri Users</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Row span={12}>
                        <Button
                          type='primary'
                          onClick={() => router.push('/admin/admin-section/neeri-users-master/add-user')}
                        >
                          Add New
                        </Button>
                      </Row>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Table dataSource={userlist} getPopupContainer={(trigger) => trigger.parentNode}>
                      <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                      <Column
                        title='Name'
                        dataIndex='name'
                        key='name'
                        sorter={(a, b) => a.name.localeCompare(b.name)}
                        {...getColumnSearchProps('name', 'Name')}
                      />
                      {/* <Column
                        title='Last Name'
                        dataIndex='last_name'
                        key='last_name'
                        sorter={(a, b) => a.last_name.localeCompare(b.last_name)}
                        {...getColumnSearchProps('last_name', 'Last Name')}
                      /> */}
                      <Column
                        title='Email'
                        dataIndex='email'
                        key='email'
                        sorter={(a, b) => a.email.localeCompare(b.last_name)}
                        {...getColumnSearchProps('email', 'Email')}
                      />
                      <Column
                        title='Mobile No'
                        dataIndex='mobile_no'
                        key='mobile_no'
                        {...getColumnSearchProps('mobile_no', 'Mobile No')}
                      />
                      <Column
                        title='Divisions'
                        dataIndex='division'
                        key='division'
                        render={(division) => division.map((div) => <Tag>{div.division_name}</Tag>)}
                      />
                      <Column
                        title='Zones'
                        dataIndex='zonal'
                        key='zonal'
                        render={(zonal) => zonal.map((zone) => <Tag>{zone.zonal_lab_name}</Tag>)}
                      />
                      <Column
                        title='Action'
                        key='user_id'
                        width='5%'
                        render={(text, record) => (
                          <Space size='middle'>
                            <Link href={`/admin/admin-section/neeri-users-master/edit/${record.key}`}>
                              <Tooltip placement='bottom' title='Edit'>
                                <EditTwoTone />
                              </Tooltip>
                            </Link>

                            <Popconfirm
                              title='Are you sure to delete this user?'
                              onConfirm={() => onConfirmDelete(record.key)}
                              onCancel={() => {}}
                              getPopupContainer={(trigger) => trigger.parentNode}
                              placement='left'
                            >
                              <a href='#'>
                                <Tooltip placement='bottom' title='Delete'>
                                  <DeleteTwoTone />
                                </Tooltip>
                              </a>
                            </Popconfirm>
                          </Space>
                        )}
                      />
                    </Table>
                  </Col>
                </Row>
              </ListingStyles>
            )}
          </ManageJobPostStyles>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default NeeriUsers;
