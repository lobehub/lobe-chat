export interface LobeAgentChatConfig {
  autoCreateTopicThreshold: number;
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
   * 自定义推理强度
   */
  enableReasoningEffort?: boolean;

  /**
   * 历史消息条数
   */
  historyCount?: number;
  inputTemplate?: string;
}

// 语言模型的设置参数
export interface LLMParams {
  /**
   * 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 1
   */
  reasoning_effort?: string;
  /**
   * 控制模型推理能力
   * @default medium
   */
  temperature?: number;
  /**
   * 控制生成文本中最高概率的单个 token
   * @default 1
   */
  top_p?: number;
}

export interface LobeAgentConfig {
  chatConfig: LobeAgentChatConfig;
  id?: string;
  /**
   * 角色所使用的语言模型
   * @default gpt-4o-mini
   */
  model: string;
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
}

export interface LobeAgentMeta {
  avatar?: string;
  description: string;
  systemRole?: string;
  tags?: string[];
  title: string;
}

export interface LobeAgent {
  author?: string;
  config?: {
    model?: {
      name?: string;
      provider?: string;
    };
    systemRole?: string;
  };
  createAt: string;
  homepage?: string;
  identifier: string;
  meta: LobeAgentMeta;
}

export interface AgentIndexResponse {
  agents: LobeAgent[];
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
