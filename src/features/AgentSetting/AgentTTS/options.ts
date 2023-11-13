import { getOpenaiVoiceOptions } from '@lobehub/tts';
import { SelectProps } from 'antd';

export const ttsOptions: SelectProps['options'] = [
  {
    label: 'OpenAI',
    value: 'openai',
  },
  {
    label: 'Edge Speech',
    value: 'edge',
  },
  {
    label: 'Microsoft Speech',
    value: 'microsoft',
  },
];

export const openaiVoiceOptions: SelectProps['options'] = getOpenaiVoiceOptions();
