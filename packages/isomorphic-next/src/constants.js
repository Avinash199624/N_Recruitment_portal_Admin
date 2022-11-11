export const jobStatusList = ['draft', 'ready_to_be_published', 'published', 'suspended', 'cancelled', 'closed'];

//Job Post Permanent
export const jobStatus = {
  scheduled: 'Scheduled',
  published: 'Published',
  'on hold': 'On Hold',
  cancelled: 'Cancelled',
  closed: 'Closed',
  Archived: 'Archived',
};

export const jobTypes = {
  Contract_Basis: 'Contract Basis',
  Permanent: 'Permanent',
};

export const jobStatusFilters = [
  { text: 'Scheduled', value: 'scheduled' },
  { text: 'Published', value: 'published' },
  { text: 'On Hold', value: 'on hold' },
  { text: 'Cancelled', value: 'cancelled' },
  { text: 'Closed', value: 'closed' },
  { text: 'Archived', value: 'Archived' },
];

export const jobTypesFilters = [
  { text: 'Contract Basis', value: 'Contract_Basis' },
  { text: 'Permanent', value: 'Permanent' },
  { text: 'Archived', value: 'Archived' },
];

//Manage Trainee

export const traineeStatus = {
  active: 'Active',
  yet_to_join: 'Yet to Join',
  completed: 'Completed',
};

export const traineeStatusFilters = [
  { text: 'Active', value: 'active' },
  { text: 'Yet to Join', value: 'yet to join' },
  { text: 'Completed', value: 'completed' },
];

//Requirement Approvals
export const approveStatus = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  'on hold': 'On Hold',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const approveStatusFilters = [
  { text: 'Draft', value: 'draft' },
  { text: 'Submitted', value: 'submitted' },
  { text: 'Approved', value: 'approved' },
  { text: 'On Hold', value: 'on hold' },
  { text: 'Cancelled', value: 'cancelled' },
  { text: 'Rejected', value: 'rejected' },
  { text: 'Closed', value: 'closed' },
];

export const applicantJobStatusFilters = [
  { text: 'Shortlisted', value: 'shortlisted' },
  { text: 'Hired', value: 'hired' },
  { text: 'Rejected', value: 'rejected' },
  { text: 'Applied', value: 'applied' },
  { text: 'Shortlisted', value: 'document' },
  { text: 'Document Pending', value: 'document pending' },
  { text: 'Offered', value: 'offered' },
  { text: 'Interview', value: 'interview' },
  { text: 'Awaiting Review', value: 'awaiting review' },
  { text: 'Closed', value: 'closed' },
  { text: 'Appeal', value: 'appeal' },
];

export const QuotaData = [
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'obc', label: 'OBC' },
  { value: 'gen', label: 'GEN' },
  { value: 'pwd', label: 'PWD' },
];

export const RequireInfoType = {
  PERSONAL: 'personal',
  EDUCATION: 'education',
  PROFESSIONAL_TRAINING: 'professional training',
  FELLOWSHIP: 'fellowship',
  ADDRESS: 'address',
  LANGUAGES: 'languages',
  PUBLISHED_PAPERS: 'published papers',
  REFERENCES: 'references',
  OTHER_DETAILS: 'other details',
  EXPERIENCE: 'experience',
  OVERSEAS_VISITS: 'overseas visits',
  RELATIVES_IN_NEERI: 'relatives in neeri',
};

export const jobPostingStatus = [
  {
    value: 'scheduled',
    label: 'Scheduled',
  },
  {
    value: 'published',
    label: 'Published',
  },
  {
    value: 'on hold',
    label: 'On Hold',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
  },
  {
    value: 'closed',
    label: 'Closed',
  },
  {
    value: 'archived',
    label: 'Archived',
  },
];
