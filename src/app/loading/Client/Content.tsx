import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { CLIENT_LOADING_STAGES } from '../stage';

interface InitProps {
  setActiveStage: (value: string) => void;
}

const Init = memo<InitProps>(() => {
  return null;
});

interface ContentProps {
  loadingStage: string;
  setActiveStage: (value: string) => void;
}

const Content = memo<ContentProps>(({ loadingStage, setActiveStage }) => {
  const { t } = useTranslation('common');
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);

  return (
    <>
      {isPgliteNotInited && <Init setActiveStage={setActiveStage} />}
      <FullscreenLoading
        activeStage={CLIENT_LOADING_STAGES.indexOf(loadingStage)}
        stages={CLIENT_LOADING_STAGES.map((key) => t(`appLoading.${key}` as any))}
      />
    </>
  );
});

export default Content;
