import React from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom';
import TopbarLoadingIndicator from '../components/TopbarLoadingIndicator/TopbarLoadingIndicator';

export const RootRoute = () => {
  const navigation = useNavigation();

  return (
    <>
      {navigation.state === 'loading' && <TopbarLoadingIndicator />}
      <Outlet />
      <ScrollRestoration />
    </>
  );
};
