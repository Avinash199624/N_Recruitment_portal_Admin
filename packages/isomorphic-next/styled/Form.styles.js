import styled from 'styled-components';
import WithDirection from '@iso/lib/helpers/rtl';
import { palette } from 'styled-theme';

const FormStyles = styled.div`
  width: 100%;
  .ant-form-item-label {
    padding-bottom: 0;
  }
  .ant-picker {
    width: 100%;
  }
  .add-position {
    margin-bottom: 16px;
  }
  .ant-btn-primary {
    background: ${palette('primary', 0)};
    border-color: ${palette('primary', 0)};
  }
  .ant-btn-primary[disabled] {
    color: #fff;
    opacity: 0.4;
  }
  .ant-btn-primary[disabled]:hover {
    background: ${palette('primary', 0)};
  }
  .form-fields-wrapper {
    background: ${palette('secondary', 11)};
    padding: 20px;
  }
  h5 {
    marginbottom: 0;
  }
  .ant-descriptions {
    margin-bottom: 20px;
    overflow: auto;
  }
  .ant-upload-text-icon {
    display: none;
  }
  .ant-upload-list-item-progress {
    padding-left: 0;
  }
  .rdw-editor-main {
    border: 1px solid #f1f1f1;
    padding: 0 10px;
    min-height: 150px;
  }
  .uppy-DashboardContent-back {
    display: none !important;
  }
  .uppy-Dashboard-AddFiles-info {
    display: none;
  }
  .ant-upload-list-item-name {
    padding-left: 0 !important;
  }
  .uppy-Webcam-buttonContainer {
    text-align: center;
  }
  .ant-input-number {
    width: 100%;
  }
  .ant-descriptions-title {
    color: #1890ff;
    white-space: break-spaces;
  }
  .ant-descriptions-header {
    margin-bottom: 10px;
  }
  .ant-progress-text {
    color: rgb(8 64 138);
    font-weight: 700;
  }
  .ant-divider-inner-text {
    color: #1890ff;
    font-weight: 700;
  }
  @media only screen and (min-width: 820px) {
    .uppy-Dashboard-inner {
      width: 750px;
      height: 620px !important;
    }
  }
  .ant-picker-panels > *:first-child button.ant-picker-header-next-btn {
    visibility: visible !important;
  }

  .ant-picker-panels > *:first-child button.ant-picker-header-super-next-btn {
    visibility: visible !important;
  }

  .ant-picker-panels > *:last-child {
    display: none;
  }

  .ant-picker-panel-container,
  .ant-picker-footer {
    width: 280px !important;
  }

  .ant-picker-footer-extra > div {
    flex-wrap: wrap !important;
  }
`;

export default WithDirection(FormStyles);
