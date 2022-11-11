import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Space, Row, Col, Popconfirm, notification, Input, Tooltip, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import Table from '@iso/components/uielements/table';
import Button from '@iso/components/uielements/button';
import PageHeader from '@iso/components/utility/pageHeader';
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import ListingStyles from '../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

const ContentTemplateMaster = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const [templates, setTemplate] = useState([]);
  const [commtypes, setCommtypes] = useState([]);
  const [actiontypes, setActiontypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [actionStatusFilters, setActionStatusFilters] = useState([]);
  const [commStatusFilters, setCommStatusFilters] = useState([]);
  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      const response = await client.get('/template/template_list/');
      const commtype = await client.get('/template/template_type_list/');
      const actiontype = await client.get('/template/template_action_type_list/');

      const dataSource = response.data.map((res, index) => ({
        sr_no: index + 1,
        key: res.communication_id,
        communication_name: res.communication_name,
        subject: res.subject,
        body: res.body,
        action_type: res.action_type.comm_action_type,
        comm_type: res.comm_type.communication_type,
        is_active: res.is_active,
      }));

      const acts = response.data.map((res) => ({
        text: res.action_type.comm_action_type,
        value: res.action_type.comm_action_type,
      }));
      const comms = response.data.map((res) => ({
        text: res.comm_type.communication_type,
        value: res.comm_type.communication_type,
      }));
      setActionStatusFilters(acts.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setCommStatusFilters(comms.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
      setTemplate(dataSource);
      setLoading(false);

      const dataSource1 = commtype.data.map((res) => ({
        value: res.id,
        label: res.communication_type,
      }));
      setCommtypes(dataSource1);

      const dataSource2 = actiontype.data.map((res) => ({
        label: res.comm_action_type,
      }));
      setActiontypes(dataSource2);
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmDelete = async (id) => {
    try {
      const data = templates.filter((template) => template.key !== id);
      const response = await client.delete(`/template/delete_template/${id}/`);
      if (response.status === 200) {
        setTemplate(data);
        notification['success']({
          description: 'Template deleted successfully',
        });
      }
    } catch {
      notification['error']({
        description: 'Cannot delete last activated template, you must create new template to activate',
      });
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
        <title>Content Template List</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Content Template List</PageHeader>
                <Row className='action-bar'>
                  <Col span={24}>
                    <Row justify='end'>
                      <Row span={12}>
                        <Link href='/admin/admin-section/template-master/add'>
                          <Button type='primary'>Add New</Button>
                        </Link>
                      </Row>
                    </Row>
                  </Col>
                </Row>
                <ListingStyles>
                  <Row>
                    <Col span={24}>
                      <Table dataSource={templates} getPopupContainer={(trigger) => trigger}>
                        <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                        <Column
                          title='Name'
                          dataIndex='communication_name'
                          key='communication_name'
                          sorter={(a, b) => a.communication_name.localeCompare(b.communication_name)}
                          {...getColumnSearchProps('communication_name', 'Name')}
                        />
                        <Column
                          title='Subject'
                          dataIndex='subject'
                          key='subject'
                          sorter={(a, b) => a.subject.localeCompare(b.subject)}
                          {...getColumnSearchProps('subject', 'Subject')}
                        />
                        <Column title='Body' dataIndex='body' key='body' {...getColumnSearchProps('body', 'Body')} />
                        <Column
                          title='Action Type'
                          key='action_type'
                          dataIndex='action_type'
                          filters={actionStatusFilters}
                          onFilter={(value, record) => record.action_type.indexOf(value) === 0}
                        />
                        <Column
                          title='Communication Type'
                          key='comm_type'
                          dataIndex='comm_type'
                          filters={commStatusFilters}
                          onFilter={(value, record) => record.comm_type.indexOf(value) === 0}
                        />
                        <Column
                          title='Status'
                          key='is_active'
                          dataIndex='is_active'
                          render={(text, record) =>
                            record.is_active == true ? (
                              <CheckCircleTwoTone twoToneColor='#52c41a' style={{ fontSize: '20px' }} />
                            ) : (
                              <CloseCircleTwoTone twoToneColor='#eb2f96' style={{ fontSize: '20px' }} />
                            )
                          }
                        />
                        <Column
                          title='Action'
                          key='action'
                          width='5%'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Link href={`/admin/admin-section/template-master/edit/${record.key}`}>
                                <a href={`/admin/admin-section/template-master/edit/${record.key}`}>
                                  <Tooltip placement='bottom' title='Edit'>
                                    <EditTwoTone />
                                  </Tooltip>
                                </a>
                              </Link>
                              <Popconfirm
                                title='Are you sure to delete this template?'
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

export default ContentTemplateMaster;
