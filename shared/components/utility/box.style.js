import styled from 'styled-components';
import { palette } from 'styled-theme';

const BoxWrapper = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid ${palette('border', 0)};
  margin: 0 0 30px;
  box-shadow: 0px 5px 6px rgb(0 0 0 / 4%);
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  @media only screen and (max-width: 767px) {
    padding: 16px 20px;
  }

  &.half {
    width: calc(50% - 34px);
    @media (max-width: 767px) {
      width: 100%;
    }
  }
`;

export { BoxWrapper };
