import styled from 'styled-components';
import WithDirection from '@iso/lib/helpers/rtl';

const JobPostsStyles = styled.div`
  width: 100%;
  .isoDescription {
    margin-bottom: 0;
  }
  .ant-pagination {
    margin-bottom: 0;
  }
  .ant-descriptions-header {
    margin-bottom: 16px;
  }
  .ant-descriptions-item-label span {
    font-weight: 700;
  }
`;

export default WithDirection(JobPostsStyles);
