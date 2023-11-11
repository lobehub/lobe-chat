import { getAzureVoiceOptions, getEdgeVoiceOptions, getOpenaiVoiceOptions } from '@lobehub/tts';
import { SelectProps } from 'antd';

export const ttsOptions: SelectProps['options'] = [
  {
    label: 'openai-tts-1',
    value: 'openai',
  },
  {
    label: 'edge-speech',
    value: 'edge',
  },
  {
    label: 'microsoft-speech',
    value: 'microsoft',
  },
];

export const sstOptions: SelectProps['options'] = [
  {
    label: 'openai-whisper-1',
    value: 'openai',
  },
  {
    label: 'browser',
    value: 'browser',
  },
];

export const voiceOptions = (
  service: 'openai' | 'edge' | 'microsoft',
  locale?: string,
): SelectProps['options'] => {
  switch (service) {
    case 'microsoft': {
      return getEdgeVoiceOptions(locale);
    }
    case 'edge': {
      return getAzureVoiceOptions(locale);
    }
    case 'openai': {
      return getOpenaiVoiceOptions();
    }
  }
};
