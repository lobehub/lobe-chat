'use client';

import { useState } from 'react';

import { AppLoadingStage } from '@/app/loading/type';

import Client from './Content';
import Redirect from './Redirect';

const ScreenLoading = () => {
  const [loadingStage, setLoadingStage] = useState(AppLoadingStage.Initializing);
  return (
    <>
      <Client loadingStage={loadingStage} />
      <Redirect setLoadingStage={setLoadingStage} />
    </>
  );
};

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
