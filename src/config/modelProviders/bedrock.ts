import { ModelProviderCard } from '@/types/llm';

const Bedrock: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Amazon Titan Text G1 - Express v1，上下文长度可达 8000 个 token，适合广泛的用途。',
      displayName: 'Titan Text G1 - Express',
      hidden: true,
      id: 'amazon.titan-text-express-v1:0:8k',
      tokens: 8000,
    },
    {
      description:
        'Anthropic 推出的 Claude 3 Sonnet 模型在智能和速度之间取得理想的平衡，尤其是在处理企业工作负载方面。该模型提供最大的效用，同时价格低于竞争产品，并且其经过精心设计，是大规模部署人工智能的可信赖、高耐久性骨干模型。 Claude 3 Sonnet 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3 Sonnet',
      id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Claude 3 Haiku 是 Anthropic 最快速、最紧凑的模型，具有近乎即时的响应能力。该模型可以快速回答简单的查询和请求。客户将能够构建模仿人类交互的无缝人工智能体验。 Claude 3 Haiku 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3 Haiku',
      id: 'anthropic.claude-3-haiku-20240307-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Claude 2.1 v2.1，上下文大小等于 200k。Claude 2 的更新版本，采用双倍的上下文窗口，并在长文档和 RAG 上下文中提高可靠性、幻觉率和循证准确性。',
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      tokens: 200_000,
    },
    {
      description:
        'Claude Instant 1.2 v1.2，上下文大小等于 100k。一种更快速、更实惠但仍然非常强大的模型，它可以处理一系列任务，包括随意对话、文本分析、摘要和文档问题回答。',
      displayName: 'Claude Instant 1.2',
      id: 'anthropic.claude-instant-v1',
      tokens: 100_000,
    },
    {
      description: 'Llama 2 Chat 13B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 13B',
      id: 'meta.llama2-13b-chat-v1',
      tokens: 4000,
    },
    {
      description: 'Llama 2 Chat 70B v1，上下文大小为 4k，Llama 2 模型的对话用例优化变体。',
      displayName: 'Llama 2 Chat 70B',
      id: 'meta.llama2-70b-chat-v1',
      tokens: 4000,
    },
  ],
  id: 'bedrock',
};

export default Bedrock;
