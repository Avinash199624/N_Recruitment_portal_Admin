import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthState } from '../../../../src/components/auth/hook';
import useUser from '../../../../src/components/auth/useUser';
import { Space, Row, Col, notification, Switch, Tooltip } from 'antd';
// Layouts
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import Table from '@iso/components/uielements/table';
import PageHeader from '@iso/components/utility/pageHeader';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';
import ListingStyles from '../../../../styled/Listing.styles';
import ManageJobPostStyles from '../../../../containers/Admin/ManageJobPost/ManageJobPost.styles';

const TraineePaymentList = () => {
  const { client } = useAuthState();
  const router = useRouter();
  const { user } = useUser({});
  const { id } = router.query;
  const [Details, setDetails] = useState();
  const [loading, setLoading] = useState(true);
  const { Column } = Table;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`user/public/trainee_temp_subs_payment_gateways_details/${id}/`);
      if (!response.data.isEmpty) {
        const dataSource = response.data.map((res, index) => ({
          ...res,
          sr_no: index + 1,
          key: res.ts_uuid,
        }));
        setDetails(dataSource);
        setLoading(false);
      }
    };
    if (user && user.isLoggedIn) load();
  }, [user, client]);

  const onChange = async (is_verified, key) => {
    await client.put(`user/public/trainee_management_temp_subs_payment_gateways_update/${key}/`, {
      is_verified: !is_verified,
    });
    if (is_verified == false) {
      notification['success']({
        description: `Verified Successfully`,
      });
    } else {
      notification['success']({
        description: `Unverified Successfully`,
      });
    }
    const response = await client.get(`user/public/trainee_temp_subs_payment_gateways_details/${id}/`);
    if (!response.data.isEmpty) {
      const dataSource = response.data.map((res, index) => ({
        ...res,
        sr_no: index + 1,
        key: res.ts_uuid,
      }));
      setDetails(dataSource);
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardLayout>
        <LayoutContentWrapper>
          <ManageJobPostStyles>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }}>
                <PageHeader>Payment Details</PageHeader>
                <ListingStyles>
                  <Row>
                    <Col span={24}>
                      <Table dataSource={Details} getPopupContainer={(trigger) => trigger.parentNode}>
                        <Column title='Sr.No' key='sr_no' dataIndex='sr_no' />
                        <Column title='Transaction ID' dataIndex='transaction_id' key='transaction_id' />
                        <Column
                          title='Subscription Type'
                          dataIndex='subscription_type'
                          key='subscription_type'
                          sorter={(a, b) => a.subscription_type.localeCompare(b.subscription_type)}
                        />
                        <Column title='Payment Date' dataIndex='payment_date' key='subscription_type' />
                        <Column title='Amount' dataIndex='amount' key='amount' />
                        <Column
                          title='Receipt Image'
                          dataIndex='payment_receipt_image'
                          key='payment_receipt_image'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Tooltip title='Go to payment receipt'>
                                <a href={record.payment_receipt_image} target='_blank'>
                                  View
                                </a>
                              </Tooltip>
                            </Space>
                          )}
                        />

                        <Column
                          title='Verified'
                          key='is_verified'
                          width='5%'
                          render={(text, record) => (
                            <Space size='middle'>
                              <Tooltip
                                placement='bottom'
                                title={
                                  record.is_verified === true
                                    ? 'Are you sure to Unverified?'
                                    : 'Are you sure to verified?'
                                }
                              >
                                <Switch
                                  onChange={() => onChange(record.is_verified, record.key)}
                                  checked={record.is_verified}
                                />
                              </Tooltip>
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

export default TraineePaymentList;
