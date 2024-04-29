import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import BrowserSTT from './browser';
import OpenaiSTT from './openai';

const STT = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { sttServer } = useUserStore(settingsSelectors.currentTTS, isEqual);
  switch (sttServer) {
    case 'openai': {
      return <OpenaiSTT mobile={mobile} />;
    }
  }
  return <BrowserSTT mobile={mobile} />;
});

export default STT;
