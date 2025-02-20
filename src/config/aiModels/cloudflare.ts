import { AIChatModelCard } from '@/types/aiModel';

const cloudflareChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 16_384,
    displayName: 'DeepSeek R1 (Distill Qwen 32B)',
    enabled: true,
    id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    type: 'chat',
  },
  {
    contextWindowTokens: 2048,
    displayName: 'gemma-7b-it',
    id: '@hf/google/gemma-7b-it',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    displayName: 'hermes-2-pro-mistral-7b',
    id: '@hf/nousresearch/hermes-2-pro-mistral-7b',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'llama 3.3 70b',
    id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    displayName: 'mistral-7b-instruct-v0.2',
    id: '@hf/mistral/mistral-7b-instruct-v0.2',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'neural-chat-7b-v3-1-awq',
    enabled: true,
    id: '@hf/thebloke/neural-chat-7b-v3-1-awq',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'openchat-3.5-0106',
    id: '@cf/openchat/openchat-3.5-0106',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'openhermes-2.5-mistral-7b-awq',
    id: '@hf/thebloke/openhermes-2.5-mistral-7b-awq',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'qwen1.5-14b-chat-awq',
    enabled: true,
    id: '@cf/qwen/qwen1.5-14b-chat-awq',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    displayName: 'starling-lm-7b-beta',
    id: '@hf/nexusflow/starling-lm-7b-beta',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'zephyr-7b-beta-awq',
    id: '@hf/thebloke/zephyr-7b-beta-awq',
    type: 'chat',
  },
  {
    displayName: 'meta-llama-3-8b-instruct',
    id: '@hf/meta-llama/meta-llama-3-8b-instruct',
    type: 'chat',
  },
];

export const allModels = [...cloudflareChatModels];

export default allModels;
