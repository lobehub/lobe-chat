import { AIChatModelCard } from '../types/aiModel';

const ollamaCloudModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Devstral 2 123B excels at using tools to explore codebases, edit multiple files, and support software engineering agents.',
    displayName: 'Devstral 2',
    id: 'devstral-2:123b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'Cogito v2.1 671B is a US open-source LLM free for commercial use, with performance rivaling top models, higher token reasoning efficiency, a 128k long context, and strong overall capability.',
    displayName: 'Cogito v2.1 671B',
    id: 'cogito-2.1:671b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576,
    description:
      'Gemini 3 Pro is Google’s most intelligent model, with state-of-the-art reasoning, multimodal understanding, and strong agent and vibe-coding capabilities.',
    displayName: 'Gemini 3 Pro Preview',
    id: 'gemini-3-pro-preview',
    releasedAt: '2025-11-20',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description: 'MiniMax M2 is an efficient LLM built for coding and agent workflows.',
    displayName: 'MiniMax M2',
    enabled: true,
    id: 'minimax-m2',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Zhipu’s latest flagship GLM-4.6 (355B) surpasses prior versions in advanced coding, long-text handling, reasoning, and agent capabilities, aligning with Claude Sonnet 4 in programming performance and ranking among the top coding models in China.',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'glm-4.6',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek V3.1 is a next-generation reasoning model with improved complex reasoning and chain-of-thought, suited for tasks requiring deep analysis.',
    displayName: 'DeepSeek V3.1',
    id: 'deepseek-v3.1:671b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 20B is an open-source LLM from OpenAI using MXFP4 quantization, suitable for high-end consumer GPUs or Apple Silicon Macs. It performs well in dialogue generation, coding, and reasoning tasks, supporting function calling and tool use.',
    displayName: 'GPT-OSS 20B',
    id: 'gpt-oss:20b',
    releasedAt: '2025-08-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 120B is OpenAI’s large open-source LLM using MXFP4 quantization and positioned as a flagship model. It requires multi-GPU or high-end workstation environments and delivers excellent performance in complex reasoning, code generation, and multilingual processing, with advanced function calling and tool integration.',
    displayName: 'GPT-OSS 120B',
    id: 'gpt-oss:120b',
    releasedAt: '2025-08-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi K2 is a large MoE LLM from Moonshot AI with 1T total parameters and 32B active per forward pass. It is optimized for agent capabilities including advanced tool use, reasoning, and code synthesis.',
    displayName: 'Kimi K2',
    id: 'kimi-k2:1t',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description: "Alibaba's high-performance long-context model for agent and coding tasks.",
    displayName: 'Qwen3 Coder 480B',
    id: 'qwen3-coder:480b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    displayName: 'Qwen3 VL 235B Instruct',
    id: 'qwen3-vl:235b-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    displayName: 'Qwen3 VL 235B',
    id: 'qwen3-vl:235b',
    type: 'chat',
  },
];

export const allModels = [...ollamaCloudModels];

export default allModels;
