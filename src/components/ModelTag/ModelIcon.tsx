import {
  Anthropic,
  Aws,
  Baichuan,
  ChatGLM,
  Gemini,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  OpenAI,
  Perplexity,
  Tongyi,
} from '@lobehub/icons';
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
  if (model.includes('moonshot')) return <Moonshot size={size} />;
  if (model.includes('qwen')) return <Tongyi size={size} />;
  if (model.includes('minmax')) return <Minimax size={size} />;
  if (model.includes('baichuan')) return <Baichuan size={size} />;
  if (model.includes('mistral') || model.includes('mixtral')) return <Mistral size={size} />;
  if (model.includes('pplx')) return <Perplexity size={size} />;
});

export default ModelIcon;
