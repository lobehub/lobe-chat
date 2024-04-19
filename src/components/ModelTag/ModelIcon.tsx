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
  OpenRouter,
  Perplexity,
  Rwkv,
  Spark,
  Stability,
  Tongyi,
  Wenxin,
  ZeroOne,
} from '@lobehub/icons';
import { memo } from 'react';

interface ModelIconProps {
  model?: string;
  size?: number;
}

const ModelIcon = memo<ModelIconProps>(({ model, size = 12 }) => {
  if (!model) return;

  // currently supported models, maybe not in its own provider
  if (model.startsWith('gpt')) return <OpenAI size={size} />;
  if (model.startsWith('glm') || model.includes('chatglm')) return <ChatGLM size={size} />;
  if (model.includes('claude')) return <Claude size={size} />;
  if (model.includes('titan')) return <Aws size={size} />;
  if (model.includes('llama')) return <Meta size={size} />;
  if (model.includes('llava')) return <LLaVA size={size} />;
  if (model.includes('gemini')) return <Gemini size={size} />;
  if (model.includes('gemma')) return <Gemma.Simple size={size} />;
  if (model.includes('moonshot')) return <Moonshot size={size} />;
  if (model.includes('qwen')) return <Tongyi size={size} />;
  if (model.includes('minmax')) return <Minimax size={size} />;
  if (model.includes('mistral') || model.includes('mixtral')) return <Mistral size={size} />;
  if (model.includes('pplx') || model.includes('sonar')) return <Perplexity size={size} />;
  if (model.startsWith('yi-')) return <ZeroOne size={size} />;
  if (model.startsWith('openrouter')) return <OpenRouter size={size} />; // only for Cinematika and Auto
  if (model.includes('command')) return <Cohere size={size} />;
  if (model.includes('dbrx')) return <Dbrx size={size} />;
  if (model.includes('openchat')) return <Dbrx size={size} />;

  // below: To be supported in providers, move up if supported
  if (model.includes('baichuan')) return <Baichuan size={size} />;
  if (model.includes('rwkv')) return <Rwkv size={size} />;
  if (model.includes('ernie')) return <Wenxin size={size} />;
  if (model.includes('spark')) return <Spark size={size} />;
  if (model.includes('hunyuan')) return <Hunyuan size={size} />;
  if (model.startsWith('d_') || model.startsWith('g_') || model.startsWith('wd_'))
    return <FishAudio size={size} />; // ref https://github.com/fishaudio/Bert-VITS2/blob/master/train_ms.py#L702
  if (model.includes('skylark')) return <ByteDance size={size} />;
  if (
    model.includes('stable-diffusion') ||
    model.includes('stable-video') ||
    model.includes('stable-cascade') ||
    model.includes('sdxl') ||
    model.includes('stablelm') ||
    model.startsWith('stable-') ||
    model.startsWith('sd3')
  )
    return <Stability size={size} />;
  if (model.includes('wizardlm')) return <Azure size={size} />;
  if (model.includes('firefly')) return <AdobeFirefly size={size} />;
});

export default ModelIcon;
