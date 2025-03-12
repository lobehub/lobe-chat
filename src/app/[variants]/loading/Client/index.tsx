'use client';

import { useState } from 'react';

import { AppLoadingStage } from '../stage';
import Content from './Content';
import Redirect from './Redirect';

const ClientMode = () => {
  const [activeStage, setActiveStage] = useState<string>(AppLoadingStage.Initializing);

  return (
    <>
      <Content loadingStage={activeStage} setActiveStage={setActiveStage} />
      <Redirect setActiveStage={setActiveStage} />
    </>
  );
};

ClientMode.displayName = 'ClientMode';

export default ClientMode;
