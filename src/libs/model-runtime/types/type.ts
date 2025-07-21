import OpenAI from 'openai';

import { ILobeAgentRuntimeErrorType } from '../error';
import { ChatStreamPayload } from './chat';

export interface AgentInitErrorPayload {
  error: object;
  errorType: string | number;
}

export interface ChatCompletionErrorPayload {
  [key: string]: any;
  endpoint?: string;
  error: object;
  errorType: ILobeAgentRuntimeErrorType;
  provider: string;
}

export interface CreateChatCompletionOptions {
  chatModel: OpenAI;
  payload: ChatStreamPayload;
}

export enum ModelProvider {
  Ai21 = 'ai21',
  Ai360 = 'ai360',
  Anthropic = 'anthropic',
  Azure = 'azure',
  AzureAI = 'azureai',
  Baichuan = 'baichuan',
  Bedrock = 'bedrock',
  Cloudflare = 'cloudflare',
  Cohere = 'cohere',
  DeepSeek = 'deepseek',
  Fal = 'fal',
  FireworksAI = 'fireworksai',
  GiteeAI = 'giteeai',
  Github = 'github',
  Google = 'google',
  Groq = 'groq',
  Higress = 'higress',
  HuggingFace = 'huggingface',
  Hunyuan = 'hunyuan',
  InfiniAI = 'infiniai',
  InternLM = 'internlm',
  Jina = 'jina',
  LMStudio = 'lmstudio',
  LobeHub = 'lobehub',
  Minimax = 'minimax',
  Mistral = 'mistral',
  ModelScope = 'modelscope',
  Moonshot = 'moonshot',
  Novita = 'novita',
  Nvidia = 'nvidia',
  Ollama = 'ollama',
  OpenAI = 'openai',
  OpenRouter = 'openrouter',
  PPIO = 'ppio',
  Perplexity = 'perplexity',
  Qiniu = 'qiniu',
  Qwen = 'qwen',
  SambaNova = 'sambanova',
  Search1API = 'search1api',
  SenseNova = 'sensenova',
  SiliconCloud = 'siliconcloud',
  Spark = 'spark',
  Stepfun = 'stepfun',
  Taichu = 'taichu',
  TencentCloud = 'tencentcloud',
  TogetherAI = 'togetherai',
  Upstage = 'upstage',
  V0 = 'v0',
  VLLM = 'vllm',
  VertexAI = 'vertexai',
  Volcengine = 'volcengine',
  Wenxin = 'wenxin',
  XAI = 'xai',
  Xinference = 'xinference',
  ZeroOne = 'zeroone',
  ZhiPu = 'zhipu',
}

export type ModelProviderKey = Lowercase<keyof typeof ModelProvider>;
