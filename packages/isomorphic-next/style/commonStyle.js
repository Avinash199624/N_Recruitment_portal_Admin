import styled from 'styled-components';
import { font, palette } from 'styled-theme';
import Button from '@iso/ui/Antd/Button/Button';

const AppHolder = styled.div`
  ::selection {
    background: ${palette('primary', 0)};
    color: #fff;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  a,
  p,
  li,
  input,
  textarea,
  span,
  div {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.004);
  }

  html,
  html a {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.004);
  }

  body {
    font-family: ${font('primary')};
  }
`;

export const rowStyle = {
  width: '100%',
  display: 'flex',
  flexFlow: 'row wrap',
};

export const colStyle = {
  marginBottom: '16px',
};

export const gutter = 16;

export const StyledButton = styled(Button)`
  margin: 4px;
  height: 60px;
  border-radius: 10px;
  width: 200px;
  font-weight: 700;
  background: #2ecc71;
  border-color: #2ecc71;
  @media only screen and (max-width: 767px) {
    width: 100%;
  }
`;

export default AppHolder;
