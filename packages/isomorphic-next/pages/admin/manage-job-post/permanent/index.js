import React from 'react';
import Head from 'next/head';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';

import JobPostDashboard from '../../../../src/components/job-post-dashboard/index';
import DashboardLayout from '../../../../containers/DashboardLayout/DashboardLayout';

const JobPostPermanentDashboard = () => {
  return (
    <>
      <Head>
        <title>Permanent Job Post(P)</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <JobPostDashboard type='permanent' />
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default JobPostPermanentDashboard;
