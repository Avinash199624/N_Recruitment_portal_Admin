import React from 'react';
import Head from 'next/head';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
import JobPostDashboard from '../../../../src/components/job-post-dashboard/index';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';

const JobPostTemporaryDashboard = () => {
  return (
    <>
      <Head>
        <title>Temporary Job Post(T)</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <JobPostDashboard type='temporary' />
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};
export default JobPostTemporaryDashboard;
