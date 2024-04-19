import {
  AdobeFirefly,
  Aws,
  Azure,
  Baichuan,
  ByteDance,
  ChatGLM,
  Claude,
  Cohere,
  Dbrx,
  FishAudio,
  Gemini,
  Gemma,
  Hunyuan,
  LLaVA,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  OpenAI,
  OpenChat,
  OpenRouter,
  Perplexity,
  Rwkv,
  Spark,
  Stability,
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
  const modelToComponentMap = {
    'abab': <Minimax.Avatar size={size} />,
    'baichuan': <Baichuan.Avatar background={Baichuan.colorPrimary} size={size} />,
    'chatglm': <ChatGLM.Avatar size={size} />,
    'claude': <Claude.Avatar size={size} />,
    'command': <Cohere.Avatar size={size} />,
    'dbrx': <Dbrx.Avatar size={size} />,
    'ernie': <Wenxin.Avatar size={size} />,
    'firefly': <AdobeFirefly.Avatar size={size} />,
    'gemini': <Gemini.Avatar size={size} />,
    'gemma': <Gemma.Avatar size={size} />,
    'glm': <ChatGLM.Avatar size={size} />,
    'gpt-3': <OpenAI.Avatar size={size} type={'gpt3'} />,
    'gpt-4': <OpenAI.Avatar size={size} type={'gpt4'} />,
    'hunyuan': <Hunyuan.Avatar size={size} />,
    'llama': <Meta.Avatar size={size} />,
    'llava': <LLaVA.Avatar size={size} />,
    'minmax': <Minimax.Avatar size={size} />,
    'mistral': <Mistral.Avatar size={size} />,
    'mixtral': <Mistral.Avatar size={size} />,
    'moonshot': <Moonshot.Avatar size={size} />,
    'openchat': <OpenChat.Avatar size={size} />,
    'pplx': <Perplexity.Avatar size={size} />,
    'qwen': <Tongyi.Avatar background={Tongyi.colorPrimary} size={size} />,
    'rwkv': <Rwkv.Avatar size={size} />,
    'sdxl': <Stability.Avatar background={Stability.colorPrimary} size={size} />,
    'skylark': <ByteDance.Avatar size={size} />,
    'sonar': <Perplexity.Avatar size={size} />,
    'spark': <Spark.Avatar size={size} />,
    'stable-cascade': <Stability.Avatar background={Stability.colorPrimary} size={size} />,
    'stable-diffusion': <Stability.Avatar background={Stability.colorPrimary} size={size} />,
    'stable-video': <Stability.Avatar background={Stability.colorPrimary} size={size} />,
    'stablelm': <Stability.Avatar background={Stability.colorPrimary} size={size} />,
    'titan': <Aws.Avatar size={size} />,
    'wizardlm': <Azure.Avatar size={size} />,
    'yi-': <Yi.Avatar size={size} />,
  };

  // find the component based on the model name
  for (const [key, component] of Object.entries(modelToComponentMap)) {
    if (model.includes(key)) {
      return component;
    }
  }

  // handle special case with startsWith
  if (model.startsWith('openrouter')) return <OpenRouter.Avatar size={size} />;
  if (model.startsWith('stable-') || model.startsWith('sd3'))
    return <Stability.Avatar size={size} />;
  if (model.startsWith('d_') || model.startsWith('g_') || model.startsWith('wd_'))
    return <FishAudio.Avatar size={size} />;
});

export default ModelIcon;
