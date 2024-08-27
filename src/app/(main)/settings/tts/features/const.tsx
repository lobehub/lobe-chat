import { Google, OpenAI } from '@lobehub/icons';
import { SelectProps } from 'antd';

import { LabelRenderer } from '@/components/ModelSelect';

export const opeanaiTTSOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'tts-1'} />,
    value: 'tts-1',
  },
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'tts-1-hd'} />,
    value: 'tts-1-hd',
  },
];

export const opeanaiSTTOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'stt-1'} />,
    value: 'whisper-1',
  },
];

export const sttOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'OpenAI'} />,
    value: 'openai',
  },
  {
    label: <LabelRenderer Icon={Google.Avatar} label={'Browser'} />,
    value: 'browser',
  },
];
