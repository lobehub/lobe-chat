import {
  Aws,
  Baichuan,
  ChatGLM,
  Claude,
  Cohere,
  Gemini,
  Gemma,
  Hunyuan,
  LLaVA,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  OpenAI,
  OpenRouter,
  Perplexity,
  Spark,
  Tongyi,
  Wenxin,
  Yi,
} from '@lobehub/icons';
import { memo } from 'react';

interface ModelProviderIconProps {
  model?: string;
  size?: number;
}

const ModelIcon = memo<ModelProviderIconProps>(({ model: originModel, size = 12 }) => {
  if (!originModel) return;

  // lower case the origin model so to better match more model id case
  const model = originModel.toLowerCase();

  if (model.includes('gpt-3')) return <OpenAI.Avatar size={size} type={'gpt3'} />;
  if (model.includes('gpt-4')) return <OpenAI.Avatar size={size} type={'gpt4'} />;
  if (model.startsWith('glm') || model.includes('chatglm')) return <ChatGLM.Avatar size={size} />;
  if (model.includes('claude')) return <Claude.Avatar size={size} />;
  if (model.includes('titan')) return <Aws.Avatar size={size} />;
  if (model.includes('llama')) return <Meta.Avatar size={size} />;
  if (model.includes('llava')) return <LLaVA.Avatar size={size} />;
  if (model.includes('gemini')) return <Gemini.Avatar size={size} />;
  if (model.includes('gemma')) return <Gemma.Avatar size={size} />;
  if (model.includes('qwen')) return <Tongyi.Avatar background={Tongyi.colorPrimary} size={size} />;
  if (model.includes('minmax')) return <Minimax.Avatar size={size} />;
  if (model.includes('moonshot')) return <Moonshot.Avatar size={size} />;
  if (model.includes('baichuan'))
    return <Baichuan.Avatar background={Baichuan.colorPrimary} size={size} />;

  if (model.includes('mistral') || model.includes('mixtral')) return <Mistral.Avatar size={size} />;

  if (model.includes('pplx') || model.includes('sonar')) return <Perplexity.Avatar size={size} />;

  if (model.includes('yi-')) return <Yi.Avatar size={size} />;
  if (model.includes('openrouter')) return <OpenRouter.Avatar size={size} />;
  if (model.includes('command')) return <Cohere.Color size={size} />;

  if (model.includes('ernie')) return <Wenxin.Avatar size={size} />;
  if (model.includes('spark')) return <Spark.Avatar size={size} />;
  if (model.includes('hunyuan')) return <Hunyuan.Avatar size={size} />;
  if (model.includes('abab')) return <Minimax.Avatar size={size} />;
});

export default ModelIcon;
