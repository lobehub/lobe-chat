import { VoiceList } from '@lobehub/tts';
import isEqual from 'fast-deep-equal';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';

export const useTTSVoice = () => {
  const ttsAgentSettings = useSessionStore(agentSelectors.currentAgentTTS, isEqual);
  const voiceList = useGlobalStore((s) => new VoiceList(settingsSelectors.currentLanguage(s)));

  let voice: string;

  switch (ttsAgentSettings.ttsService) {
    case 'openai': {
      voice = ttsAgentSettings.voice.openai || (VoiceList.openaiVoiceOptions?.[0].value as string);
      break;
    }
    case 'edge': {
      voice = ttsAgentSettings.voice.edge || (voiceList.edgeVoiceOptions?.[0].value as string);
      break;
    }
    case 'microsoft': {
      voice =
        ttsAgentSettings.voice.microsoft || (voiceList.microsoftVoiceOptions?.[0].value as string);
      break;
    }
  }

  return voice || 'alloy';
};
