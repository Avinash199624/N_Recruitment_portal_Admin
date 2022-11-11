import React from 'react';
import Webcam from 'react-webcam';

const WebCam = React.forwardRef((props, ref) => {
  return (
    <Webcam
      width={480}
      audio={false}
      ref={ref}
      screenshotFormat='image/jpeg'
      videoConstraints={{ facingMode: 'user' }}
      {...props}
    />
  );
});

WebCam.propTypes = {};

WebCam.defaultProps = {};

export default WebCam;
