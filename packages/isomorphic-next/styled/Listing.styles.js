import styled from 'styled-components';
import WithDirection from '@iso/lib/helpers/rtl';

const ListingStyles = styled.div`
  width: 100%;
  .action-bar {
    margin-bottom: 16px;
  }
  .ant-btn-text {
    border: none;
    padding: 0px 8px;
    color: #1890ff;
  }
  .ant-tag-draft,
  .ant-tag-ready_to_be_published,
  .ant-tag-scheduled {
    border: 1px solid #2ecc71;
    color: #2ecc71;
    background: #fff;
    border-radius: 40px;
  }
  .ant-tag-published,
  .ant-tag-shortlisted {
    border: 1px solid #2ecc71;
    color: #fff;
    background: #2ecc71;
    border-radius: 40px;
  }
  .ant-tag-archived {
    border: 1px solid #34495e80;
    color: #fff;
    background: #34495e80;
    border-radius: 40px;
  }
  .ant-tag-suspended,
  .ant-tag-cancelled,
  .ant-tag-rejected,
  .ant-tag-closed {
    border: 1px solid #f93a0b80;
    color: #fff;
    background: #f93a0b80;
    border-radius: 40px;
  }
`;

export default WithDirection(ListingStyles);
