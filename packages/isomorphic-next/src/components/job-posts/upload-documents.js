import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import draftToHtml from 'draftjs-to-html';
// Components
import { Descriptions, Typography, Divider, Modal, Form, Row, Col, Input, Upload, Space, notification } from 'antd';
import Box from '@iso/components/utility/box';
import Table from '@iso/components/uielements/table';
import Button from '@iso/ui/Antd/Button/Button';

import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const UploadDocuments = ({ initialData, docArray, isModalVisible, setDocArray }) => {
  const handleOk = async () => {
    //console.log(documents, positionDocuments);
    // const response = await client.post();
    // setIsModalVisible(false);
  };

  const handleCancel = () => {
    //setIsModalVisible(false);
  };

  const onSubmitForm = (values) => {};

  //   console.log('docArray', docArray);
  //   if (docArray.length === 0) return null;

  return (
    <>
      <Modal title='Required Documents' visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div>
          {initialData.map((dt, i) => (
            <Box>
              <h1>{dt.position}</h1>
              {dt.documents_required.map((doc, index) => (
                <Form.Item
                  label={doc.doc_name}
                  labelCol={{ span: 24 }}
                  name={`doc_file_path_${i}`}
                  rules={[{ required: true, message: 'Please upload' }]}
                >
                  <Upload
                    listType='file'
                    showUploadList={false}
                    action={`${process.env.NEXT_PUBLIC_BASE_API_URL}/user/public/file_upload/?doc_type=applicant`}
                    headers={{
                      authorization: `Token ${localStorage.getItem('token')}`,
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
                        notification['success']({
                          description: `${info.file.name} file upload failed`,
                        });
                      }
                    }}
                    onSuccess={(data) => {
                      // const newDocs = [...documents];
                      // newDocs[i] = {
                      //   application_id: initialData[i].id,
                      //   doc_id: data.doc_id,
                      //   doc_file_path: data.doc_file_path
                      // };
                      // setDocuments(newDocs);
                      // const xd = positionDocuments;
                      // // xd[i][index] = newDocs;
                      // xd[i][index].push({
                      //   application_id: initialData[i].id,
                      //   doc_id: data.doc_id,
                      //   doc_file_path: data.doc_file_path
                      // });
                      // setPositionDocuments[xd];

                      const newArray = docArray;
                      newArray[i].documents[index].doc_id = data.doc_id;
                      newArray[i].documents[index].doc_name = data.doc_name;

                      //console.log('newArray', newArray);
                      setDocArray(newArray);
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      {/* {positionDocuments[i] && positionDocuments[i][index]
                        ? positionDocuments[i][index].doc_file_path.split('/')[
                            positionDocuments[i][index].doc_file_path.split('/').length - 1
                          ]
                        : 'Upload File'}{' '} */}
                      {docArray[i].documents[index].doc_name !== ''
                        ? docArray[i].documents[index].doc_name
                        : 'Upload File'}
                    </Button>
                  </Upload>
                </Form.Item>
              ))}
            </Box>
          ))}
        </div>
        <pre>{JSON.stringify(docArray, null, 2)}</pre>
      </Modal>
    </>
  );
};

export default UploadDocuments;
