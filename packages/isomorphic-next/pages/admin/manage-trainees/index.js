import React, { useState, useEffect, useRef } from 'react';
import Table from '@iso/components/uielements/table';
import useUser from '../../../src/components/auth/useUser';
import { useAuthState } from '../../../src/components/auth/hook';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../containers/DashboardLayout/DashboardLayout';
import ManageJobPostStyles from '../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import Button from '@iso/components/uielements/button';
import { Space, Row, Col, Tag, Popconfirm, notification, Select, Input, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { EditTwoTone, DeleteTwoTone, BankTwoTone } from '@ant-design/icons';
import PageHeader from '@iso/components/utility/pageHeader';
import ListingStyles from '../../../styled/Listing.styles';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import { traineeStatus, traineeStatusFilters } from '../../../src/constants';

const { Option } = Select;

const csvHeaders = [
  { label: 'Trainee Name', key: 'trainee_name' },
  { label: 'Department', key: 'division' },
  { label: 'Mentor', key: 'mentor' },
  { label: 'Email', key: 'email' },
  { label: 'Employee Start Date', key: 'emp_start_date' },
  { label: 'Employee End Date', key: 'emp_end_date' },
  { label: 'Status', key: 'status' },
];

const TraineeList = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState();
  const [csvData, setCsvDataData] = useState();
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [departmentFilters, setDepartmtFilters] = useState([]);
  const [mentorFilters, setMntrFilters] = useState([]);
  const { Column } = Table;
  const router = useRouter();

  useEffect(() => {
    var obj = JSON.parse(window.localStorage.getItem('authUser'));
    const load = async () => {
      const response = await client.get('/user/trainee/');

      if (!response.data.isEmpty) {
        const dataSource = response.data.map((res, index) => ({
          key: res.trainee_id,
          sr_no: index + 1,
          user: res.user,
          trainee_name: `${res.first_name} ${res.last_name}`,
          division: res.division.division_name,
          division_id: res.division.division_id,
          mentor: res.mentor.mentor_name,
          mentor_id: res.mentor.mentor_id,
          email: res.email,
          emp_end_date: res.emp_end_date,
          status: res.status,
        }));
        const depFilters = response.data.map((res) => ({
          text: res.division.division_name,
          value: res.division.division_id,
        }));
        const mntrFilters = response.data.map((res) => ({
          text: res.mentor.mentor_name,
          value: res.mentor.mentor_id,
        }));
        const csvFilteredData = response.data.map((res) => ({
          trainee_name: `${res.first_name} ${res.last_name}`,
          division: res.division.division_name,
          mentor: res.mentor.mentor_name,
          email: res.email,
          emp_start_date: res.emp_start_date,
          emp_end_date: res.emp_end_date,
          status: res.status,
        }));
        setDepartmtFilters(depFilters.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
        setMntrFilters(mntrFilters.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
        setCsvDataData(csvFilteredData);
        setTrainees(dataSource);
        setLoading(false);
      }
    };

    if (user && user.isLoggedIn) {
      load();
    }
  }, [user, client]);

  const onConfirmDelete = async (id) => {
    await client.delete(`/user/trainee/${id}/ `);
    const data = trainees.filter((user) => user.user !== id);
    setTrainees(data);
    notification['success']({
      description: `Trainee deleted Successfully`,
    });
  };

  const getColumnSearchProps = (dataIndex, searchPlaceholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInputRef}
          placeholder={`Search ${searchPlaceholder}`}
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
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#000' : undefined }} />,
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

  const nameWithTimestamp = `trainee_list_${
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
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Trainee List</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Row span={12}>
                        {csvData && csvData.length > 0 && (
                          <CSVLink data={csvData} headers={csvHeaders} filename={nameWithTimestamp}>
                            <Button className='ant-btn-secondary' type='button'>
                              Export to CSV
                            </Button>
                          </CSVLink>
                        )}
                        <Button type='primary' onClick={() => router.push('/admin/manage-trainees/add')}>
                          Add New
                        </Button>
                      </Row>
                    </Row>
                  </Col>
                </Row>
                <ListingStyles>
                  {/* <Table dataSource={jobs} columns={columns} /> */}
                  <Row>
                    <Col span={24}>
                      <Table dataSource={trainees}>
                        <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                        <Column
                          title='Department'
                          dataIndex='division'
                          key='division'
                          filters={departmentFilters}
                          onFilter={(value, record) => record.division_id.indexOf(value) === 0}
                        />
                        <Column
                          title='Mentor'
                          dataIndex='mentor'
                          key='mentor'
                          filters={mentorFilters}
                          onFilter={(value, record) => record.mentor_id.indexOf(value) === 0}
                        />
                        <Column
                          title='Trainee Name'
                          dataIndex='trainee_name'
                          key='trainee_name'
                          sorter={(a, b) => a.trainee_name.localeCompare(b.trainee_name)}
                          {...getColumnSearchProps('trainee_name', 'Trainee Name')}
                        />
                        <Column
                          title='Email'
                          dataIndex='email'
                          key='email'
                          sorter={(a, b) => a.email.length - b.email.length}
                          {...getColumnSearchProps('email', 'Email')}
                        />
                        <Column
                          title='Employee Till'
                          dataIndex='emp_end_date'
                          key='emp_end_date'
                          sorter={(a, b) => moment(a.emp_end_date).unix() - moment(b.emp_end_date).unix()}
                        />
                        <Column
                          title='Status'
                          key='status'
                          filters={traineeStatusFilters}
                          onFilter={(value, record) => record.status.indexOf(value) === 0}
                          render={(text, record) => (
                            <Tag
                              traineeStatus={[record.status]}
                              key={record.status}
                              style={{ width: '90px', textAlign: 'center' }}
                              color={
                                record.status == 'active' ? 'blue' : record.status == 'completed' ? 'green' : 'red'
                              }
                            >
                              {record.status.toUpperCase()}
                            </Tag>
                          )}
                        />
                        <Column
                          title='Action'
                          key='trainee_id'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Link href={`/admin/manage-trainees/edit/${record.user}`}>
                                <Tooltip placement='bottom' title='Edit'>
                                  <EditTwoTone />
                                </Tooltip>
                              </Link>
                              <Popconfirm
                                title='Are you sure to delete this trainee?'
                                onConfirm={() => onConfirmDelete(record.user)}
                                onCancel={() => {}}
                              >
                                <Tooltip placement='bottom' title='Delete'>
                                  <a href='#'>
                                    <DeleteTwoTone />
                                  </a>
                                </Tooltip>
                              </Popconfirm>
                              <Link href={`/admin/manage-trainees/payment-list/${record.user}`}>
                                <Tooltip placement='bottom' title='Go to payment list'>
                                  <BankTwoTone />
                                </Tooltip>
                              </Link>
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

export default TraineeList;
