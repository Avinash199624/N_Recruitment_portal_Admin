import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Row, Col, Space } from 'antd';
import { EyeFilled, PhoneFilled, MessageFilled } from '@ant-design/icons';

import { StyledButton } from '../../../style/commonStyle';
import { APPLICATION_SCRUTINY, JOB_POSTING_T, JOB_POSTING_P } from '../../../static/constants/userRoles';
import useUser from '../../../src/components/auth/useUser';

const styles = {
  mainSection: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  container: {
    padding: '20px 10px',
    background: '#fff',
    borderRadius: '4px',
    width: '100%',
    boxShadow: '0px 5px 6px rgb(0 0 0 / 4%)',
  },
  row: {
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    display: 'flex',
    width: '100%',
    padding: '40px 20px',
  },
  iconWrapper: {
    background: '#F93A0B26 0% 0% no-repeat padding-box',
    borderRadius: 60,
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  label: {
    color: '#6E6E6E',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    color: '#01111C',
    fontSize: 20,
  },
};

const dashboardData = [
  {
    label: 'Job Post Views',
    count: '94',
    icon: (
      <EyeFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
  {
    label: 'Active Job Post',
    count: '25',
    icon: (
      <MessageFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
  {
    label: 'Active Applications',
    count: '874',
    icon: (
      <EyeFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
  {
    label: 'Total hired till date',
    count: '2500',
    icon: (
      <EyeFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
  {
    label: 'Total Job Posts',
    count: '221',
    icon: (
      <EyeFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
  {
    label: 'Total Applications',
    count: '4000',
    icon: (
      <PhoneFilled
        style={{
          color: '#F93A0B',
          fontSize: '24px',
        }}
      />
    ),
  },
];

const JobPostDashboard = ({ type }) => {
  const router = useRouter();
  const { roles } = useUser({});

  const userRole = roles && roles.length ? roles : '';

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        <Row gutter={[24, 24]} style={{ width: '100%' }}>
          {dashboardData &&
            dashboardData.length &&
            dashboardData.map((item, index) => {
              return (
                <Col xs={8} lg={4} style={styles.row} key={Math.random()}>
                  <Row justify='center'>
                    <div style={styles.iconWrapper}>{item.icon}</div>
                  </Row>
                  <Row justify='center' style={styles.title}>
                    <b>{item.count}</b>
                  </Row>
                  <Row style={styles.label} justify='center'>
                    {item.label}
                  </Row>
                </Col>
              );
            })}
        </Row>
      </div>
      <Row style={{ padding: '30px 10px 10px' }} justify='center'>
        <Space wrap justify='center' align='center'>
          {type === 'temporary' && [JOB_POSTING_T, APPLICATION_SCRUTINY].some((r) => userRole.indexOf(r) >= 0) && (
            <StyledButton type='primary' onClick={() => router.push(`${type}/list`)}>
              Job Posts
            </StyledButton>
          )}
          {type === 'permanent' && [APPLICATION_SCRUTINY, JOB_POSTING_P].some((r) => userRole.indexOf(r) >= 0) && (
            <StyledButton type='primary' onClick={() => router.push(`${type}/list`)}>
              Job Posts
            </StyledButton>
          )}
          {[JOB_POSTING_P, JOB_POSTING_T].some((r) => userRole.indexOf(r) >= 0) && (
            <StyledButton type='primary' onClick={() => router.push(`${type}/add`)}>
              New Notifications
            </StyledButton>
          )}
          <StyledButton type='primary' onClick={() => router.push('/admin/reports')}>
            Reports
          </StyledButton>
        </Space>
      </Row>
    </div>
  );
};

JobPostDashboard.propTypes = {
  type: PropTypes.string.isRequired,
};

export default JobPostDashboard;
