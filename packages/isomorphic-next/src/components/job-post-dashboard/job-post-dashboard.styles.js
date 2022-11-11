import styled from 'styled-components';
import WithDirection from '@iso/lib/helpers/rtl';

const JobPostsDashboardStyles = styled.div`
.mainSection: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  }
  .container: {
    padding: '20px 10px',
    background: '#fff',
    borderRadius: '4px',
    width: '100%'
  }
  .row: {
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column'
  }
  .button: {
    display: 'flex',
    width: '100%',
    padding: '40px 20px'
  }
  .iconWrapper: {
    background: '#F93A0B26 0% 0% no-repeat padding-box',
    borderRadius: 60,
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  }
  .label: {
    color: '#6E6E6E',
    fontSize: 14,
    textAlign: 'center'
  }
  .title: {
    color: '#01111C',
    fontSize: 20
  }
`;

export default WithDirection(JobPostsDashboardStyles);
