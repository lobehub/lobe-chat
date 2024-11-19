import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.gitee.com/serverless-api/packages/1493
const GiteeAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'Qwen2.5-72B-Instruct  支持 16k 上下文, 生成长文本超过 8K 。支持 function call 与外部系统无缝交互，极大提升了灵活性和扩展性。模型知识明显增加，并且大大提高了编码和数学能力, 多语言支持超过 29 种',
      displayName: 'Qwen2.5 72B Instruct',
      enabled: true,
      functionCall: true,
      id: 'Qwen2.5-72B-Instruct',
      tokens: 16_000,
    },
    {
      description: 'Qwen2 是 Qwen 模型的最新系列，支持 128k 上下文，对比当前最优的开源模型，Qwen2-72B 在自然语言理解、知识、代码、数学及多语言等多项能力上均显著超越当前领先的模型。',
      displayName: 'Qwen2 72B Instruct',
      id: 'Qwen2-72B-Instruct',
      tokens: 6000,
    },
    {
      description: 'Qwen2 是 Qwen 模型的最新系列，能够超越同等规模的最优开源模型甚至更大规模的模型，Qwen2 7B 在多个评测上取得显著的优势，尤其是代码及中文理解上。',
      displayName: 'Qwen2 7B Instruct',
      id: 'Qwen2-7B-Instruct',
      tokens: 32_000,
    },
    {
      description: 'GLM-4-9B-Chat 在语义、数学、推理、代码和知识等多方面均表现出较高性能。还具备网页浏览、代码执行、自定义工具调用和长文本推理。 支持包括日语，韩语，德语在内的 26 种语言。',
      displayName: 'GLM4 9B Chat',
      enabled: true,
      id: 'glm-4-9b-chat',
      tokens: 32_000,
    },
    {
      description: 'Yi-1.5-34B 在保持原系列模型优秀的通用语言能力的前提下，通过增量训练 5 千亿高质量 token，大幅提高了数学逻辑、代码能力。',
      displayName: 'Yi 34B Chat',
      enabled: true,
      id: 'Yi-34B-Chat',
      tokens: 4000,
    },
    {
      description: 'DeepSeek Coder 33B 是一个代码语言模型， 基于 2 万亿数据训练而成，其中 87% 为代码， 13% 为中英文语言。模型引入 16K 窗口大小和填空任务，提供项目级别的代码补全和片段填充功能。',
      displayName: 'DeepSeek Coder 33B Instruct',
      enabled: true,
      id: 'deepseek-coder-33B-instruct',
      tokens: 8000,
    },
    {
      description: 'CodeGeeX4-ALL-9B 是一个多语言代码生成模型，支持包括代码补全和生成、代码解释器、网络搜索、函数调用、仓库级代码问答在内的全面功能，覆盖软件开发的各种场景。是参数少于 10B 的顶尖代码生成模型。',
      displayName: 'CodeGeeX4 All 9B',
      enabled: true,
      id: 'codegeex4-all-9b',
      tokens: 40_000,
    },
  ],
  checkModel: 'Qwen2-7B-Instruct',
  description:
    'Gitee AI 的 Serverless API 为 AI 开发者提供开箱即用的大模型推理 API 服务。',
  disableBrowserRequest: true,
  id: 'giteeai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.gitee.com/docs/openapi/v1#tag/serverless/POST/chat/completions',
  name: 'Gitee AI',
  url: 'https://ai.gitee.com',
};

export default GiteeAI;
