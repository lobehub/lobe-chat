/**
 * 移动端 Agent 配置类型定义
 * 与 web 端保持完全一致，某些功能在移动端暂不实现
 */

import { FewShots, LLMParams } from '@/types/llm';
import { FileItem } from '@/types/files';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';
import { SearchMode } from '@/types/search';

/**
 * 工作模型接口
 */
export interface WorkingModel {
  model: string;
  provider: string;
}

/**
 * TTS 服务器类型
 */
export type TTSServer = 'openai' | 'edge' | 'microsoft';

/**
 * Agent TTS 配置
 */
export interface LobeAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  sttLocale: 'auto' | string;
  ttsService: TTSServer;
  voice: {
    edge?: string;
    microsoft?: string;
    openai: string;
  };
}

/**
 * Agent 聊天配置
 */
export interface LobeAgentChatConfig {
  autoCreateTopicThreshold: number;
  /**
   * 禁用上下文缓存
   */
  disableContextCaching?: boolean;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic?: boolean;
  /**
   * 历史消息长度压缩阈值
   */
  enableCompressHistory?: boolean;
  /**
   * 开启历史记录条数
   */
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;
  /**
   * 是否开启推理
   */
  enableReasoning?: boolean;
  /**
   * 自定义推理强度
   */
  enableReasoningEffort?: boolean;
  /**
   * 历史消息条数
   */
  historyCount?: number;
  inputTemplate?: string;
  reasoningBudgetToken?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  searchFCModel?: WorkingModel;
  searchMode?: SearchMode;
  thinking?: 'disabled' | 'auto' | 'enabled';
  thinkingBudget?: number;
  useModelBuiltinSearch?: boolean;
}

/**
 * Agent 配置接口 (与 web 端完全一致)
 */
export interface LobeAgentConfig {
  chatConfig: LobeAgentChatConfig;
  fewShots?: FewShots;
  files?: FileItem[];
  id?: string;
  /**
   * knowledge bases
   */
  knowledgeBases?: KnowledgeBaseItem[];
  /**
   * 角色所使用的语言模型
   * @default gpt-4o-mini
   */
  model: string;

  /**
   * 开场白
   */
  openingMessage?: string;
  /**
   * 开场问题
   */
  openingQuestions?: string[];

  /**
   * 语言模型参数
   */
  params: LLMParams;
  /**
   * 启用的插件
   */
  plugins?: string[];

  /**
   *  模型供应商
   */
  provider?: string;

  /**
   * 系统角色
   */
  systemRole: string;

  /**
   * 语音服务
   */
  tts: LobeAgentTTSConfig;
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
  DeepSeek = 'deepseek',
  /**
   * @deprecated
   */
  Doubao = 'doubao',
  FireworksAI = 'fireworksai',
  GiteeAI = 'giteeai',
  Github = 'github',
  Google = 'google',
  Groq = 'groq',
  Higress = 'higress',
  HuggingFace = 'huggingface',
  Hunyuan = 'hunyuan',
  InternLM = 'internlm',
  Jina = 'jina',
  LMStudio = 'lmstudio',
  Minimax = 'minimax',
  Mistral = 'mistral',
  Moonshot = 'moonshot',
  Novita = 'novita',
  Nvidia = 'nvidia',
  Ollama = 'ollama',
  OpenAI = 'openai',
  OpenRouter = 'openrouter',
  Perplexity = 'perplexity',
  Qwen = 'qwen',
  SambaNova = 'sambanova',
  SenseNova = 'sensenova',
  SiliconCloud = 'siliconcloud',
  Spark = 'spark',
  Stepfun = 'stepfun',
  Taichu = 'taichu',
  TencentCloud = 'tencentcloud',
  TogetherAI = 'togetherai',
  Upstage = 'upstage',
  VLLM = 'vllm',
  VertexAI = 'vertexai',
  Volcengine = 'volcengine',
  Wenxin = 'wenxin',
  XAI = 'xai',
  ZeroOne = 'zeroone',
  ZhiPu = 'zhipu',
}

/**
 * Agent 配置的可配置键类型
 */
export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];

/**
 * 导出聊天配置相关类型
 */
export { SearchMode } from '@/types/search';
