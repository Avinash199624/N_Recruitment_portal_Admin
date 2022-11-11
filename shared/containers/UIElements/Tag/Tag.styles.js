import styled from 'styled-components';
import { palette } from 'styled-theme';
import { transition } from '@iso/lib/helpers/style_utils';
import WithDirection from '@iso/lib/helpers/rtl';

const TagStyleWrapper = styled.div`
  display: block;
  width: 100%;

  .ant-tag {
    display: inline-block;
    line-height: 24px;
    border: 1px solid ${palette('border', 0)};
    background: ${palette('grayscale', 6)};
    font-size: 12px;
    font-weight: 500;
    color: ${palette('text', 3)};
    opacity: 1;
    margin-top: 4px;
    margin-bottom: 4px;
    margin-right: ${(props) =>
      props['data-rtl'] === 'rtl' ? 'inherit' : '8px'};
    margin-left: ${(props) =>
      props['data-rtl'] === 'rtl' ? '8px' : 'inherit'};
    cursor: pointer;
    white-space: nowrap;
    border-color: transparent;
    border-radius: 50px;
    padding: 2px 16px;
    height: 30px;
    width: 100%;
    text-align: center;
    text-transform: uppercase;
    ${transition()};

    a {
      color: ${palette('text', 3)};

      &:hover {
        color: ${palette('text', 3)};
      }
    }

    .anticon-cross {
      margin: ${(props) =>
        props['data-rtl'] === 'rtl' ? '0 3px 0 0' : '0 0 0 3px'};
    }

    &.ant-tag-active {
      color: #fff;
      background: rgb(3 150 51 / 50%);
    }

    &.ant-tag-completed {
      color: #fff;
      background: rgb(249 58 11 / 50%);
      margin: 0;
    }

    &.ant-tag-scheduled {
      color: #2ecc71;
      background: #ffffff;
      border-color: #2ecc71;
      margin: 0;
    }

    &.ant-tag-archived {
      color: #ffffff;
      background: rgb(52 73 94 / 50%);
      margin: 0;
    }

    &.ant-tag-has-color {
      line-height: 24px;
      color: #ffffff;
      border: 0;
      margin: 0;
    }

    &.ant-tag-checkable {
      background-color: transparent;
      border-color: transparent;

      &:not(.ant-tag-checkable-checked) {
        &:hover {
          background-color: ${palette('primary', 0)};
          color: #ffffff;
        }
      }

      &:active {
        background-color: ${palette('primary', 0)};
        color: #ffffff;
      }

      &.ant-tag-checkable-checked {
        background-color: ${palette('primary', 0)};
        color: #ffffff;
      }
    }
  }
`;

export default WithDirection(TagStyleWrapper);
