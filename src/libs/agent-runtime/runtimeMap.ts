import { LobeAi21AI } from './ai21';
import { LobeAi360AI } from './ai360';
import LobeAnthropicAI from './anthropic';
import { LobeAzureOpenAI } from './azureOpenai';
import { LobeAzureAI } from './azureai';
import { LobeBaichuanAI } from './baichuan';
import LobeBedrockAI from './bedrock';
import { LobeCloudflareAI } from './cloudflare';
import { LobeCohereAI } from './cohere';
import { LobeDeepSeekAI } from './deepseek';
import { LobeFireworksAI } from './fireworksai';
import { LobeGiteeAI } from './giteeai';
import { LobeGithubAI } from './github';
import LobeGoogleAI from './google';
import { LobeGroq } from './groq';
import { LobeHigressAI } from './higress';
import { LobeHuggingFaceAI } from './huggingface';
import { LobeHunyuanAI } from './hunyuan';
import { LobeInfiniAI } from './infiniai';
import { LobeInternLMAI } from './internlm';
import { LobeJinaAI } from './jina';
import { LobeLMStudioAI } from './lmstudio';
import { LobeMinimaxAI } from './minimax';
import { LobeMistralAI } from './mistral';
import { LobeMoonshotAI } from './moonshot';
import { LobeNovitaAI } from './novita';
import { LobeNvidiaAI } from './nvidia';
import LobeOllamaAI from './ollama';
import { LobeOpenAI } from './openai';
import { LobeOpenRouterAI } from './openrouter';
import { LobePerplexityAI } from './perplexity';
import { LobePPIOAI } from './ppio';
import { LobeQwenAI } from './qwen';
import { LobeSambaNovaAI } from './sambanova';
import { LobeSearch1API } from './search1api';
import { LobeSenseNovaAI } from './sensenova';
import { LobeSiliconCloudAI } from './siliconcloud';
import { LobeSparkAI } from './spark';
import { LobeStepfunAI } from './stepfun';
import { LobeTaichuAI } from './taichu';
import { LobeTencentCloudAI } from './tencentcloud';
import { LobeTogetherAI } from './togetherai';
import { LobeUpstageAI } from './upstage';
import { LobeVLLMAI } from './vllm';
import { LobeVolcengineAI } from './volcengine';
import { LobeWenxinAI } from './wenxin';
import { LobeXAI } from './xai';
import { LobeZeroOneAI } from './zeroone';
import { LobeZhipuAI } from './zhipu';

export const providerRuntimeMap = {
  ai21: LobeAi21AI,
  ai360: LobeAi360AI,
  anthropic: LobeAnthropicAI,
  azure: LobeAzureOpenAI,
  azureai: LobeAzureAI,
  baichuan: LobeBaichuanAI,
  bedrock: LobeBedrockAI,
  cloudflare: LobeCloudflareAI,
  cohere: LobeCohereAI,
  deepseek: LobeDeepSeekAI,
  doubao: LobeVolcengineAI,
  fireworksai: LobeFireworksAI,
  giteeai: LobeGiteeAI,
  github: LobeGithubAI,
  google: LobeGoogleAI,
  groq: LobeGroq,
  higress: LobeHigressAI,
  huggingface: LobeHuggingFaceAI,
  hunyuan: LobeHunyuanAI,
  infiniai: LobeInfiniAI,
  internlm: LobeInternLMAI,
  jina: LobeJinaAI,
  lmstudio: LobeLMStudioAI,
  minimax: LobeMinimaxAI,
  mistral: LobeMistralAI,
  moonshot: LobeMoonshotAI,
  novita: LobeNovitaAI,
  nvidia: LobeNvidiaAI,
  ollama: LobeOllamaAI,
  openai: LobeOpenAI,
  openrouter: LobeOpenRouterAI,
  perplexity: LobePerplexityAI,
  ppio: LobePPIOAI,
  qwen: LobeQwenAI,
  sambanova: LobeSambaNovaAI,
  search1api: LobeSearch1API,
  sensenova: LobeSenseNovaAI,
  siliconcloud: LobeSiliconCloudAI,
  spark: LobeSparkAI,
  stepfun: LobeStepfunAI,
  taichu: LobeTaichuAI,
  tencentcloud: LobeTencentCloudAI,
  togetherai: LobeTogetherAI,
  upstage: LobeUpstageAI,
  vllm: LobeVLLMAI,
  volcengine: LobeVolcengineAI,
  wenxin: LobeWenxinAI,
  xai: LobeXAI,
  zeroone: LobeZeroOneAI,
  zhipu: LobeZhipuAI,
};
