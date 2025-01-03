import { redirect } from 'next/navigation';

import Ai21Provider from '@/config/modelProviders/ai21';
import Ai360Provider from '@/config/modelProviders/ai360';
import AnthropicProvider from '@/config/modelProviders/anthropic';
import BaichuanProvider from '@/config/modelProviders/baichuan';
import DeepSeekProvider from '@/config/modelProviders/deepseek';
import FireworksAIProvider from '@/config/modelProviders/fireworksai';
import GiteeAIProvider from '@/config/modelProviders/giteeai';
import GoogleProvider from '@/config/modelProviders/google';
import GroqProvider from '@/config/modelProviders/groq';
import HigressProvider from '@/config/modelProviders/higress';
import HunyuanProvider from '@/config/modelProviders/hunyuan';
import InternLMProvider from '@/config/modelProviders/internlm';
import MinimaxProvider from '@/config/modelProviders/minimax';
import MistralProvider from '@/config/modelProviders/mistral';
import MoonshotProvider from '@/config/modelProviders/moonshot';
import NovitaProvider from '@/config/modelProviders/novita';
import OpenRouterProvider from '@/config/modelProviders/openrouter';
import PerplexityProvider from '@/config/modelProviders/perplexity';
import QwenProvider from '@/config/modelProviders/qwen';
import SiliconCloudProvider from '@/config/modelProviders/siliconcloud';
import SparkProvider from '@/config/modelProviders/spark';
import StepfunProvider from '@/config/modelProviders/stepfun';
import TaichuProvider from '@/config/modelProviders/taichu';
import TogetherAIProvider from '@/config/modelProviders/togetherai';
import UpstageProvider from '@/config/modelProviders/upstage';
import XAIProvider from '@/config/modelProviders/xai';
import ZeroOneProvider from '@/config/modelProviders/zeroone';
import ZhiPuProvider from '@/config/modelProviders/zhipu';
import { isServerMode } from '@/const/version';
import { serverDB } from '@/database/server';
import { AiProviderModel } from '@/database/server/models/aiProvider';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { PagePropsWithId } from '@/types/next';
import { getUserAuth } from '@/utils/server/auth';

import ProviderDetail from './index';

const DEFAULT_MODEL_PROVIDER_LIST = [
  AnthropicProvider,
  GoogleProvider,
  DeepSeekProvider,
  OpenRouterProvider,
  NovitaProvider,
  TogetherAIProvider,
  FireworksAIProvider,
  GroqProvider,
  PerplexityProvider,
  MistralProvider,
  Ai21Provider,
  UpstageProvider,
  XAIProvider,
  QwenProvider,
  HunyuanProvider,
  SparkProvider,
  ZhiPuProvider,
  ZeroOneProvider,
  StepfunProvider,
  MoonshotProvider,
  BaichuanProvider,
  MinimaxProvider,
  Ai360Provider,
  TaichuProvider,
  InternLMProvider,
  SiliconCloudProvider,
  HigressProvider,
  GiteeAIProvider,
];

const Page = async (props: PagePropsWithId) => {
  const params = await props.params;

  const builtinProviderCard = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === params.id);
  if (!!builtinProviderCard) return <ProviderDetail source={'builtin'} {...builtinProviderCard} />;

  if (isServerMode) {
    const { userId } = await getUserAuth();

    const aiProviderModel = new AiProviderModel(serverDB, userId!);

    const userCard = await aiProviderModel.getAiProviderById(
      params.id,
      KeyVaultsGateKeeper.getUserKeyVaults,
    );

    if (!userCard) return redirect('/settings/provider');

    return <ProviderDetail {...userCard} />;
  }

  return <div>not found</div>;
};

export default Page;
