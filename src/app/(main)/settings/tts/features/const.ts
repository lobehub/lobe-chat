import { SelectProps } from 'antd';

export const opeanaiTTSOptions: SelectProps['options'] = [
  {
    label: 'tts-1',
    value: 'tts-1',
  },
  {
    label: 'tts-1-hd',
    value: 'tts-1-hd',
  },
];

export const opeanaiSTTOptions: SelectProps['options'] = [
  {
    label: 'whisper-1',
    value: 'whisper-1',
  },
];

export const sttOptions: SelectProps['options'] = [
  {
    label: 'OpenAI',
    value: 'openai',
  },
  {
    label: 'Browser',
    value: 'browser',
  },
];
