import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'antd';
import { useAuthState } from '../auth/hook';
import useUser from '../auth/useUser';
import PercentageCompleteStyle from './PercentageComplete.styles';
import { Row, Col, Steps } from 'antd';
import { steps } from './constants';

const PercentageComplete = ({ currentStep, setCurrent }) => {
  const [state, setState] = useState(0);
  const [completedScreens, setCompletedScreens] = useState([]);
  const { client } = useAuthState();
  const { user } = useUser({});
  const { Step } = Steps;

  useEffect(() => {
    const load = async () => {
      const response = await client.get(`/user/public/applicant_profile_percentage/${user.user_id}/`);

      setState(response.data);
      setCompletedScreens(response.data.progress_bar);
    };

    if (user && user.isLoggedIn) load();
  }, [user, client, currentStep]);

  if (!state.percentage) return null;
  return (
    <PercentageCompleteStyle>
      <Row>
        <Col span={24}>
          <Steps current={currentStep} size='small' labelPlacement='vertical'>
            {steps.map((item, index) => (
              <Step
                key={item.title}
                title={item.title}
                onClick={() => setCurrent(index)}
                status={!completedScreens.includes(item.slug) && index < currentStep ? 'error' : ''}
                //status={!{ completedScreens: item.slug } && index < currentStep ? 'error' : ''}
              />
            ))}
          </Steps>
        </Col>
      </Row>
      <div className='ant-progress-wrapper'>
        <Progress
          percent={state.percentage.substr(0, 3)}
          status='active'
          format={(percent) => `${percent}% Profile Completed`}
          strokeColor='#009633'
          strokeWidth='14px'
        />
      </div>
    </PercentageCompleteStyle>
  );
};

PercentageComplete.propTypes = {
  updateCompletedScreens: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired,
};

export default PercentageComplete;
