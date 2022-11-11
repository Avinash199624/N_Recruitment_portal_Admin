import React from 'react';
import App from 'next/app';
import { withRouter } from 'next/router';
import { Provider } from 'react-redux';
import { AuthProvider } from '../src/components/auth/provider';
import apiClient from '../src/apiClient';
import withRedux from 'next-redux-wrapper';
import ThemeProvider from '../containers/ThemeProvider';
import initStore from '../redux/store';
import 'antd/dist/antd.css';
import PageNotAccessible from './PageNotAccessible';
import {
  ADMIN,
  TRAINEE_MANAGEMENT,
  APPLICATION_SCRUTINY,
  JOB_POSTING_T,
  JOB_POSTING_P,
  MANAGEMENT,
} from '../static/constants/userRoles';

class CustomApp extends App {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
    };
    this.roles = [];
  }

  componentDidMount() {
    this.setState({ roles: JSON.parse(window.localStorage.getItem('roles')) });
  }

  userRoleCheck(loggedInRoles, userRoles) {
    return !userRoles.some((r) => loggedInRoles.indexOf(r) >= 0);
  }

  render() {
    const { Component, pageProps, store, router } = this.props;
    const { roles } = this.state;
    const loggedInRoles = roles && roles.length ? roles : [];
    const client = apiClient();
    let allowed = true;

    if (loggedInRoles && loggedInRoles.length) {
      if (
        (router.pathname.startsWith('/admin/approvals') && this.userRoleCheck(loggedInRoles, [JOB_POSTING_T])) ||
        (router.pathname === '/admin/dashboard' &&
          this.userRoleCheck(loggedInRoles, [
            ADMIN,
            TRAINEE_MANAGEMENT,
            APPLICATION_SCRUTINY,
            JOB_POSTING_T,
            JOB_POSTING_P,
            MANAGEMENT,
          ])) ||
        (router.pathname === '/admin' &&
          this.userRoleCheck(loggedInRoles, [
            ADMIN,
            TRAINEE_MANAGEMENT,
            APPLICATION_SCRUTINY,
            JOB_POSTING_T,
            JOB_POSTING_P,
            MANAGEMENT,
          ])) ||
        (router.pathname === '/admin/manage-job-post/permanent/list' &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_P, APPLICATION_SCRUTINY])) ||
        (router.pathname === '/admin/manage-job-post/permanent/add' &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_P])) ||
        (router.pathname.startsWith('/admin/manage-job-post/permanent/edit') &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_P])) ||
        (router.pathname.startsWith('/admin/manage-job-post/temporary/edit') &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_T])) ||
        (router.pathname === '/admin/manage-job-post/temporary/list' &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_T, APPLICATION_SCRUTINY])) ||
        (router.pathname === '/admin/manage-job-post/temporary/add' &&
          this.userRoleCheck(loggedInRoles, [JOB_POSTING_T])) ||
        (router.pathname.startsWith('/admin/manage-trainees') &&
          this.userRoleCheck(loggedInRoles, [TRAINEE_MANAGEMENT])) ||
        (router.pathname.startsWith('/admin/admin-section/neeri-users-master') &&
          this.userRoleCheck(loggedInRoles, [ADMIN, APPLICATION_SCRUTINY])) ||
        (router.pathname.startsWith('/admin/admin-section/manage-applicants') &&
          this.userRoleCheck(loggedInRoles, [ADMIN, MANAGEMENT, APPLICATION_SCRUTINY])) ||
        (router.pathname.startsWith('/admin/admin-section/document-master') &&
          this.userRoleCheck(loggedInRoles, [ADMIN])) ||
        (router.pathname.startsWith('/admin/admin-section/qualification-master') &&
          this.userRoleCheck(loggedInRoles, [ADMIN])) ||
        (router.pathname.startsWith('/admin/admin-section/information-master') &&
          this.userRoleCheck(loggedInRoles, [ADMIN])) ||
        (router.pathname.startsWith('/admin/admin-section/position-master/permanent') &&
          this.userRoleCheck(loggedInRoles, [ADMIN, MANAGEMENT])) ||
        (router.pathname.startsWith('/admin/admin-section/position-master/temporary') &&
          this.userRoleCheck(loggedInRoles, [ADMIN, MANAGEMENT])) ||
        (router.pathname.startsWith('/admin/manage-job-post/applicants') &&
          this.userRoleCheck(loggedInRoles, [APPLICATION_SCRUTINY]))
      ) {
        allowed = false;
      }
    }

    const ComponentToRender = allowed ? <Component {...pageProps} /> : <PageNotAccessible />;

    return (
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider client={client}>{ComponentToRender}</AuthProvider>
        </ThemeProvider>
      </Provider>
    );
  }
}

export default withRedux(initStore)(withRouter(CustomApp));
