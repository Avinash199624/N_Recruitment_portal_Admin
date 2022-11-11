import React, { useEffect, useState } from 'react';
import Head from 'next/head';
// Hooks / API Calls / Helper functions
import { useRouter } from 'next/router';
import { useAuthState } from '../../src/components/auth/hook';
import useUser from '../../src/components/auth/useUser';
// Components
import Table from '@iso/components/uielements/table';
import {
  Popconfirm,
  Form,
  Row,
  Col,
  Upload,
  Space,
  notification,
  Button,
  Select,
  Input,
  Tooltip,
  Typography,
  Spin,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DeleteTwoTone,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
import LayoutWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
// Styles
import JobPostsStyles from '../../src/components/job-posts/JobPosts.styles';
import FormStyles from '../../styled/Form.styles';

const antIcon = <LoadingOutlined style={{ fontSize: 20, color: '#FFF', marginRight: 10 }} spin />;

const mapData = (values, key) => {
  return values.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
  }, {});
};

const DocumentUpload = () => {
  const router = useRouter();
  const { client } = useAuthState();
  const { user } = useUser({});
  const [form] = Form.useForm();

  const { Column } = Table;
  const { Option, OptGroup } = Select;
  const { Text } = Typography;
  const { confirm } = Modal;

  const {
    query: { position_id, applicantId, job_posting },
  } = router;

  const [docArray, setDocArray] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [tableList, setTableList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [listOfSingleDocs, setListOfSingleDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [requiredDocumentsName, setRequiredDocumentsName] = useState([]);
  const [deletedRequiredDocs, setDeletedRequiredDocs] = useState([]);
  const [allRequiredDocument, setAllRequiredDocument] = useState([]);

  useEffect(() => {
    const load = async () => {
      const docResponse = await client.get(`/user/public/documents/${user.user_id}/?positions=${position_id}`);
      const getDocsList = await client.get(`/document/docs/`);

      if (docResponse) {
        const dt = docResponse.data.required_data.map((d) => ({ ...d, applicant_id: applicantId }));
        setDocArray(dt.map((d) => ({ ...d, isPreviouslyUploaded: d.doc_id !== null ? true : false })));

        const tableData = docResponse.data.required_data.map((res, index) => ({
          key: res.doc_id,
          id: index,
          doc_name: res.doc_name,
          doc: {
            doc_id: res.doc_id,
            doc_file_path: res.doc_file_path,
            doc_name: res.doc_name,
            doc_name_id: res.doc_name_id,
          },
          file:
            res.doc_id !== null
              ? [
                  {
                    uid: res.doc_id,
                    name: res.doc_name,
                    status: 'done',
                    url: res.doc_file_path,
                  },
                ]
              : [],
          selected: res.doc_id !== null ? true : false,
          preview: res.doc_file_path,
        }));

        setAllRequiredDocument(docResponse.data.required_data.map((res, index) => res.doc_name));
        setTableList(tableData);

        const requiredDocumentsFilter = docResponse.data.required_data.map((doc) => doc.doc_name_id);
        const requiredDocsName = docResponse.data.required_data.map((doc) => ({
          id: doc.doc_name_id,
          name: doc.doc_name,
        }));

        setRequiredDocuments(requiredDocumentsFilter);
        setRequiredDocumentsName(requiredDocsName);
        setSelectedDocs(requiredDocumentsFilter);
      }

      if (getDocsList) {
        setDocumentsList(mapData(getDocsList.data, 'doc_type'));

        const filterSingleAllowDocs = Object.values(getDocsList.data)
          .filter((docs) => !docs.multiple_allow)
          .map((docs) => docs.doc_id);

        setListOfSingleDocs(filterSingleAllowDocs);
      }
    };

    if (user && user.isLoggedIn && position_id) {
      load();
    }
  }, [position_id, user]);

  const onSubmitForm = async () => {
    const isDocUploaded = docArray.filter((item) => item.doc_name_id === '' || item.doc_name_id === null).length;

    if (deletedRequiredDocs.length === 0 && isDocUploaded === 0) {
      const requiredDocuments = docArray.map((doc) => ({
        doc_id: doc.doc_id,
        doc_master: { doc_id: doc.doc_name_id },
      }));

      if (documents.length > 0) {
        documents.map((document, index) => {
          requiredDocuments[requiredDocuments.length + index] = {
            doc_id: document.doc_id,
            doc_master: { doc_id: document.doc_master.doc_id },
          };
        });
      }

      const postData = {
        application_id: applicantId,
        documents: requiredDocuments,
      };

      setSubmitting(true);

      const response = await client.post(`/user/applications/documents/`, postData);

      if (response?.status === 200) {
        notification['success']({
          description: response.data?.message,
        });
        setTimeout(() => {
          router.push(
            `/job-posts/require-information/?position_id=${position_id}&applicantId=${applicantId}&job_posting_id=${job_posting}`
          );
        }, 500);
      } else {
        if (response?.data?.message) {
          notification['warning']({
            description: response.data?.message,
          });
        } else {
          notification['warning']({
            description: 'Something went wrong',
          });
        }
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
      notification['error']({
        description: 'Please upload all documents',
      });
    }
  };

  const onHardDelete = async (id, key, name, doc_type_id) => {
    if (key) {
      await client.delete(`/user/delete/document/`, {
        data: {
          document_id: key,
          document_type: 'applicant',
        },
      });
    }

    const data = tableList.filter((list) => list.id !== id);

    setTableList(data);

    const index = allRequiredDocument.indexOf(name);
    allRequiredDocument.splice(index, 1);

    if (
      form.getFieldsValue().documents_attachments.filter((doc) => doc.doc_name === doc_type_id).length === 0 &&
      !allRequiredDocument.includes(name)
    ) {
      setDeletedRequiredDocs([...deletedRequiredDocs, name]);
    }

    notification['success']({
      description: `Document deleted successfully`,
    });
  };

  const onConfirmDelete = async (index) => {
    const { getFieldsValue } = form;
    const data = getFieldsValue().documents_attachments[index];

    if (data) {
      if (requiredDocuments.includes(data.doc_name)) {
        const getDocName = requiredDocumentsName.filter((doc) => doc.id === data.doc_name);

        if (!allRequiredDocument.includes(getDocName[0].name)) {
          setDeletedRequiredDocs([...deletedRequiredDocs, getDocName[0].name]);
        }
      }

      if (data && data.doc_id) {
        await client.delete(`/user/delete/document/`, {
          data: {
            document_id: data.doc_id,
            document_type: 'applicant',
          },
        });
      }

      notification['success']({
        description: `Document deleted successfully`,
      });

      setTimeout(() => {
        const selectedDocArray = form.getFieldsValue().documents_attachments.map((doc) => {
          if (doc) return doc.doc_name;
        });

        setSelectedDocs([...requiredDocuments, ...selectedDocArray]);
      }, 500);
    }
  };

  const onDocumentSelect = (value, obj) => {
    const selectedDocArray = form.getFieldsValue().documents_attachments.map((doc) => {
      if (doc) return doc.doc_name;
    });

    if (!selectedDocs.includes(value)) {
      setSelectedDocs([...requiredDocuments, ...selectedDocArray]);
    }

    // Check if deleted document exist than remove from deleted state
    if (deletedRequiredDocs.includes(obj.children)) {
      const index = deletedRequiredDocs.indexOf(obj.children);
      deletedRequiredDocs.splice(index, 1);
    }
  };

  const showConfirm = () => {
    confirm({
      title: 'Are you sure you want to submit?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        onSubmitForm();
      },
      onCancel() {},
    });
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Upload Documents</title>
      </Head>
      <JobPostsStyles>
        <DashboardLayout>
          <LayoutWrapper>
            <PageHeader>Submit Required Documents</PageHeader>
            <Box>
              <FormStyles>
                <Row gutter={[16, 0]}>
                  <Col span={24} style={{ textAlign: 'right', marginBottom: 8 }}>
                    <Text type='danger'>
                      <small>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </small>
                    </Text>
                  </Col>
                  <Col span={24}>
                    <Table dataSource={tableList} rowKey={(record) => record.key} pagination={false}>
                      <Column title='Document Name' dataIndex='doc_name' key='doc_name' />
                      <Column
                        title='Update Document'
                        dataIndex='doc'
                        key='doc'
                        render={(text, record) => (
                          <Upload
                            listType='file'
                            accept='.pdf,.jpeg,.jpg,.png'
                            defaultFileList={record.file}
                            action={`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=applicant&user_id=${user.user_id}`}
                            headers={{
                              authorization: `Token ${localStorage.getItem('token')}`,
                            }}
                            beforeUpload={(file) => {
                              if (file && file.size > 500000) {
                                notification['error']({
                                  description: `file size should be less than 500kb`,
                                });
                                return false;
                              }
                            }}
                            maxCount={1}
                            multiple={false}
                            onChange={(info) => {
                              if (info.file.status !== 'uploading') {
                                // TODO: ankit add loader here
                                //console.log(info.file, info.fileList);
                              }
                              if (info.file.status === 'done') {
                                notification['success']({
                                  description: `${info.file.name} file uploaded successfully`,
                                });
                              } else if (info.file.status === 'error') {
                                notification['error']({
                                  description: `${info.file.name} file uploaded failed`,
                                });
                              }
                            }}
                            onSuccess={(data) => {
                              docArray[record.id].doc_id = data.doc_id;
                              docArray[record.id].doc_name = data.doc_name;
                              docArray[record.id].doc_file_path = data.doc_file_path;
                              docArray[record.id].doc_name_id = record.doc.doc_name_id;
                            }}
                            onRemove={() =>
                              onHardDelete(record.id, record.key, record.doc_name, record.doc.doc_name_id)
                            }
                          >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                          </Upload>
                        )}
                      />
                      <Column
                        title='Action'
                        key='action'
                        width='5%'
                        render={(text, record) => (
                          <>
                            {!listOfSingleDocs.includes(record.doc.doc_name_id) && (
                              <Space size='middle'>
                                <Popconfirm
                                  title='Are you sure to delete this document?'
                                  onConfirm={() =>
                                    onHardDelete(record.id, record.key, record.doc_name, record.doc.doc_name_id)
                                  }
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
                          </>
                        )}
                      />
                    </Table>
                  </Col>
                </Row>
                <Col gutter={[16, 0]} style={{ marginTop: 15 }}>
                  <Form
                    form={form}
                    name='form'
                    // onFinish={onSubmitForm}
                    initialValues={{ documents_attachments: [] }}
                    scrollToFirstError
                  >
                    <Form.List name='documents_attachments'>
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <React.Fragment key={String(index)}>
                              <Form.Item
                                {...field}
                                name={[field.name, 'id']}
                                fieldKey={[field.fieldKey, 'id']}
                                style={{ height: 0, marginBottom: 0 }}
                              >
                                <Input type='hidden' />
                              </Form.Item>
                              <Row gutter={[16, 0]}>
                                <Col xs={24} lg={10}>
                                  <Form.Item
                                    {...field}
                                    label='Document Name'
                                    labelCol={{ span: 24 }}
                                    name={[field.name, 'doc_name']}
                                    fieldKey={[field.fieldKey, 'doc_name']}
                                    rules={[{ required: true, message: 'Please select document name' }]}
                                  >
                                    <Select
                                      placeholder='Document Name'
                                      getPopupContainer={(trigger) => trigger.parentNode}
                                      onChange={onDocumentSelect}
                                    >
                                      {Object.keys(documentsList).map((docs, index) => (
                                        <OptGroup label={docs.toUpperCase()} key={String(index)}>
                                          {documentsList[docs].map((doc) => (
                                            <Option
                                              value={doc.doc_id}
                                              id={doc.doc_id}
                                              disabled={
                                                selectedDocs.includes(doc.doc_id) &&
                                                listOfSingleDocs.includes(doc.doc_id)
                                              }
                                            >
                                              {doc.doc_name}
                                            </Option>
                                          ))}
                                        </OptGroup>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col xs={22} lg={12}>
                                  <Form.Item
                                    {...field}
                                    label='File'
                                    labelCol={{ span: 24 }}
                                    name={[field.name, 'doc_file_path']}
                                    fieldKey={[field.fieldKey, 'doc_file_path']}
                                    rules={[{ required: true, message: 'Please upload' }]}
                                  >
                                    <Upload
                                      listType='file'
                                      accept='.pdf,.jpeg,.jpg,.png'
                                      showUploadList={false}
                                      action={`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=applicant&user_id=${user.user_id}`}
                                      headers={{
                                        authorization: `Token ${localStorage.getItem('token')}`,
                                      }}
                                      beforeUpload={(file) => {
                                        if (file && file.size > 500000) {
                                          notification['error']({
                                            description: `file size should be less than 500kb`,
                                          });
                                          return false;
                                        }
                                      }}
                                      onChange={(info) => {
                                        if (info.file.status !== 'uploading') {
                                          //console.log(info.file, info.fileList);
                                        }
                                        if (info.file.status === 'done') {
                                          notification['success']({
                                            description: `${info.file.name} file uploaded successfully`,
                                          });
                                        } else if (info.file.status === 'error') {
                                          notification['error']({
                                            description: `${info.file.name} file upload failed`,
                                          });
                                        }
                                      }}
                                      onSuccess={(data) => {
                                        const doc_type_id =
                                          form.getFieldsValue().documents_attachments[field.name].doc_name;

                                        const newDocs = [...documents];
                                        newDocs[index] = {
                                          doc_id: data.doc_id,
                                          doc_file_path: data.doc_file_path,
                                          doc_master: {
                                            doc_id: doc_type_id,
                                          },
                                        };
                                        setDocuments(newDocs);
                                      }}
                                    >
                                      <Button icon={<UploadOutlined />}>
                                        {documents[index]
                                          ? documents[index].doc_file_path.split('/')[
                                              documents[index].doc_file_path.split('/').length - 1
                                            ]
                                          : 'Upload File'}{' '}
                                      </Button>
                                    </Upload>
                                  </Form.Item>
                                </Col>
                                <Col xs={2} lg={1} style={{ padding: '30px 16px 0' }}>
                                  <Space>
                                    {fields.length >= 1 && (
                                      <Popconfirm
                                        title='Are you sure to delete this document?'
                                        onConfirm={() => {
                                          onConfirmDelete(index);
                                          remove(field.name);
                                        }}
                                        onCancel={() => {}}
                                        getPopupContainer={(trigger) => trigger.parentNode}
                                        placement='left'
                                      >
                                        <DeleteTwoTone />
                                      </Popconfirm>
                                    )}
                                  </Space>
                                </Col>
                              </Row>
                            </React.Fragment>
                          ))}
                          <Form.Item>
                            <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                              Add New Document
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                    <Row justify='space-around' style={{ marginTop: 20 }}>
                      <Form.Item>
                        <Space size='middle'>
                          <Button
                            type='primary'
                            htmlType='submit'
                            onClick={showConfirm}
                            disabled={submitting}
                            loading={submitting}
                          >
                            {submitting && <Spin indicator={antIcon} />}
                            Submit
                          </Button>
                        </Space>
                      </Form.Item>
                    </Row>
                  </Form>
                </Col>
              </FormStyles>
            </Box>
          </LayoutWrapper>
        </DashboardLayout>
      </JobPostsStyles>
    </>
  );
};

export default DocumentUpload;
