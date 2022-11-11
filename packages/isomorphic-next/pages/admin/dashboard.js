import React, { useState, useEffect } from 'react';
import Head from 'next/head';
// import Widgets from '@iso/containers/Widgets/Widgets';
import { Typography } from 'antd';
// import { Row, Space } from 'antd';
// import Button from '@iso/ui/Antd/Button/Button';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import useUser from '../../src/components/auth/useUser';
import ChangePassword from '../../containers/changePassword';
// import { StyledButton } from '../../style/commonStyle';

// const styles = {
//   mainSection: {
//     display: 'flex',
//     width: '100%',
//     justifyContent: 'space-between'
//   },
//   container: {
//     padding: '20px 10px',
//     borderRadius: '4px',
//     width: '100%'
//   }
// };

export default function Dashboard() {
  const { Title } = Typography;
  const { user } = useUser({ redirectTo: '/admin' });
  const [userId, setUserId] = useState('');
  const [userDetails, setUserDetails] = useState(undefined);

  useEffect(() => {
    const load = () => {
      let userInfo = user;
      setUserId(userInfo?.user?.user_id);
      setUserDetails(userInfo?.user);
    };
    if (user && user.isLoggedIn) load();
  }, []);

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardLayout>
        {userDetails && userDetails.is_first_login ? (
          <ChangePassword user={userId} userDetails={userDetails} route={'/admin/'} />
        ) : (
          ''
        )}
        <LayoutContentWrapper>
          <Title>Welcome {user.username}</Title>
          {/* <div style={styles.container}>
            <div style={styles.mainSection}>
              <Row justify='center'>
                <Space wrap justify='center' align='center'>
                  <StyledButton type='primary' onClick={() => router.push('/admin/reports')}>
                    Reports
                  </StyledButton>
                </Space>
              </Row>
            </div>
          </div> */}
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
}
