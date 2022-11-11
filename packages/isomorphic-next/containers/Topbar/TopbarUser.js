import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Popover from '@iso/components/uielements/popover';
import TopbarDropdownWrapper from './TopbarDropdown.styles';

//import userpic from '@iso/assets/images/user1.png';

export default function TopbarUser(props) {
  const router = useRouter();
  const [visible, setVisibility] = React.useState(false);
  const [showChangeMobile, setChangeMobile] = React.useState(false);
  const [profile_pic, setProfilePic] = React.useState('');
  const [deviceWidth, setWidth] = React.useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const roles = window.localStorage.getItem('roles').includes('applicant');
    if (roles) {
      setChangeMobile(true);
    }
    const user_obj = JSON.parse(window.localStorage.getItem('user'));
    if (user_obj) {
      const user_details = user_obj.user_profile;
      const profile_img =
        user_details !== null ? (user_details.profile_photo !== null ? user_details.profile_photo : '') : '';
      setProfilePic(profile_img);
    }
    const width = window.innerWidth;
    setWidth(width);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const user_obj = JSON.parse(window.localStorage.getItem('user'));
      if (user_obj) {
        const user_details = user_obj.user_profile;
        const profile_img =
          user_details !== null ? (user_details.profile_photo !== null ? user_details.profile_photo : '') : '';
        setProfilePic(profile_img);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleVisibleChange() {
    setVisibility((visible) => !visible);
  }

  const onLogOut = (e) => {
    e.preventDefault();
    if (window.localStorage.getItem('roles').includes('applicant')) {
      router.push('/');
    } else if (window.localStorage.getItem('roles').includes('trainee')) {
      router.push('/login/');
    } else {
      router.push('/admin/');
    }
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('roles');
    window.localStorage.removeItem('authUser');
    window.localStorage.clear();
    dispatch({
      type: 'set',
      payload: {
        user: {
          isLoggedIn: false,
        },
        roles: [],
      },
    });
  };

  const onChangePassword = () => {
    if (window.localStorage.getItem('roles').includes('applicant')) {
      router.push('/change-password/');
    } else {
      router.push('/admin/change-password/');
    }
  };

  const onChangeMobileNo = () => {
    router.push('/change-mobileno/');
  };

  const content = (
    <TopbarDropdownWrapper className='isoUserDropdown'>
      <a onClick={onChangePassword} className='isoDropdownLink'>
        Change Password
      </a>
      {showChangeMobile ? (
        <a onClick={onChangeMobileNo} className='isoDropdownLink'>
          Change Mobile No
        </a>
      ) : (
        ''
      )}
      <a onClick={onLogOut} className='isoDropdownLink'>
        Logout
      </a>
    </TopbarDropdownWrapper>
  );

  return (
    <Popover
      content={content}
      trigger='click'
      visible={visible}
      onVisibleChange={handleVisibleChange}
      arrowPointAtCenter={true}
      placement='bottomLeft'
    >
      {deviceWidth <= 425 ? (
        <div className='isoImgWrapper'>
          <img
            alt='user'
            style={{ borderRadius: '50%' }}
            src={profile_pic ? profile_pic : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'}
          />
          {props.isCollapsed ? props.userName : ''}
        </div>
      ) : (
        <div className='isoImgWrapper'>
          <img
            alt='user'
            style={{ borderRadius: '50%' }}
            src={profile_pic ? profile_pic : 'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png'}
          />
          {props.userName}
          {/* <span className='userActivity online' /> */}
        </div>
      )}
    </Popover>
  );
}
