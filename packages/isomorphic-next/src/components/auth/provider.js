import React, { useReducer, createContext, useEffect } from 'react';
import PropTypes from 'prop-types';

export const StateContext = createContext();

export const DispatchContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'set': {
      return { ...state, ...action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const AuthProvider = ({ client, children }) => {
  const [state, dispatch] = useReducer(reducer, { client });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const roles = JSON.parse(localStorage.getItem('roles'));
    dispatch({
      type: 'set',
      payload: {
        user: {
          isLoggedIn: token && token !== null,
          ...user,
        },
        roles: roles,
      },
    });
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};

AuthProvider.propTypes = {
  client: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

AuthProvider.defaultProps = {};
