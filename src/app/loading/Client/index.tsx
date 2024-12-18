'use client';

import { useState } from 'react';

import { AppLoadingStage } from '../stage';
import Client from './Content';
import Redirect from './Redirect';

const ScreenLoading = () => {
  const [activeStage, setActiveStage] = useState<string>(AppLoadingStage.Initializing);

  return (
    <>
      <Client loadingStage={activeStage} setActiveStage={setActiveStage} />
      <Redirect setActiveStage={setActiveStage} />
    </>
  );
};

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
