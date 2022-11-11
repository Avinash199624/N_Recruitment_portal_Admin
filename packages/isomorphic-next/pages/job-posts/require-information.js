import React from 'react';
import Head from 'next/head';
// Layouts
import DashboardLayout from '../../containers/DashboardLayout/DashboardLayout';
import LayoutContentWrapper from '@iso/components/utility/layoutWrapper';
// Components
import JobPostPreview from '../../src/components/job-posts/job-post-preview';

const RequireInformation = () => {
  return (
    <>
      <Head>
        <title>Required Information | NEERI Job portals</title>
      </Head>
      <DashboardLayout>
        <LayoutContentWrapper>
          <JobPostPreview />
        </LayoutContentWrapper>
      </DashboardLayout>
    </>
  );
};

export default RequireInformation;
