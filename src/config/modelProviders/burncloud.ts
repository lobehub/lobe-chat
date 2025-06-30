import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.burncloud.com/v1
const BurnCloud: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 200_000,
      description:
        'Claude Sonnet 4是Anthropic最新的旗舰模型，具有卓越的推理能力和语言理解能力，支持长文本处理。',
      displayName: 'Claude Sonnet 4',
      enabled: true,
      id: 'claude-sonnet-4-20250514',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'Claude 3.7 Sonnet提供强大的语言理解和生成能力，在各种任务中表现出色。',
      displayName: 'Claude 3.7 Sonnet',
      enabled: true,
      id: 'claude-3-7-sonnet-20250219',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'Claude 3.5 Sonnet是一个强大的多模态模型，支持图像理解和处理。',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      id: 'claude-3-5-sonnet-20241022',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GPT-4o是OpenAI最新的多模态模型，具有出色的推理能力和视觉理解能力。',
      displayName: 'GPT-4o',
      enabled: true,
      id: 'gpt-4o',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GPT-4o mini是OpenAI的轻量级多模态模型，提供高性价比的AI服务。',
      displayName: 'GPT-4o mini',
      enabled: true,
      id: 'gpt-4o-mini',
    },
    {
      contextWindowTokens: 1_048_576,
      description:
        'Gemini 2.5 Pro是Google最新的多模态大语言模型，支持长文本和多种输入形式。',
      displayName: 'Gemini 2.5 Pro',
      enabled: true,
      id: 'gemini-2.5-pro-preview-05-06',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek R1是DeepSeek团队发布的开源模型，具备强悍的推理性能，尤其在数学、编程和推理任务上表现出色。',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-r1',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek V3推理速度大幅提升，位居开源模型之首，采用负载均衡辅助策略和多标记预测训练，性能显著增强。',
      displayName: 'DeepSeek V3',
      enabled: true,
      id: 'deepseek-v3',
    },
  ],
  checkModel: 'claude-3-7-sonnet-20250219',
  description: 'BurnCloud是一个高性能AI服务平台，提供Claude系列、GPT系列、Gemini、DeepSeek等多种行业领先大模型的API服务，具有稳定可靠、响应迅速的特点。',
  id: 'burncloud',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.burncloud.com/v1',
  name: 'BurnCloud',
  settings: {
    proxyUrl: {
      placeholder: 'https://ai.burncloud.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://ai.burncloud.com',
};

export default BurnCloud; 