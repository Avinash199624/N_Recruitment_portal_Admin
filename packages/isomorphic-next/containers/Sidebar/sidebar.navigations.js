import { APPLICANT, TRAINEE } from '../../static/constants/userRoles';

export default [
  {
    key: '/job-posts',
    label: 'sidebar.jobPosts',
    leftIcon: 'ion-briefcase',
    withoutDashboard: true,
    roles: [APPLICANT],
  },
  {
    key: '/manage-applications',
    label: 'sidebar.manageApplications',
    leftIcon: 'ion-document-text',
    withoutDashboard: true,
    roles: [APPLICANT],
  },
  {
    key: '/applicant-profile-main',
    label: 'sidebar.manageProfile',
    leftIcon: 'ion-person-stalker',
    withoutDashboard: true,
    roles: [APPLICANT],
  },
  {
    key: '/subscription/details',
    label: 'sidebar.subscription',
    leftIcon: 'ion-stats-bars',
    withoutDashboard: true,
    roles: [APPLICANT],
  },
  {
    key: '/trainee-payment',
    label: 'sidebar.traineePayment',
    leftIcon: 'ion-stats-bars',
    withoutDashboard: true,
    roles: [TRAINEE],
  },
];
