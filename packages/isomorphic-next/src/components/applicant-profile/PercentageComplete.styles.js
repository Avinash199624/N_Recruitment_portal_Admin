import styled from 'styled-components';
import { palette } from 'styled-theme';

const PercentageCompleteStyle = styled.div`
  .ant-progress-wrapper {
    margin: 0 -20px -23px;
  }
  .ant-progress-show-info .ant-progress-outer {
    margin-right: 0;
    padding-right: 0;
    margin-top: 10px;
  }
  .ant-progress-line {
    text-align: center;
    color: #009633;
    display: flex;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    gap: 0;
    margin-top: 24px;
    @media only screen and (max-width: 767px) {
      margin-top: 8px;
    }
  }
  .ant-progress-success-bg,
  .ant-progress-bg {
    border-radius: 0;
  }
  .ant-progress-text {
    width: auto;
    margin-left: 0;
  }
  .ant-progress-inner {
    border-radius: 0;
  }
  .ant-progress-status-active .ant-progress-bg::before {
    border-radius: 0;
  }
  .ant-steps {
    @media only screen and (max-width: 767px) {
      overflow: auto;
      padding-bottom: 10px;
    }
  }
`;

export default PercentageCompleteStyle;
