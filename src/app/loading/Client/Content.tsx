import dynamic from 'next/dynamic';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/Loading/FullscreenLoading';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { DatabaseLoadingState } from '@/types/clientDB';

import { CLIENT_LOADING_STAGES } from '../stage';

const InitError = dynamic(() => import('./Error'), { ssr: false });

interface InitProps {
  setActiveStage: (value: string) => void;
}

const Init = memo<InitProps>(({ setActiveStage }) => {
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB({ onStateChange: setActiveStage });

  return null;
});

interface ContentProps {
  loadingStage: string;
  setActiveStage: (value: string) => void;
}

const Content = memo<ContentProps>(({ loadingStage, setActiveStage }) => {
  const { t } = useTranslation('common');
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);
  const isError = useGlobalStore((s) => s.initClientDBStage === DatabaseLoadingState.Error);

  return (
    <>
      {isPgliteNotInited && <Init setActiveStage={setActiveStage} />}
      <FullscreenLoading
        activeStage={CLIENT_LOADING_STAGES.indexOf(loadingStage)}
        contentRender={isError && <InitError />}
        stages={CLIENT_LOADING_STAGES.map((key) => t(`appLoading.${key}` as any))}
      />
    </>
  );
});

export default Content;
