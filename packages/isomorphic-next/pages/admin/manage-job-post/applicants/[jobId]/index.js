import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { palette } from 'styled-theme';
import { useRouter } from 'next/router';
import { CSVLink } from 'react-csv';
import { saveAs } from 'file-saver';
// Components
import {
  Checkbox,
  Row,
  Col,
  Input,
  Space,
  Form,
  Select,
  notification,
  Typography,
  Divider,
  Radio,
  Tooltip,
} from 'antd';
import Box from '@iso/components/utility/box';
import Table from '@iso/components/uielements/table';
import Tag from '@iso/components/uielements/tag';
import Button from '@iso/components/uielements/button';
import { SearchOutlined } from '@ant-design/icons';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import Modal from '@iso/ui/Antd/Modal/Modal';
import DashboardLayout from '../../../../../containers/DashboardLayout/DashboardLayout';
import PageHeader from '@iso/components/utility/pageHeader';
import ApplicantFilter from '../../../../../containers/Admin/ApplicantFilters/ApplicantFilter';
// Icons
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
// Hooks / API Calls
import { useAuthState } from '../../../../../src/components/auth/hook';
import useUser from '../../../../../src/components/auth/useUser';
// Styles
import ListingStyles from '../../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';
import FormStyles from '../../../../../styled/Form.styles';
import { getPositionId } from '../../../../../src/apiCalls';

const csvHeaders = [
  { label: 'Position', key: 'position' },
  { label: 'Name', key: 'name' },
  { label: 'Mobile no', key: 'mobile_no' },
  { label: 'Place of birth', key: 'place_of_birth' },
  { label: 'Skype id', key: 'skype_id' },
  { label: 'Whatsapp id', key: 'whatsapp_id' },
  { label: 'Father name', key: 'father_name' },
  { label: 'Father occupation', key: 'father_occupation' },
  { label: 'Fax number', key: 'fax_number' },
  { label: 'Gender', key: 'gender' },
  { label: 'Is Indian citizen', key: 'is_indian_citizen' },
  { label: 'Aplication Id', key: 'application_id' },
  { label: 'Job Status', key: 'applied_job_status' },
  { label: 'Division', key: 'division' },
  { label: 'Date of application', key: 'date_of_application' },
  { label: 'Education details', key: 'education_details' },
  { label: 'Experiences', key: 'experiences' },
  { label: 'Languages', key: 'languages' },
  { label: 'Local address', key: 'local_address' },
  { label: 'Permanent address', key: 'permanent_address' },
  { label: 'Father address', key: 'father_address' },
  { label: 'Neeri relation', key: 'neeri_relation' },
  { label: 'Other info', key: 'other_info' },
  { label: 'Overseas visits', key: 'overseas_visits' },
  { label: 'Passport number', key: 'passport_number' },
  { label: 'Passport expiry', key: 'passport_expiry' },
  { label: 'Religion', key: 'religion' },
  { label: 'Professional trainings', key: 'professional_trainings' },
  { label: 'Fellowship details', key: 'fellow_ships' },
  { label: 'Published papers', key: 'published_papers' },
];

const plainOptions = [
  { label: 'Position', value: 'position' },
  { label: 'Name', value: 'name' },
  { label: 'Mobile No', value: 'mobile_no' },
  { label: 'Birth Place', value: 'place_of_birth' },
  { label: 'Skype ID', value: 'skype_id' },
  { label: 'Whatsapp ID', value: 'whatsapp_id' },
  { label: 'Father Name', value: 'father_name' },
  { label: 'Father Occupation', value: 'father_occupation' },
  { label: 'Fax No', value: 'fax_number' },
  { label: 'Gender', value: 'gender' },
  { label: 'Is Indian Citizen', value: 'is_indian_citizen' },
  { label: 'Application ID', value: 'application_id' },
  { label: 'Applied Job Status', value: 'applied_job_status' },
  { label: 'Division', value: 'division' },
  { label: 'Date of Application', value: 'date_of_application' },
  { label: 'Education Details', value: 'education_details' },
  { label: 'Experience', value: 'experiences' },
  { label: 'Languages', value: 'languages' },
  { label: 'Local Address', value: 'local_address' },
  { label: 'Permanent Address', value: 'permanent_address' },
  { label: 'Father Address', value: 'father_address' },
  { label: 'NEERI Relation', value: 'neeri_relation' },
  { label: 'Other Info', value: 'other_info' },
  { label: 'Overseas Visits', value: 'overseas_visits' },
  { label: 'Passport No', value: 'passport_number' },
  { label: 'Passport Expiry', value: 'passport_expiry' },
  { label: 'Religion', value: 'religion' },
  { label: 'Professional Trainings', value: 'professional_trainings' },
  { label: 'Fellowship Details', value: 'fellow_ships' },
  { label: 'Published Papers', value: 'published_papers' },
];

const JobDetails = () => {
  const { client } = useAuthState();
  const { user } = useUser({});
  const router = useRouter();
  const { query } = router;

  const { Column } = Table;
  const { Text, Title } = Typography;
  const CheckboxGroup = Checkbox.Group;

  const [applicants, setApplicants] = useState(null);
  const [allApplicants, setAllApplicants] = useState(null);
  const [visible, setModaVisibility] = useState(false);
  const [toggleFilters, setToggleFilters] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setRowKeys] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  const [headers, setHeaders] = useState(csvHeaders);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const searchInputRef = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const [positionFilters, setPositionFilters] = useState([]);
  const [reason, setReason] = useState(undefined);
  const [reasonMaster, setReasonMaster] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState('');
  const [selectedPositionID, setSelectedPositionID] = useState('all');
  const [positions, setPositions] = useState([]);
  const [applicantsList, setApplicantsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState('');
  const [form] = Form.useForm();
  const [filterApplicantForm] = Form.useForm();
  const [applicantSelectForm] = Form.useForm();

  const filterApplicantInitialValues = {
    job_post_id: query.jobId,
    condition: 'and',
    fields: [{}],
  };

  const getAllApplicants = async () => {
    const response = await client.get(`job_posting/applicant_list_by_job/${query.jobId}/`);
    const statusData = response.data.map((res) => ({
      text: res.applied_job_status.toUpperCase(),
      value: res.applied_job_status,
    }));
    const positionData = response.data.map((res) => ({
      text: res.position?.toUpperCase(),
      value: res.position,
    }));

    setAllApplicants(response.data);
    setApplicants(response.data);
    setStatusFilters(statusData.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
    setPositionFilters(positionData.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
  };

  const loadPayments = async (positionId) => {
    const response = await client.get(
      positionId === ''
        ? `/user/job-postion-payment-list-csv/${query.jobId}/`
        : `/user/job-postion-payment-list-csv/${query.jobId}/${positionId}/`
    );
    if (response.data) {
      setPaymentsList(response.data);
    }
  };

  useEffect(() => {
    if (user && user.isLoggedIn) {
      getAllApplicants();
      loadPayments('');
    }
  }, [user, client]);

  useEffect(() => {
    const loadRejectReasons = async () => {
      const response = await client.get('/job_posting/rejection_reason/');
      if (response.data) {
        const appealReasons = response.data.map((reason) => ({
          appeal_id: reason.rejection_id,
          appeal_reason_master: reason.rejection_reason,
        }));
        setReasonMaster(appealReasons);
      }
    };

    const getPositions = async () => {
      const response = await getPositionId(client, query.jobId);

      setPositions(response[0].manpower_positions);
    };

    if (user && user.isLoggedIn) {
      loadRejectReasons();
      getPositions();
    }
  }, [user]);

  const onChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
    getHeaders(list.length === plainOptions.length, list);
  };

  const getHeaders = (selectAll, list) => {
    let data = [];
    if (selectAll) {
      list.map((v) => {
        csvHeaders.map((n) => {
          if (v === n.key) {
            data.push(n);
          }
        });
      });
    } else {
      list &&
        list.length &&
        list.map((v) => {
          csvHeaders.map((n) => {
            if (v === n.key) {
              data.push(n);
            }
          });
        });
    }
    setHeaders(data);
  };

  const onCheckAllChange = (e) => {
    setCheckedList(e.target.checked ? plainOptions.map((item) => item.value) : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    getHeaders(
      e.target.checked,
      plainOptions.map((item) => item.value)
    );
  };

  const onSelectChange = (selectedRowKeys, row) => {
    const data = row.map((item) => ({
      position: item.position,
      user_id: item.user_id,
      position_id: item.position_id,
      job_posting_id: item.job_posting_id,
      name: item.user_profile.name_of_applicant,
      mobile_no: item.user_profile.mobile_no,
      place_of_birth: item.user_profile.place_of_birth,
      skype_id: item.user_profile.skype_id,
      whatsapp_id: item.user_profile.whatsapp_id,
      application_id: item.application_id,
      applied_job_status: item.applied_job_status,
      division: item.division,
      date_of_application: item.date_of_application,
      education_details:
        item &&
        item.user_profile &&
        item.user_profile.education_details.length &&
        item.user_profile.education_details.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      experiences:
        item &&
        item.user_profile &&
        item.user_profile.experiences.length &&
        item.user_profile.experiences.map(
          (v) =>
            `${Object.keys(v).map((b) => b)[0]}-${
              Object.values(v).map((a) => a)[0] !== null ? Object.values(v).map((a) => a)[0] : 'NA'
            }\r`
        ),
      fellow_ships:
        item &&
        item.user_profile &&
        item.user_profile.fellow_ships.length &&
        item.user_profile.fellow_ships.map(
          (v) => `Exam Name: ${v.entrance_examination} , Passing Year: ${v.passing_year} , Score: ${v.score}\r`
        ),
      father_address:
        item && item.user_profile && item.user_profile.father_address !== null
          ? (item.user_profile.father_address.address1,
            item.user_profile.father_address.address2,
            item.user_profile.father_address.address3,
            item.user_profile.father_address.telephone_no,
            item.user_profile.father_address.city,
            item.user_profile.father_address.country,
            item.user_profile.father_address.postcode,
            item.user_profile.father_address.state)
          : 'Same as Local',
      father_name: item.user_profile.father_name,
      father_occupation: item.user_profile.father_occupation,
      fax_number: item.user_profile.fax_number,
      gender: item.user_profile.gender,
      is_indian_citizen: item.user_profile.is_indian_citizen,
      languages:
        item &&
        item.user_profile &&
        item.user_profile.languages.length &&
        item.user_profile.languages.map(
          (v) =>
            `Name: ${v.name} , Read level: ${v.read_level} , Speak level: ${v.speak_level} , Write level: ${v.write_level} , Exam passed: ${v.exam_passed}\r`
        ),
      local_address:
        item &&
        item.user_profile &&
        item.user_profile.local_address &&
        (item.user_profile.local_address.address1,
        item.user_profile.local_address.address2,
        item.user_profile.local_address.address3,
        item.user_profile.local_address.telephone_no,
        item.user_profile.local_address.city,
        item.user_profile.local_address.country,
        item.user_profile.local_address.postcode,
        item.user_profile.local_address.state),
      permanent_address:
        item && item.user_profile && item.user_profile.permanent_address !== null
          ? (item.user_profile.permanent_address.address1,
            item.user_profile.permanent_address.address2,
            item.user_profile.permanent_address.address3,
            item.user_profile.permanent_address.telephone_no,
            item.user_profile.permanent_address.city,
            item.user_profile.permanent_address.country,
            item.user_profile.permanent_address.postcode,
            item.user_profile.permanent_address.state)
          : 'Same as Local',
      neeri_relation:
        item &&
        item.user_profile &&
        item.user_profile.neeri_relation.length &&
        item.user_profile.neeri_relation.map(
          (v) =>
            `Relation Name: ${v.relation_name} , Realation: ${v.relation} , Designation: ${v.designation} , Center Name: ${v.center_name}\r`
        ),
      other_info:
        item &&
        item.user_profile &&
        item.user_profile.other_info &&
        (item.user_profile.other_info.notice_period_max,
        item.user_profile.other_info.notice_period_min,
        item.user_profile.other_info.bond_title,
        item.user_profile.other_info.bond_details,
        item.user_profile.other_info.organisation_name,
        item.user_profile.other_info.bond_start_date,
        item.user_profile.other_info.bond_end_date),
      overseas_visits:
        item &&
        item.user_profile &&
        item.user_profile.overseas_visits.length &&
        item.user_profile.overseas_visits.map(
          (v) =>
            `Purpose of visit: ${v.purpose_of_visit} , Duration of visit: ${v.duration_of_visit} , Date of visit: ${v.date_of_visit} , Country visit: ${v.country_visited}\r`
        ),
      passport_number: item.user_profile.passport_number,
      passport_expiry: item.user_profile.passport_expiry,
      religion: item.user_profile.religion.religion_name,
      professional_trainings:
        item &&
        item.user_profile &&
        item.user_profile.professional_trainings.length &&
        item.user_profile.professional_trainings.map(
          (v) =>
            `Title: ${v.title} , Description: , ${v.description} , From date: ${v.from_date} , To date: ${v.to_date}\r`
        ),
      published_papers:
        item &&
        item.user_profile &&
        item.user_profile.published_papers.length &&
        item.user_profile.published_papers.map((v) => `Paper title: ${v.paper_title}\r`),
    }));
    const applicants = row.map((item) => ({
      user_id: item.user_id,
      position_id: item.position_id,
    }));
    setSelectedRows(data);
    setRowKeys(selectedRowKeys);
    setApplicantsList(applicants);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const openModal = () => {
    setModaVisibility(true);
  };

  const handleCancel = () => {
    setModaVisibility(false);
    setCheckedList([]);
  };

  const onRejectComplete = async () => {
    const response = await client.get(`job_posting/applicant_list_by_job/${query.jobId}/`);
    const statusData = response.data.map((res) => ({
      text: res.applied_job_status.toUpperCase(),
      value: res.applied_job_status,
    }));

    setAllApplicants(response.data);
    setStatusFilters(statusData.filter((obj, id, a) => a.findIndex((t) => t.value === obj.value) === id));
  };

  const nameWithTimestamp = `compare_applicants_${
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

  // const openReject = () => {
  //   setModalVisible(true);
  // };

  const closeReject = () => {
    setModalVisible(false);
  };

  const handleReason = (value, obj) => {
    setReason(obj.value);
  };

  const onConfirmReject = async () => {
    try {
      const response = await client.put(`job_posting/reject/applicants/`, {
        reject: reason,
        reason_for_reject: comments,
        user_job_id: selectedRows.map((item) => ({
          id: item.application_id,
        })),
      });
      if (response.status === 200) {
        notification['success']({
          description: 'Applicant rejected successfully',
        });
        setModalVisible(false);
        setRowKeys([]);
        onRejectComplete();
      }
    } catch (err) {
      notification['error']({
        description: err.response.data?.message,
      });
    }
  };

  const onDownloadProfile = async () => {
    const applicantIds = selectedRows.map((row) => row.application_id);
    const selectedUsers = allApplicants.filter((x) => applicantIds.includes(x.application_id));

    const users = selectedUsers.map((s) => s.user_id);

    const response = await client.post(`/user/download/applicants/`, {
      job_posting_id: query.jobId,
      applicants: applicantsList,
    });

    if (response.data.file_path) {
      const filename = 'applicant_profiles.zip';
      setTimeout(() => {
        saveAs(response.data?.file_path, filename);
      }, 1000);
    } else {
      notification['error']({
        description: 'No records found',
      });
    }
  };

  // On Changes/Select Position
  const handleOnChangePosition = (value) => {
    setSelectedPositionID(value);
    if (value === 'all') {
      setApplicants(allApplicants);
      loadPayments('');
    } else {
      const filterdApplicant = allApplicants.filter((applicant) => applicant.position_id === value);
      setApplicants(filterdApplicant);
      loadPayments(value);
    }
  };

  // Get Filter list of applicant
  const onSubmitFilter = async (values) => {
    try {
      let request = {};
      if (selectedPositionID !== 'all') {
        request = {
          ...values,
          position_id: selectedPositionID,
          condition: values.fields.length === 1 ? 'or' : 'and',
        };
      } else {
        request = {
          ...values,
          condition: values.fields.length === 1 ? 'or' : 'and',
        };
      }

      const response = await client.post('/job_posting/filter/applicant/', request);

      if (response && response.status === 200) {
        if (response.data?.message) {
          notification['warning']({
            description: response.data.message,
          });
        } else {
          setApplicants(response.data);
        }
      } else {
        notification['warning']({
          description: response.message,
        });
      }
    } catch (error) {
      notification['error']({
        description: 'No data found',
      });
    }
  };

  // Approve or Reject Applicant
  const onApplicantSelectSubmit = async (values) => {
    if (selectedPositionID === 'all') {
      notification['error']({
        description: 'Select job post',
      });
    } else {
      const request = {
        ...values,
        job_post_id: query.jobId,
        position_id: selectedPositionID,
        userid: selectedRows.map((item) => item.user_id),
      };

      try {
        const response = await client.post('job_posting/approve_reject/applicants/', request);
        if (response.status === 200) {
          if (response.data?.message) {
            notification['success']({
              description: response.data?.message,
            });
          }
          setRowKeys([]);
          getAllApplicants();
          // onRejectComplete();
        }
      } catch (err) {
        notification['error']({
          description: err,
        });
      }
    }
  };

  const onExportPayments = () => {
    if (paymentsList.message !== 'JobPost applicants payment details not exist') {
      const filename = 'applicant_payments.csv';
      const csvData = new Blob([paymentsList], { type: 'text/csv;charset=utf-8;' });
      setTimeout(() => {
        saveAs(csvData, filename);
      }, 1000);
    } else {
      notification['error']({
        description: 'Payment details not found',
      });
    }
  };

  const handleResetAll = () => {
    filterApplicantForm.resetFields();
    if (selectedPositionID === 'all') {
      setApplicants(allApplicants);
    } else {
      const filterdApplicant = allApplicants.filter((applicant) => applicant.position_id === selectedPositionID);
      setApplicants(filterdApplicant);
    }
  };

  if (!allApplicants) return null;

  return (
    <>
      <Head>
        <title>Applicants List</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            <ListingStyles>
              <PageHeader>Applicants List</PageHeader>
              <Row className='action-bar applicant-filter'>
                <Col span={24}>
                  <Row justify='space-between'>
                    {/* Select Position ID */}
                    <Form.Item label='Select Job Position'>
                      <Select
                        placeholder='Select Job Position'
                        defaultValue='all'
                        getPopupContainer={(trigger) => trigger.parentNode}
                        onChange={handleOnChangePosition}
                      >
                        <Option value='all'>All</Option>
                        {positions.map((position) => (
                          <Option value={position.id}>{position.position_display_name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Row justify='end' span={12} style={{ rowGap: 5, columnGap: 5 }}>
                      <Row span={12}>
                        <Button
                          type='primary'
                          htmlType='button'
                          disabled={selectedRowKeys && selectedRowKeys.length === 0}
                          onClick={onDownloadProfile}
                        >
                          Download Resume
                        </Button>
                      </Row>
                      {/* <Row span={12}>
                      <Button
                        type='primary'
                        htmlType='button'
                        disabled={selectedRowKeys && selectedRowKeys.length === 0}
                        onClick={() => openReject()}
                      >
                        Reject Applicants
                      </Button>
                    </Row> */}
                      <Row span={12}>
                        <Button
                          type='primary'
                          htmlType='button'
                          disabled={selectedRowKeys && selectedRowKeys.length === 0}
                          onClick={() => openModal()}
                        >
                          Compare Applicants
                        </Button>
                      </Row>
                      <Row span={12}>
                        <Button type='primary' htmlType='button' onClick={() => setToggleFilters(!toggleFilters)}>
                          Accept / Reject Applicants
                        </Button>
                      </Row>
                      <Row span={12}>
                        <Tooltip title='Download payment list for this job post'>
                          <Button type='primary' htmlType='button' onClick={onExportPayments}>
                            Export to CSV
                          </Button>
                        </Tooltip>
                      </Row>
                      <Row span={12}>
                        <Button
                          type='button'
                          htmlType='button'
                          onClick={() => router.push(`/admin/manage-job-post/${query.type}/list`)}
                        >
                          Back
                        </Button>
                      </Row>
                    </Row>
                  </Row>
                </Col>
              </Row>
              {toggleFilters && (
                <Row className='action-bar'>
                  <FormStyles>
                    <Box>
                      <Title level={4} style={{ marginBottom: 0 }}>
                        Filter Applicant for Approve or Reject
                      </Title>
                      <Divider style={{ margin: '10px 0 16px' }} />
                      {/* <pre>{JSON.stringify(filterApplicantForm.getFieldsValue(), null, 2)}</pre> */}
                      <Form
                        name='filterApplicantForm'
                        form={filterApplicantForm}
                        onFinish={onSubmitFilter}
                        initialValues={filterApplicantInitialValues}
                        scrollToFirstError
                      >
                        <Form.Item name='job_post_id' label='' style={{ marginBottom: 0, display: 'none' }}>
                          <Input type='hidden' />
                        </Form.Item>
                        <Form.List name='fields'>
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, fieldKey, ...restField }) => {
                                return (
                                  <>
                                    <Row gutter={[16, 0]} key={key}>
                                      <ApplicantFilter
                                        key={key}
                                        name={name}
                                        fieldKey={fieldKey}
                                        {...restField}
                                        form={filterApplicantForm}
                                      />
                                      <Col lg={2} xs={24} style={{ marginTop: 35 }}>
                                        <MinusCircleOutlined
                                          onClick={() => remove(name)}
                                          style={{
                                            marginRight: 8,
                                            color: palette('error', 0),
                                          }}
                                        />
                                        <Text type='danger' style={{ color: palette('error', 0) }}>
                                          Remove
                                        </Text>
                                      </Col>
                                    </Row>
                                    {/* {fields.length > 0 && fieldKey !== fields.length - 1 && (
                                      <Row justify='center' style={{ marginTop: -15 }}>
                                        <Title level={5} style={{ marginBottom: 0 }}>
                                          AND
                                        </Title>
                                      </Row>
                                    )} */}
                                  </>
                                );
                              })}
                              <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                Add Filter
                              </Button>
                            </>
                          )}
                        </Form.List>
                        <Row justify='space-around' style={{ marginTop: 16 }}>
                          <Form.Item>
                            <Space size='middle'>
                              <Button type='primary' htmlType='submit'>
                                Search
                              </Button>
                              <Button htmlType='button' onClick={() => handleResetAll()}>
                                Reset
                              </Button>
                            </Space>
                          </Form.Item>
                        </Row>
                      </Form>
                    </Box>
                  </FormStyles>
                </Row>
              )}
              <Row>
                <Col span={24}>
                  <Table dataSource={applicants} rowSelection={rowSelection} rowKey={(record) => record.application_id}>
                    <Column
                      title='Name'
                      dataIndex='name'
                      key='name'
                      sorter={(a, b) =>
                        a.user_profile.name_of_applicant.localeCompare(b.user_profile.name_of_applicant)
                      }
                      {...getColumnSearchProps('name', 'Name')}
                      render={(text, record) => (
                        <Tooltip title='Go to applicant profile'>
                          <span style={{ color: '#40a9ff', cursor: 'pointer' }}>
                            {record.user_profile.name_of_applicant}
                          </span>
                        </Tooltip>
                      )}
                      onCell={(record) => {
                        return {
                          onClick: () => {
                            router.push(
                              `/admin/manage-job-post/applicants/${query.jobId}/${record.user_id}/?position_id=${record.position_id}&user_id=${record.user_id}&type=${query.type}&applicantID=${record.application_id}`
                            );
                          },
                        };
                      }}
                    />
                    <Column
                      title='Position'
                      dataIndex='position'
                      key='position'
                      sorter={(a, b) => a.position.localeCompare(b.position)}
                      filters={positionFilters}
                      onFilter={(value, record) => record.position.indexOf(value) === 0}
                    />
                    <Column
                      title='Division'
                      dataIndex='division'
                      key='division'
                      sorter={(a, b) => a.division.localeCompare(b.division)}
                      {...getColumnSearchProps('division', 'Division')}
                    />
                    <Column title='Date of Applied' dataIndex='date_of_application' key='date_of_application' />
                    <Column
                      title='Contact'
                      dataIndex='user_profile.mobile_no'
                      key='user_profile.mobile_no'
                      render={(text, record) => record.user_profile.mobile_no}
                    />
                    <Column
                      title='Status'
                      key='status'
                      width='5%'
                      filters={statusFilters}
                      onFilter={(value, record) => record.applied_job_status.indexOf(value) === 0}
                      render={(text, record) => (
                        <Tag
                          className={`ant-tag-${record.applied_job_status}`}
                          key={record.applied_job_status}
                          color={
                            record.applied_job_status === 'received'
                              ? '#069633'
                              : record.applied_job_status === 'shortlisted'
                              ? '#069633'
                              : record.applied_job_status === 'hired'
                              ? '#384E77'
                              : record.applied_job_status === 'payment pending'
                              ? '#D3B636'
                              : record.applied_job_status === 'appealed'
                              ? '#D3B636'
                              : record.applied_job_status === 'document pending'
                              ? '#D3B636'
                              : record.applied_job_status === 'rejected'
                              ? '#D5202F'
                              : '#39393A'
                          }
                        >
                          {record?.applied_job_status?.toUpperCase()}
                        </Tag>
                      )}
                    />
                  </Table>
                </Col>
              </Row>
              {selectedRowKeys && selectedRowKeys.length > 0 && (
                <Row>
                  <Box style={{ marginBottom: 16 }}>
                    <Form
                      name='applicantSelectForm'
                      form={applicantSelectForm}
                      onFinish={onApplicantSelectSubmit}
                      scrollToFirstError
                    >
                      <Title level={4} style={{ marginBottom: 0 }}>
                        Approve or Reject selected candidate
                      </Title>
                      <Divider style={{ margin: '10px 0 16px' }} />
                      <Row gutter={[16, 0]}>
                        <Col>
                          <Form.Item
                            name='status'
                            label=''
                            labelCol={{ span: 24 }}
                            rules={[{ required: true, message: 'Please select status' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Radio.Group name='status' value='status'>
                              <Space>
                                <Radio value='shortlisted'>Approve</Radio>
                                <Radio value='rejected'>Reject</Radio>
                              </Space>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item style={{ marginBottom: 0 }}>
                            <Button type='primary' htmlType='submit'>
                              Save
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Box>
                </Row>
              )}
            </ListingStyles>
          </ManageJobPostStyles>
          <Modal wrapClassName='instagram-modal' visible={visible} footer={null} closable={false}>
            <ListingStyles style={{ padding: '24px' }}>
              <Row>
                <Checkbox
                  indeterminate={indeterminate}
                  onChange={onCheckAllChange}
                  checked={checkAll}
                  style={{ fontWeight: '600' }}
                >
                  Select all
                </Checkbox>
              </Row>
              <Row>
                <CheckboxGroup
                  options={plainOptions}
                  value={checkedList}
                  onChange={onChange}
                  style={{ fontSize: 'xx-large' }}
                />
              </Row>
            </ListingStyles>
            <Row span={12} style={{ padding: '8px 24px 24px' }} justify='center'>
              <CSVLink data={selectedRows} headers={headers} filename={nameWithTimestamp}>
                <Button type='primary'>Export to CSV</Button>
              </CSVLink>
              <Button type='primary' onClick={handleCancel} style={{ marginLeft: '20px' }}>
                Cancel
              </Button>
            </Row>
          </Modal>
          <Modal
            // title={`Appealing for ${position}(${jobId})`}
            style={{ top: 20 }}
            visible={modalVisible}
            onOk={() => {
              form
                .validateFields()
                .then(() => {
                  form.resetFields();
                  onConfirmReject();
                })
                .catch((info) => {
                  notification['error']({
                    description: info,
                  });
                });
            }}
            onCancel={closeReject}
          >
            <Form name='formStep1' form={form} scrollToFirstError>
              <Row gutter={[16, 0]}>
                <Col span={24}>
                  <Form.Item
                    name='reason'
                    labelCol={{ span: 24 }}
                    label='Reason'
                    rules={[{ required: true, message: 'Please select reason!' }]}
                  >
                    <Select style={{ width: 200 }} placeholder='Select Reason' value={reason} onChange={handleReason}>
                      {reasonMaster.map((reason) => (
                        <Select.Option
                          value={reason.appeal_id}
                          name={reason.appeal_reason_master}
                          key={reason.appeal_id}
                        >
                          {reason.appeal_reason_master}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name='comments' label='Comments' labelCol={{ span: 24 }}>
                    <Input.TextArea
                      placeholder='Add Comments'
                      style={{ width: 350 }}
                      rows={3}
                      value={comments}
                      maxLength={200}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

JobDetails.propTypes = {
  response: PropTypes.arrayOf(PropTypes.object),
};

JobDetails.defaultProps = {
  response: [],
};

export default JobDetails;
