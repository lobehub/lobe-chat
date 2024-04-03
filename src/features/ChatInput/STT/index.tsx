import { memo } from 'react';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import isEqual from 'fast-deep-equal';
import BrowserSTT from './browser';
import OpenaiSTT from './openai';

const STT = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { sttServer } = useGlobalStore(settingsSelectors.currentTTS, isEqual)
  switch (sttServer) {
    case 'openai': {
      return <OpenaiSTT mobile={mobile} />
    }
  }
  return <BrowserSTT mobile={mobile} />
})

export default STT