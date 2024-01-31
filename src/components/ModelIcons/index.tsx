import { ChatGLM, OpenAI } from '@lobehub/icons';
import { memo } from 'react';

interface ModelProviderIconProps {
  model?: string;
  size?: number;
}

const ModelIcon = memo<ModelProviderIconProps>(({ model, size = 12 }) => {
  if (model?.startsWith('gpt-3')) return <OpenAI.Avatar size={size} type={'gpt3'} />;
  if (model?.startsWith('gpt-4')) return <OpenAI.Avatar size={size} type={'gpt4'} />;
  if (model?.startsWith('glm')) return <ChatGLM.Avatar size={size} />;
});

export default ModelIcon;
