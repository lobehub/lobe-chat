import {
  AiMass,
  Adobe,
  Ai21,
  Ai360,
  Aws,
  Azure,
  Baichuan,
  ByteDance,
  ChatGLM,
  Claude,
  CodeGeeX,
  Cohere,
  Dbrx,
  DeepSeek,
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
  Stepfun,
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

  // currently supported models, maybe not in its own provider
  if (model.includes('gpt-3')) return <OpenAI.Avatar size={size} type={'gpt3'} />;
  if (model.includes('gpt-4')) return <OpenAI.Avatar size={size} type={'gpt4'} />;
  if (model.startsWith('glm') || model.includes('chatglm')) return <ChatGLM.Avatar size={size} />;
  if (model.startsWith('codegeex')) return <CodeGeeX.Avatar size={size} />;
  if (model.includes('deepseek')) return <DeepSeek.Avatar size={size} />;
  if (model.includes('claude')) return <Claude.Avatar size={size} />;
  if (model.includes('titan')) return <Aws.Avatar size={size} />;
  if (model.includes('llama')) return <Meta.Avatar size={size} />;
  if (model.includes('llava')) return <LLaVA.Avatar size={size} />;
  if (model.includes('gemini')) return <Gemini.Avatar size={size} />;
  if (model.includes('gemma')) return <Gemma.Avatar size={size} />;
  if (model.includes('moonshot')) return <Moonshot.Avatar size={size} />;
  if (model.includes('qwen')) return <Tongyi.Avatar background={Tongyi.colorPrimary} size={size} />;
  if (model.includes('minmax') || model.includes('abab')) return <Minimax.Avatar size={size} />;
  if (model.includes('mistral') || model.includes('mixtral')) return <Mistral.Avatar size={size} />;
  if (model.includes('pplx') || model.includes('sonar')) return <Perplexity.Avatar size={size} />;
  if (model.includes('yi-')) return <Yi.Avatar size={size} />;
  if (model.startsWith('openrouter')) return <OpenRouter.Avatar size={size} />; // only for Cinematika and Auto
  if (model.startsWith('openchat')) return <OpenChat.Avatar size={size} />;
  if (model.includes('command')) return <Cohere.Avatar size={size} />;
  if (model.includes('dbrx')) return <Dbrx.Avatar size={size} />;
  if (model.includes('step')) return <Stepfun.Avatar size={size} />;
  if (model.includes('taichu')) return <AiMass.Avatar size={size} />;
  if (model.includes('360gpt')) return <Ai360.Avatar size={size} />;

  // below: To be supported in providers, move up if supported
  if (model.includes('baichuan'))
    return <Baichuan.Avatar background={Baichuan.colorPrimary} size={size} />;
  if (model.includes('rwkv')) return <Rwkv.Avatar size={size} />;
  if (model.includes('ernie')) return <Wenxin.Avatar size={size} />;
  if (model.includes('spark')) return <Spark.Avatar size={size} />;
  if (model.includes('hunyuan')) return <Hunyuan.Avatar size={size} />;
  // ref https://github.com/fishaudio/Bert-VITS2/blob/master/train_ms.py#L702
  if (model.startsWith('d_') || model.startsWith('g_') || model.startsWith('wd_'))
    return <FishAudio.Avatar size={size} />;
  if (model.includes('skylark')) return <ByteDance.Avatar size={size} />;

  if (
    model.includes('stable-diffusion') ||
    model.includes('stable-video') ||
    model.includes('stable-cascade') ||
    model.includes('sdxl') ||
    model.includes('stablelm') ||
    model.startsWith('stable-') ||
    model.startsWith('sd3')
  )
    return <Stability.Avatar size={size} />;

  if (model.includes('wizardlm')) return <Azure.Avatar size={size} />;
  if (model.includes('phi3') || model.includes('phi-3')) return <Azure.Avatar size={size} />;
  if (model.includes('firefly')) return <Adobe.Avatar size={size} />;
  if (model.includes('jamba') || model.includes('j2-')) return <Ai21.Avatar size={size} />;
});

export default ModelIcon;
