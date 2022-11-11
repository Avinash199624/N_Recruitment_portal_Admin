import styled from 'styled-components';

const LayoutContentWrapper = styled.div`
  padding: 40px 20px;
  display: flex;
  flex-flow: row wrap;
  overflow: hidden;

  @media only screen and (max-width: 767px) {
    padding: 50px 20px;
  }

  @media (max-width: 580px) {
    padding: 15px;
  }

  .ant-table-content {
    @media only screen and (max-width: 1024px) {
      overflow: auto;
    }
  }
  .ant-btn-primary {
    background: #069633;
    border: 1px solid #069633;
  }
  .ant-table-wrapper {
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0px 2px 1px -3px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 0 3px 0px rgb(0 0 0 / 12%);
  }
`;

export { LayoutContentWrapper };
