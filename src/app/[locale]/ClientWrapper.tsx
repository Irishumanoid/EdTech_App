'use client';

import { Provider } from 'react-redux';
import store from '../store/store';
import React from 'react';

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default ClientWrapper;
