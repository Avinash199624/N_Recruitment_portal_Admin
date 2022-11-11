import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Row,
  Col,
  Badge,
  Space,
  Table,
  Descriptions,
  Layout,
  notification,
  Typography,
  Form,
  Modal,
  Input,
  Select,
  Tag,
  Tooltip,
  Menu,
  Dropdown,
} from 'antd';
import { useRouter } from 'next/router';
import moment from 'moment';
import { DownOutlined, QuestionOutlined, CheckOutlined } from '@ant-design/icons';
import Button from '@iso/components/uielements/button';
import ContactList from '@iso/components/Contacts/ContactList';
import Scrollbar from '@iso/components/utility/customScrollBar';
import { useAuthState } from '../../../../../src/components/auth/hook';
import useUser from '../../../../../src/components/auth/useUser';
import DashboardLayout from '../../../../../containers/DashboardLayout/DashboardLayout';
import { ContactsWrapper } from '../../../../../../../shared/containers/Contacts/Contacts.styles';
import PageHeader from '@iso/components/utility/pageHeader';

const Preview = () => {
  const { Content } = Layout;
  const { client } = useAuthState();
  const router = useRouter();
  const { query } = router;
  const { user } = useUser({});
  const [candidateDetail, setCandidateDetail] = useState({});
  const [profileDetails, setProfileDetails] = useState();
  const [contacts, setContacts] = useState([]);
  const [applicantId, setApplicantId] = useState();
  const [positionId, setPositiontId] = useState();
  const { Column, ColumnGroup } = Table;
  const [selectedId, setSelectedId] = useState();
  const [reasonMaster, setReasonMaster] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState('');
  const [reason, setReason] = useState('');
  const [resume, setResumeUrl] = useState('');
  const [form] = Form.useForm();
  const [isRejected, setRejected] = useState(false);

  const { Title } = Typography;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`job_posting/applicant_list_by_job/${query.jobId}/`);

      const contact = response.data.map((res) => ({
        id: res.user_id,
        position_id: res.position_id,
        name: res.user_profile.name_of_applicant,
        avatar: res.user_profile.profile_photo,
        application_id: res.application_id,
        applied_job_status: res.applied_job_status,
        resume: res.user_profile?.resume,
      }));
      const applicantID = parseInt(query?.applicantID);
      setRejected(contact.find((dt) => dt.application_id === applicantID).applied_job_status === 'rejected');
      setContacts(contact);
      const positionId = contact.find((dt) => dt.id === response.data[0].user_id).position_id;
      setPositiontId(positionId);
      setApplicantId(applicantID);
    };

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

    if (user && user.isLoggedIn) {
      load();
      loadRejectReasons();
    }
  }, [user, client]);

  useEffect(() => {
    const load = async () => {
      const application = await client.get(
        `/user/application_preview/${query.user_id}/?job_posting_id=${query.jobId}&position_id=${query.position_id}`
      );
      setCandidateDetail(application.data);
      setProfileDetails(application.data?.meta);
      const resume_url =
        application.data &&
        application.data.meta &&
        application.data.meta.documents.filter((doc) => doc.doc_master.doc_name === 'Resume');

      if (resume_url && resume_url.length > 0) {
        setResumeUrl(resume_url[0].doc_file_path);
      } else {
        setResumeUrl('');
      }
    };
    setSelectedId(query.applicantId);

    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const changeContact = async (id) => {
    const applicantId = contacts.find((dt) => dt.id === id).application_id;
    const positionId = contacts.find((dt) => dt.id === id).position_id;
    setPositiontId(positionId);
    setApplicantId(applicantId);
    setSelectedId(id);
    const application = await client.get(
      `/user/application_preview/${id}/?job_posting_id=${query.jobId}&position_id=${positionId}`
    );
    setCandidateDetail(application.data);
    setRejected(contacts.find((dt) => dt.id === id).applied_job_status === 'rejected');
    const resume_url =
      application.data &&
      application.data.meta &&
      application.data.meta.documents.filter((doc) => doc.doc_master.doc_name === 'Resume');
    if (resume_url && resume_url.length > 0) {
      setResumeUrl(resume_url[0].doc_file_path);
    } else {
      setResumeUrl('');
    }
  };

  const age = (a, b) => {
    var years = a.diff(b, 'year');
    b.add(years, 'years');

    var months = a.diff(b, 'months');
    b.add(months, 'months');

    var days = a.diff(b, 'days');
    return years + ' Years ' + months + ' Months ' + days + ' Days';
  };

  const updateApplicantStatus = async (status) => {
    await client.put(`/job_posting/applicant_status/${applicantId}/`, {
      application_id: applicantId,
      applied_job_status: status,
    });
    notification['success']({
      description: 'Status updated successfully',
    });
  };

  const openReject = () => {
    setModalVisible(true);
  };

  const closeReject = () => {
    setModalVisible(false);
  };

  const handleReason = (value, obj) => {
    setReason(obj.value);
  };

  const onConfirmReject = async (values) => {
    try {
      const response = await client.put(`job_posting/reject/applicants/`, {
        reject: reason,
        reason_for_reject: comments,
        user_job_id: [
          {
            id: applicantId,
          },
        ],
      });
      if (response.status === 200) {
        setModalVisible(false);
        updateApplicantStatus('rejected');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case 'rejected':
        openReject();
        break;
      default:
        updateApplicantStatus(e.key);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key='awaiting review'>Awaiting Review</Menu.Item>
      <Menu.Item key='shortlisted'>Shortlisted</Menu.Item>
      <Menu.Item key='hired'>Hired</Menu.Item>
      <Menu.Item key='rejected' disabled={isRejected}>
        Rejected
      </Menu.Item>
      <Menu.Item key='closed'>Closed</Menu.Item>
    </Menu>
  );

  if (!candidateDetail) return null;

  return (
    <>
      <Head>
        <title>View Job Details</title>
      </Head>
      <DashboardLayout>
        <>
          <Row className='action-bar'>
            <PageHeader>Applicant Profile</PageHeader>
          </Row>
          <ContactsWrapper className='isomorphicContacts' style={{ background: 'none' }}>
            <div className='isoContactListBar'>
              <ContactList
                contacts={contacts}
                selectedId={selectedId}
                changeContact={(id) => changeContact(id)}
                deleteContact={() => {}}
              />
            </div>
            <Layout className='isoContactBoxWrapper'>
              <Row className='action-bar'>
                <Col span={24}>
                  <Row span={12} justify='end'>
                    <Space>
                      <Button
                        className='ant-btn-secondary'
                        type='button'
                        onClick={() =>
                          router.push(`/admin/manage-job-post/applicants/${query.jobId}?type=${query.type}`)
                        }
                      >
                        Back
                      </Button>
                      <Button size='middle' type='default' disabled={resume === ''} className='ant-btn-secondary'>
                        <a href={resume} target='_blank'>
                          {' '}
                          View Resume
                        </a>
                      </Button>{' '}
                      <Dropdown overlay={menu}>
                        <Button size='middle' type='default' className='ant-btn-secondary'>
                          Update Status <DownOutlined />
                        </Button>
                      </Dropdown>
                    </Space>
                  </Row>
                </Col>
              </Row>
              <Content className='isoContactBox'>
                <Scrollbar className='contactBoxScrollbar'>
                  <Descriptions bordered style={{ marginBottom: 20 }} justify=''>
                    <Descriptions.Item label='Name Of Applicant' span={3}>
                      {candidateDetail.meta && candidateDetail.meta.user_profile.name_of_applicant}
                    </Descriptions.Item>
                    <Descriptions.Item label='Age' span={3}>
                      <Badge
                        className='head-example'
                        style={{ backgroundColor: '#069633' }}
                        count={age(
                          moment(),
                          moment(candidateDetail.meta && candidateDetail.meta.user_profile.date_of_birth)
                        )}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label='Specialization' span={3}>
                      <Space>
                        {candidateDetail.meta &&
                          candidateDetail.meta.user_profile.education_details.map((detail) => (
                            <Badge
                              className='head-example'
                              style={{ backgroundColor: '#069633' }}
                              count={`${detail.specialization?.education_degree_name}-${detail.specialization.stream_name}`}
                            />
                          ))}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label='Reservation Category' span={3}>
                      <Badge
                        className='head-example'
                        style={{ backgroundColor: '#069633' }}
                        count={candidateDetail.meta && candidateDetail.meta.user_profile.caste?.toUpperCase()}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label='Documents' span={3}>
                      {candidateDetail.meta &&
                        candidateDetail.meta.documents.map((path) => (
                          <a href={path.doc_file_path} target='_blank'>
                            <Tag color='blue'>{path.doc_master.doc_name}</Tag>
                          </a>
                        ))}
                    </Descriptions.Item>
                  </Descriptions>
                  <Descriptions bordered style={{ marginBottom: 20 }} layout='vertical'>
                    <Descriptions.Item label='Qualifications' span={3}>
                      <Table
                        bordered
                        pagination={false}
                        size='small'
                        dataSource={candidateDetail.meta && candidateDetail.meta.user_profile.education_details}
                      >
                        <Column
                          title='Examination Passes/ Deploma/ Degree Obtained'
                          dataIndex='exam_name'
                          key='exam_name'
                          render={(text, record) => {
                            return `${record.exam_name.education_degree}`;
                          }}
                        />
                        <Column title='Board/ Institute' dataIndex='college_name' key='college_name' />
                        <Column title='Year Of Passing' dataIndex='passing_year' key='passing_year' />
                        <Column title='Class/ Division AND % of marks/ GPA' dataIndex='score' key='score' />
                        <Column title='University' dataIndex='university' key='university' />
                        <Column
                          title='Subject Specialization'
                          dataIndex='specialization'
                          key='specialization'
                          render={(text, record) => `${record.specialization?.stream_name}`}
                        />
                      </Table>
                    </Descriptions.Item>

                    <Descriptions.Item label='Experience' span={3}>
                      <Table
                        bordered
                        pagination={false}
                        size='small'
                        dataSource={candidateDetail.meta && candidateDetail.meta.user_profile.experiences}
                        key='employer_name'
                      >
                        <Column title='Name & Address of the Employer' dataIndex='employer_name' key='employer_name' />
                        <Column
                          title='Post held/Nature of Employment'
                          dataIndex='employment_type'
                          key='employment_type'
                        />
                        <ColumnGroup title='Period'>
                          <Column title='From' dataIndex='employed_from' key='employed_from' />
                          <Column title='To' dataIndex='employed_to' key='employed_to' />
                        </ColumnGroup>
                        <Column title='Salary' dataIndex='salary' key='salary' />
                        <Column title='Grade' dataIndex='grade' key='grade' />
                      </Table>
                    </Descriptions.Item>
                  </Descriptions>
                </Scrollbar>
              </Content>
            </Layout>
          </ContactsWrapper>
        </>
        <Modal
          title={`Reject Applicant`}
          width={1000}
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
                console.log('Validate Failed:', info);
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
                  <Select placeholder='Select Reason' onChange={handleReason}>
                    {reasonMaster.map((reason) => (
                      <Select.Option value={reason.appeal_id} name={reason.appeal_reason_master}>
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
      </DashboardLayout>
    </>
  );
};

Preview.propTypes = {};

export default Preview;
