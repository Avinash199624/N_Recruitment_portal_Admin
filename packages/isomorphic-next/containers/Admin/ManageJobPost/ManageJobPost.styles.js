import styled from 'styled-components';
import WithDirection from '@iso/lib/helpers/rtl';

const ManageJobPostStyles = styled.div`
  width: 100%;
  .action-bar {
    button {
      &:last-child {
        margin-left: 10px;
      }
    }
    .ant-btn-group {
      padding: 0 16px;
      button:first-child {
        width: 100%;
      }
    }
    .ant-dropdown-button {
      align-items: center;
      display: flex;
      button {
        height: 35px;
      }
    }
    h3.ant-typography {
      margin-bottom: 0;
      color: #069633;
    }
  }
  .applicant-filter {
    .ant-select {
      width: 250px;
    }
  }
`;

export default WithDirection(ManageJobPostStyles);
