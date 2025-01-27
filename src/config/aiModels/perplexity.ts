import { AIChatModelCard } from '@/types/aiModel';

const perplexityChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 Sonar Small Online 模型，具备8B参数，支持约127,000个标记的上下文长度，专为在线聊天设计，能高效处理各种文本交互。',
    displayName: 'Llama 3.1 Sonar Small Online',
    enabled: true,
    id: 'llama-3.1-sonar-small-128k-online',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 Sonar Large Online 模型，具备70B参数，支持约127,000个标记的上下文长度，适用于高容量和多样化聊天任务。',
    displayName: 'Llama 3.1 Sonar Large Online',
    enabled: true,
    id: 'llama-3.1-sonar-large-128k-online',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 Sonar Huge Online 模型，具备405B参数，支持约127,000个标记的上下文长度，设计用于复杂的在线聊天应用。',
    displayName: 'Llama 3.1 Sonar Huge Online',
    enabled: true,
    id: 'llama-3.1-sonar-huge-128k-online',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 Sonar Small Chat 模型，具备8B参数，专为离线聊天设计，支持约127,000个标记的上下文长度。',
    displayName: 'Llama 3.1 Sonar Small Chat',
    enabled: true,
    id: 'llama-3.1-sonar-small-128k-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 Sonar Large Chat 模型，具备70B参数，支持约127,000个标记的上下文长度，适合于复杂的离线聊天任务。',
    displayName: 'Llama 3.1 Sonar Large Chat',
    enabled: true,
    id: 'llama-3.1-sonar-large-128k-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 8B Instruct 模型，具备8B参数，支持画面指示任务的高效执行，提供优质的文本生成能力。',
    id: 'llama-3.1-8b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 70B Instruct 模型，具备70B参数，能在大型文本生成和指示任务中提供卓越性能。',
    id: 'llama-3.1-70b-instruct',
    type: 'chat',
  },
];

export const allModels = [...perplexityChatModels];

export default allModels;
