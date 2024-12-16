'use client';

import { useState } from 'react';

import Client from './Content';
import Redirect from './Redirect';

const ScreenLoading = () => {
  const [goToChat, setGoToChat] = useState(false);
  return (
    <>
      <Client goToChat={goToChat} />
      <Redirect setGoToChat={setGoToChat} />
    </>
  );
};

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
