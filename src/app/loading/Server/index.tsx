'use client';

import { useState } from 'react';

import { AppLoadingStage } from '../stage';
import Content from './Content';
import Redirect from './Redirect';

const ServerMode = () => {
  const [loadingStage, setLoadingStage] = useState(AppLoadingStage.Initializing);

  return (
    <>
      <Content loadingStage={loadingStage} />
      <Redirect setLoadingStage={setLoadingStage} />
    </>
  );
};

ServerMode.displayName = 'ServerMode';

export default ServerMode;
