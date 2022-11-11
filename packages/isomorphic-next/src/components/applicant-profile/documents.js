import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Upload,
  notification,
  Space,
  Popconfirm,
  Select,
  Typography,
  Divider,
} from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import Box from '@iso/components/utility/box';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';

const mapData = (values, key) => {
  return values.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) });
  }, {});
};

const Documents = ({ onNext, onPrevious }) => {
  let documentType = '';

  const [form] = Form.useForm();
  const { client } = useAuthState();
  const { user } = useUser({});
  const { Option, OptGroup } = Select;
  const { Title, Text } = Typography;

  const [initialData, setInitialData] = useState();
  const [documents, setDocuments] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [documentsList, setDocumentsList] = useState([]);
  const [listOfSingleDocs, setListOfSingleDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/documents/${user.user_id}/`);
      const getDocsList = await client.get(`/document/docs/`);

      if (!response.data.isEmpty && response.data.isEmpty !== 'true') {
        const docList = response.data.map((res) => ({
          key: res.doc_id,
          doc_id: res.doc_id,
          doc_file_path: res.doc_file_path,
          doc_name: res.doc_master.doc_id,
          doc_type: res.doc_master.doc_type,
        }));
        setDocuments(docList);

        setInitialData({
          ...(response.data.length === 0 ? { documents_attachments: [{}] } : { documents_attachments: docList }),
        });

        const requiredDocumentsFilter = response.data.map((doc) => doc.doc_master.doc_id);

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

    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onConfirmDelete = async (index) => {
    const { getFieldsValue } = form;
    const data = getFieldsValue().documents_attachments[index];
    if (data && data.doc_id) {
      await client.delete(`/user/delete/document/`, {
        data: {
          document_id: data.doc_id,
          document_type: 'applicant',
        },
      });
    }
    notification['success']({
      description: 'Document deleted successfully',
    });

    setTimeout(() => {
      const selectedDocArray = form.getFieldsValue().documents_attachments.map((doc) => {
        if (doc) return doc.doc_name;
      });

      setSelectedDocs(selectedDocArray);
    }, 500);
  };

  const onDocumentSelect = (value, obj) => {
    const selectedDocArray = form.getFieldsValue().documents_attachments.map((doc) => {
      if (doc) return doc.doc_name;
    });

    if (!selectedDocs.includes(value)) {
      setSelectedDocs(selectedDocArray);
    }
  };

  const onSubmitForm = async (values) => {
    try {
      if (form.isFieldsTouched()) {
        await client.post(
          `/user/public/documents/${user.user_id}/`,
          values.documents_attachments.map((data, index) => ({
            doc_id: documents[index].doc_id,
            doc_file_path: documents[index].doc_file_path,
            doc_master: { doc_id: data.doc_name },
          }))
        );
      }
      const resumeDoc = documentsList.Personal.filter((doc) => doc.doc_name === 'Resume');
      const isResume = values.documents_attachments.find((doc) => doc.doc_name === resumeDoc[0].doc_id);
      if (!isResume) {
        notification['error']({
          description: 'Resume document is mandatory, please add resume',
        });
      } else {
        notification['success']({
          description: 'Document details added successfully',
        });
        onNext();
        setShowConfirm(false);
      }
    } catch (error) {
      setShowConfirm(false);
    }
  };

  const getDocumentType = (docType) => {
    documentType = docType;
    return docType;
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialData) return null;

  return (
    <FormStyles>
      <Box>
        <Form form={form} name='form' onFinish={onSubmitForm} initialValues={{ ...initialData }} scrollToFirstError>
          <Row gutter={[16, 0]} style={{ background: '#f5f5f5', padding: '10px 0' }}>
            <Col xs={24} lg={8}>
              <Title level={5} style={{ margin: 0 }}>
                Document Name
              </Title>
            </Col>
            <Col xs={22} lg={15}>
              <Title level={5} style={{ margin: 0 }}>
                Upload File
              </Title>
            </Col>
          </Row>
          <Divider style={{ margin: '0 0 5px' }} />
          <Text type='danger'>*Upload file formats allowed are JPEG,JPG,PNG,PDF and maximum size is 500kb </Text>
          <Form.List name='documents_attachments'>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <>
                    {documentType !== documents[field.name]?.doc_type && (
                      <Row gutter={[16, 0]} style={{ marginBottom: 0 }}>
                        <Col xs={24}>
                          <Divider orientation='left' style={{ textTransform: 'capitalize' }}>
                            {getDocumentType(documents[field.name]?.doc_type)}
                          </Divider>
                        </Col>
                      </Row>
                    )}
                    <Form.Item
                      {...field}
                      name={[field.name, 'id']}
                      fieldKey={[field.fieldKey, 'id']}
                      style={{ height: 0, marginBottom: 0 }}
                    >
                      <Input type='hidden' />
                    </Form.Item>
                    <Row gutter={[16, 0]}>
                      <Col xs={24} lg={8}>
                        <Form.Item
                          {...field}
                          label=''
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
                            {Object.keys(documentsList).map((docs) => (
                              <OptGroup label={docs.toUpperCase()}>
                                {documentsList[docs].map((doc) => (
                                  <Option
                                    value={doc.doc_id}
                                    id={doc.doc_id}
                                    disabled={
                                      selectedDocs.includes(doc.doc_id) && listOfSingleDocs.includes(doc.doc_id)
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
                      <Col xs={24} lg={15}>
                        <Form.Item
                          {...field}
                          label=''
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
                              const newDocs = [...documents];
                              newDocs[index] = { doc_id: data.doc_id, doc_file_path: data.doc_file_path };
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
                      <Col xs={24} lg={1}>
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
                              <DeleteOutlined />
                            </Popconfirm>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </>
                ))}
                <Form.Item>
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Document
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Row justify='space-between' style={{ rowGap: 5 }}>
            <Space>
              <Button type='danger' htmlType='button' onClick={onPrevious}>
                Previous
              </Button>
              <Button htmlType='button' onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Space>
            <Space>
              <Popconfirm
                title='Do you need to save the data?'
                okText='Yes'
                cancelText='No'
                onConfirm={() => form.submit()}
                onCancel={() => {}}
                getPopupContainer={(trigger) => trigger.parentNode}
                placement='left'
              >
                <Button type='primary' htmlType='submit'>
                  Save
                </Button>
              </Popconfirm>
              <Popconfirm
                title='Do you need to save the data?'
                okText='Yes'
                cancelText='No'
                visible={showConfirm}
                onConfirm={() => form.submit()}
                onCancel={onNext}
                getPopupContainer={(trigger) => trigger.parentNode}
                placement='left'
              >
                <Button type='primary' htmlType='button' onClick={() => setShowConfirm(true)}>
                  Next
                </Button>
              </Popconfirm>
            </Space>
          </Row>
        </Form>
      </Box>
    </FormStyles>
  );
};

Documents.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default Documents;
