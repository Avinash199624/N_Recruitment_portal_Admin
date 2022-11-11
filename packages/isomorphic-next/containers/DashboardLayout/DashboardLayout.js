import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import Sidebar from '../Sidebar/Sidebar';
import TopbarPublic from '../Topbar/TopbarPublic';
import Topbar from '../Topbar/Topbar';
import siteConfig from '@iso/config/site.config';
import AppHolder from './DashboardLayout.styles';

const { Content, Footer } = Layout;

export default function DashboardLayout({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  return (
    <AppHolder>
      <Layout style={{ height: '100vh' }}>
        {token ? <Topbar /> : <TopbarPublic />}

        <Layout style={{ flexDirection: 'row', overflowX: 'hidden' }}>
          {token && <Sidebar />}
          <Layout
            className='isoContentMainLayout'
            style={{
              height: '100vh',
            }}
          >
            <Content
              className='isomorphicContent'
              style={{
                padding: token ? '70px 0 0' : 0,
                flexShrink: '0',
                background: '#F4F7FE',
                width: '100%',
              }}
            >
              {children}
            </Content>
            <Footer
              style={{
                background: '#ffffff',
                textAlign: 'center',
                borderTop: '1px solid #ededed',
              }}
            >
              {siteConfig.footerText}
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </AppHolder>
  );
}
