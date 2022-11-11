import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { Row, Col, Form, Input, Button, Select, notification, Checkbox, Space, Popconfirm } from 'antd';
import Box from '@iso/components/utility/box';
import PageHeader from '@iso/components/utility/pageHeader';
import FormStyles from '../../../styled/Form.styles';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';
import {
  mapAddressGetData,
  mapLocalAddressPostData,
  mapFatherAddressPostData,
  mapPermanentAddressPostData,
} from './helpers';

const Address = ({ onNext, onPrevious }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { validateFields } = form;
  const { client } = useAuthState();
  const { user } = useUser({});
  const [initialData, setInitialData] = useState();
  const { Option } = Select;
  const [isPermAddressSame, setIsPermAddressSame] = useState(false);
  const [isFatherAddressSameAsPermAddress, setIsFatherAddressSameAsPermAddress] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [country, setCountry] = useState([]);
  const [states, setStatelist] = useState([]);
  const [city, setCity] = useState([]);
  //const [countryID, setCountryID] = useState();

  useEffect(() => {
    const load = async () => {
      const responseFatherAddress = await client.get(
        `/user/public/applicant_address/${user.user_id}/?address_type=father_address`
      );
      const responseLocalAddress = await client.get(
        `/user/public/applicant_address/${user.user_id}/?address_type=local_address`
      );
      const responsePermanentAddress = await client.get(
        `/user/public/applicant_address/${user.user_id}/?address_type=permanent_address`
      );

      const response = await client.get(`/user/public/applicant_is_address_same/${user.user_id}/`);
      const CountryResponse = await client.get(`/user/countries/`);
      //static state list show
      const Stateresponse = await client.get(`/user/state-country-wise/101/`);
      setStatelist(Stateresponse.data);

      setCountry(CountryResponse.data);
      setIsPermAddressSame(response.data.is_permenant_address_same_as_local);
      setIsFatherAddressSameAsPermAddress(response.data.is_father_address_same_as_local);
      setInitialData(
        mapAddressGetData(responseLocalAddress.data, responsePermanentAddress.data, responseFatherAddress.data)
      );
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onIsPermAddressChange = async (e) => {
    await setIsPermAddressSame(e.target.checked);
  };

  const onIsFatherAddressChange = async (e) => {
    await setIsFatherAddressSameAsPermAddress(e.target.checked);
  };

  const onIsPermAddressSameChange = async () => {
    await client.put(`/user/public/applicant_is_address_same/${user.user_id}/`, {
      user_id: user.user_id,
      is_permenant_address_same_as_local: isPermAddressSame,
      is_father_address_same_as_local: isFatherAddressSameAsPermAddress,
    });
    // await setIsPermAddressSame(e.target.checked);
    validateFields(['isPermAddressSame']);
    validateFields();
  };

  const onIsFatherAddressSameAsPermAddress = async () => {
    await client.put(`/user/public/applicant_is_address_same/${user.user_id}/`, {
      user_id: user.user_id,
      is_permenant_address_same_as_local: isPermAddressSame,
      is_father_address_same_as_local: isFatherAddressSameAsPermAddress,
    });
    // await setIsFatherAddressSameAsPermAddress(e.target.checked);
    validateFields(['isFatherAddressSameAsPermAddress']);
    validateFields();
  };

  const handleStateChange = async (value, key) => {
    const Stateresponse = await client.get(`/user/cities-data/${key.key}/101/`);
    setCity(Stateresponse.data);
  };

  const onSubmitForm = async (values) => {
    try {
      if (initialData.local_isEmpty === 'true') {
        await client.post(
          `/user/public/applicant_address_create/${user.user_id}/?address_type=local_address`,
          mapLocalAddressPostData(values, user.userid)
        );
        notification['success']({
          description: 'Local address added successfully',
        });
      } else {
        await client.put(
          `/user/public/applicant_address_update/${user.user_id}/?address_type=local_address`,
          mapLocalAddressPostData(values, user.userid)
        );
        notification['success']({
          description: 'Local address updated successfully',
        });
      }

      if (!isPermAddressSame) {
        if (initialData.permanent_isEmpty === 'true') {
          await client.post(
            `/user/public/applicant_address_create/${user.user_id}/?address_type=permanent_address`,
            mapPermanentAddressPostData(values, user.userid)
          );
          notification['success']({
            description: 'Permanent address added successfully',
          });
        } else {
          await client.put(
            `/user/public/applicant_address_update/${user.user_id}/?address_type=permanent_address`,
            mapPermanentAddressPostData(values, user.userid)
          );
          notification['success']({
            description: 'Permanent address updated successfully',
          });
        }
      }

      if (!isFatherAddressSameAsPermAddress) {
        if (initialData.father_isEmpty === 'true') {
          await client.post(
            `/user/public/applicant_address_create/${user.user_id}/?address_type=father_address`,
            mapFatherAddressPostData(values, user.userid)
          );
          notification['success']({
            description: 'Father address added successfully',
          });
        } else {
          await client.put(
            `/user/public/applicant_address_update/${user.user_id}/?address_type=father_address`,
            mapFatherAddressPostData(values, user.userid)
          );
          notification['success']({
            description: 'Father address updated successfully',
          });
        }
      }

      onIsPermAddressSameChange();
      onIsFatherAddressSameAsPermAddress();
      setShowConfirm(false);

      if (router.query && router.query?.redirect) {
        Router.push(
          `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
        );
      } else {
        onNext();
      }
    } catch (error) {
      setShowConfirm(false);
    }
  };

  const onBackToPreview = () => {
    Router.push(
      `${router.query.redirect}&job_posting_id=${router.query.job_posting_id}&applicantId=${router.query.applicantId}`
    );
  };

  if (!user || !user.isLoggedIn) {
    return null;
  }

  if (!initialData) return null;

  return (
    <FormStyles>
      <Form form={form} name='form' onFinish={onSubmitForm} initialValues={{ ...initialData }} scrollToFirstError>
        <Box>
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <PageHeader>Residential Address</PageHeader>
            </Col>
            <Col span={24}>
              <Row gutter={[16, 0]}>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_address1'
                    label='Address1'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter address 1',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='local_address2' label='Address2' labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='local_address3' label='Address3' labelCol={{ span: 24 }}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_telephone_no'
                    label='Phone Number'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Phone number must be number',
                      },
                      {
                        min: 10,
                        message: 'Phone mumber must be at least 10 digits',
                      },
                    ]}
                  >
                    <Input maxLength={13} type='tel' />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_country'
                    label='Country'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select Country',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select Country'
                      //onChange={handleCountryChange}
                      showSearch
                      optionFilterProp='children'
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      defaultValue='India'
                      disabled
                    >
                      {country.map((list) => (
                        <Option value={list.country_name} key={list.id}>
                          {list.country_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_state'
                    label='State'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please select State',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select State'
                      onChange={handleStateChange}
                      optionFilterProp='children'
                      showSearch
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {states.map((list) => (
                        <Option value={list.state_name} key={list.id}>
                          {list.state_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_city'
                    label='City'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter city',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select City'
                      optionFilterProp='children'
                      showSearch
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {city.map((list) => (
                        <Option value={list.city_name} key={list.id}>
                          {list.city_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='local_postcode'
                    label='Pincode'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter pincode',
                      },
                      {
                        min: 6,
                        message: 'Please enter valid pincode',
                      },
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Pincode must be numeric',
                      },
                    ]}
                  >
                    <Input maxLength={6} type='tel' />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Box>
        <Box>
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <PageHeader>Permanent Address</PageHeader>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name='isPermAddressSame' label='' labelCol={{ span: 24 }}>
                <Checkbox checked={isPermAddressSame} onChange={onIsPermAddressChange} style={{ lineHeight: '32px' }}>
                  Do you want this same as residential address ?
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={[16, 0]}>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_address1'
                    label='Address1'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isPermAddressSame,
                        message: 'Please enter address 1',
                      },
                    ]}
                  >
                    <Input disabled={isPermAddressSame} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='permanent_address2' label='Address2' labelCol={{ span: 24 }}>
                    <Input disabled={isPermAddressSame} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='permanent_address3' label='Address3' labelCol={{ span: 24 }}>
                    <Input disabled={isPermAddressSame} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_telephone_no'
                    label='Phone Number'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Phone number must be number',
                      },
                      {
                        min: 10,
                        message: 'Phone mumber must be at least 10 digits',
                      },
                    ]}
                  >
                    <Input maxLength={13} type='tel' disabled={isPermAddressSame} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_country'
                    label='Country'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isPermAddressSame,
                        message: 'Please select Country',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select Country'
                      disabled={isPermAddressSame}
                      showSearch
                      //onChange={handleCountryChange}
                      optionFilterProp='children'
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      defaultValue='India'
                      disabled
                    >
                      {country.map((list) => (
                        <Option value={list.country_name} key={list.id}>
                          {list.country_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_state'
                    label='State'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isPermAddressSame,
                        message: 'Please select State',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select State'
                      disabled={isPermAddressSame}
                      onChange={handleStateChange}
                      showSearch
                      optionFilterProp='children'
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {states.map((list) => (
                        <Option value={list.state_name} key={list.id}>
                          {list.state_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_city'
                    label='City'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isPermAddressSame,
                        message: 'Please enter city',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select City'
                      disabled={isPermAddressSame}
                      optionFilterProp='children'
                      showSearch
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {city.map((list) => (
                        <Option value={list.city_name} key={list.id}>
                          {list.city_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='permanent_postcode'
                    label='Pincode'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isPermAddressSame,
                        message: 'Please enter pincode',
                      },
                      {
                        min: 6,
                        message: 'Please enter valid pincode',
                      },
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Pincode must be numeric',
                      },
                    ]}
                  >
                    <Input maxLength={6} type='tel' disabled={isPermAddressSame} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Box>
        <Box>
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <PageHeader>Father Address</PageHeader>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item name='isFatherAddressSameAsPermAddress' label='' labelCol={{ span: 24 }}>
                <Checkbox
                  checked={isFatherAddressSameAsPermAddress}
                  onChange={onIsFatherAddressChange}
                  style={{ lineHeight: '32px' }}
                >
                  Do you want this same as permanent address ?
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={[16, 0]}>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_address1'
                    label='Address1'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isFatherAddressSameAsPermAddress,
                        message: 'Please enter address 1',
                      },
                    ]}
                  >
                    <Input disabled={isFatherAddressSameAsPermAddress} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='father_address2' label='Address2' labelCol={{ span: 24 }}>
                    <Input disabled={isFatherAddressSameAsPermAddress} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item name='father_address3' label='Address3' labelCol={{ span: 24 }}>
                    <Input disabled={isFatherAddressSameAsPermAddress} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_telephone_no'
                    label='Phone Number'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Phone number must be number',
                      },
                      {
                        min: 10,
                        message: 'Phone mumber must be at least 10 digits',
                      },
                    ]}
                  >
                    <Input maxLength={13} type='tel' disabled={isFatherAddressSameAsPermAddress} />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_country'
                    label='Country'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isFatherAddressSameAsPermAddress,
                        message: 'Please select Country',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select Country'
                      disabled={isFatherAddressSameAsPermAddress}
                      // onChange={handleCountryChange}
                      showSearch
                      optionFilterProp='children'
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      defaultValue='India'
                      disabled
                    >
                      {country.map((list) => (
                        <Option value={list.country_name} key={list.id}>
                          {list.country_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_state'
                    label='State'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isFatherAddressSameAsPermAddress,
                        message: 'Please select State',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select State'
                      disabled={isFatherAddressSameAsPermAddress}
                      onChange={handleStateChange}
                      showSearch
                      optionFilterProp='children'
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {states.map((list) => (
                        <Option value={list.state_name} key={list.id}>
                          {list.state_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_city'
                    label='City'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isFatherAddressSameAsPermAddress,
                        message: 'Please enter city',
                      },
                    ]}
                  >
                    <Select
                      placeholder='Select City'
                      disabled={isFatherAddressSameAsPermAddress}
                      optionFilterProp='children'
                      showSearch
                      getPopupContainer={(trigger) => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {city.map((list) => (
                        <Option value={list.city_name} key={list.id}>
                          {list.city_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={6}>
                  <Form.Item
                    name='father_postcode'
                    label='Pincode'
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: !isFatherAddressSameAsPermAddress,
                        message: 'Please enter pincode',
                      },
                      {
                        min: 6,
                        message: 'Please enter valid pincode',
                      },
                      {
                        pattern: new RegExp(/^[0-9\b]+$/),
                        message: 'Pincode must be numeric',
                      },
                    ]}
                  >
                    <Input maxLength={6} type='tel' disabled={isFatherAddressSameAsPermAddress} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Box>
        <Row justify='space-between' style={{ rowGap: 5 }}>
          <Space>
            {router.query && router.query?.redirect && (
              <Button htmlType='button' onClick={onBackToPreview}>
                Back to Application Preview
              </Button>
            )}
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
              placement='topRight'
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
    </FormStyles>
  );
};

Address.propTypes = {
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default Address;
