import React from 'react';
import Head from 'next/head';

import DashboardLayout from '../containers/DashboardLayout/DashboardLayout';
import Widgets from '@iso/containers/Widgets/Widgets';
import useUser from '../src/components/auth/useUser';

export default function Dashboard() {
  const { user } = useUser({ redirectTo: '/' });

  if (!user || !user.isLoggedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <DashboardLayout>
        <Widgets />
      </DashboardLayout>
    </>
  );
}
