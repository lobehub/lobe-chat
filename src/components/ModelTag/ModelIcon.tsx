import { Anthropic, Aws, ChatGLM, Gemini, Meta, OpenAI } from '@lobehub/icons';
import { memo } from 'react';

interface ModelIconProps {
  model?: string;
  size?: number;
}

const ModelIcon = memo<ModelIconProps>(({ model, size = 12 }) => {
  if (!model) return;

  if (model.startsWith('gpt')) return <OpenAI size={size} />;
  if (model.startsWith('glm')) return <ChatGLM size={size} />;
  if (model.includes('claude')) return <Anthropic size={size} />;
  if (model.includes('titan')) return <Aws size={size} />;
  if (model.includes('llama')) return <Meta size={size} />;
  if (model.includes('gemini')) return <Gemini size={size} />;
});

export default ModelIcon;
