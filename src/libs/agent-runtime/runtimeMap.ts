import { LobeAi21AI } from './ai21';
import { LobeAi360AI } from './ai360';
import LobeAnthropicAI from './anthropic';
import { LobeAzureOpenAI } from './azureOpenai';
import { LobeAzureAI } from './azureai';
import { LobeBaichuanAI } from './baichuan';
import LobeBedrockAI from './bedrock';
import { LobeCloudflareAI } from './cloudflare';
import { LobeDeepSeekAI } from './deepseek';
import { LobeFireworksAI } from './fireworksai';
import { LobeGiteeAI } from './giteeai';
import { LobeGithubAI } from './github';
import LobeGoogleAI from './google';
import { LobeGroq } from './groq';
import { LobeHigressAI } from './higress';
import { LobeHuggingFaceAI } from './huggingface';
import { LobeHunyuanAI } from './hunyuan';
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
import { LobeSenseNovaAI } from './sensenova';
import { LobeSiliconCloudAI } from './siliconcloud';
import { LobeSparkAI } from './spark';
import { LobeStepfunAI } from './stepfun';
import { LobeTaichuAI } from './taichu';
import { LobeTencentCloudAI } from './tencentcloud';
import { LobeTogetherAI } from './togetherai';
import { ModelProvider } from './types';
import { LobeUpstageAI } from './upstage';
import { LobeVLLMAI } from './vllm';
import { LobeVolcengineAI } from './volcengine';
import { LobeWenxinAI } from './wenxin';
import { LobeXAI } from './xai';
import { LobeZeroOneAI } from './zeroone';
import { LobeZhipuAI } from './zhipu';

export const providerRuntimeMap = {
  [ModelProvider.OpenAI]: LobeOpenAI,
  [ModelProvider.Azure]: LobeAzureOpenAI,
  [ModelProvider.AzureAI]: LobeAzureAI,
  [ModelProvider.ZhiPu]: LobeZhipuAI,
  [ModelProvider.Google]: LobeGoogleAI,
  [ModelProvider.Moonshot]: LobeMoonshotAI,
  [ModelProvider.Bedrock]: LobeBedrockAI,
  [ModelProvider.LMStudio]: LobeLMStudioAI,
  [ModelProvider.Ollama]: LobeOllamaAI,
  [ModelProvider.VLLM]: LobeVLLMAI,
  [ModelProvider.Perplexity]: LobePerplexityAI,
  [ModelProvider.Anthropic]: LobeAnthropicAI,
  [ModelProvider.DeepSeek]: LobeDeepSeekAI,
  [ModelProvider.HuggingFace]: LobeHuggingFaceAI,
  [ModelProvider.Minimax]: LobeMinimaxAI,
  [ModelProvider.Mistral]: LobeMistralAI,
  [ModelProvider.Groq]: LobeGroq,
  [ModelProvider.Github]: LobeGithubAI,
  [ModelProvider.OpenRouter]: LobeOpenRouterAI,
  [ModelProvider.TogetherAI]: LobeTogetherAI,
  [ModelProvider.FireworksAI]: LobeFireworksAI,
  [ModelProvider.ZeroOne]: LobeZeroOneAI,
  [ModelProvider.Stepfun]: LobeStepfunAI,
  [ModelProvider.Qwen]: LobeQwenAI,
  [ModelProvider.Novita]: LobeNovitaAI,
  [ModelProvider.Nvidia]: LobeNvidiaAI,
  [ModelProvider.Taichu]: LobeTaichuAI,
  [ModelProvider.Baichuan]: LobeBaichuanAI,
  [ModelProvider.Ai360]: LobeAi360AI,
  [ModelProvider.SiliconCloud]: LobeSiliconCloudAI,
  [ModelProvider.GiteeAI]: LobeGiteeAI,
  [ModelProvider.Upstage]: LobeUpstageAI,
  [ModelProvider.Spark]: LobeSparkAI,
  [ModelProvider.Ai21]: LobeAi21AI,
  [ModelProvider.Hunyuan]: LobeHunyuanAI,
  [ModelProvider.SenseNova]: LobeSenseNovaAI,
  [ModelProvider.XAI]: LobeXAI,
  [ModelProvider.Jina]: LobeJinaAI,
  [ModelProvider.SambaNova]: LobeSambaNovaAI,
  [ModelProvider.Cloudflare]: LobeCloudflareAI,
  [ModelProvider.InternLM]: LobeInternLMAI,
  [ModelProvider.Higress]: LobeHigressAI,
  [ModelProvider.TencentCloud]: LobeTencentCloudAI,
  [ModelProvider.Volcengine]: LobeVolcengineAI,
  [ModelProvider.PPIO]: LobePPIOAI,
  [ModelProvider.Doubao]: LobeVolcengineAI,
  [ModelProvider.Wenxin]: LobeWenxinAI,
};
