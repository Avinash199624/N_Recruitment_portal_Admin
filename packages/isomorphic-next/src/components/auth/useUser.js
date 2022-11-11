import Router from 'next/router';
import { useAuthState } from '../auth/hook';
import { useEffect } from 'react';

// TODO: could be moved into a provider
const useUser = ({ redirectTo = '/', redirectIfFound = false }) => {
  const { user, roles } = useAuthState();

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      if (redirectIfFound) {
        Router.push(redirectIfFound);
        return;
      }
      if (redirectTo || (redirectTo !== '' && !user?.isLoggedIn)) {
        Router.push(`/login/?redirect=${redirectTo}`);
      } else {
        Router.push(`${redirectTo}`);
      }
    }
  }, [user, redirectIfFound, redirectTo]);

  return { user, roles };
};

export default useUser;
