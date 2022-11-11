import { useContext } from 'react';
import { StateContext, DispatchContext } from '../auth/provider';

export const useAuthState = () => {
  const context = useContext(StateContext);
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(DispatchContext);
  return context;
};
