import { ModelProviderCard } from '@/types/llm';

// ref https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
// ref https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
const Bedrock: ModelProviderCard = {
  chatModels: [
/*
    // TODO: Not support for now
    {
      description: 'Amazon Titan Text G1 - Lite is a light weight efficient model, ideal for fine-tuning of English-language tasks, including like summarizations and copy writing, where customers want a smaller, more cost-effective model that is also highly customizable.',
      displayName: 'Titan Text G1 - Lite',
      id: 'amazon.titan-text-lite-v1',
      tokens: 4000,
    },
    {
      description: 'Amazon Titan Text G1 - Express is a large language model for text generation. It is useful for a wide range of advanced, general language tasks such as open-ended text generation and conversational chat, as well as support within Retrieval Augmented Generation (RAG). At launch, the model is optimized for English, with multilingual support for more than 30 additional languages available in preview.',
      displayName: 'Titan Text G1 - Express',
      id: 'amazon.titan-text-express-v1',
      tokens: 8000,
    },
    {
      description: 'Amazon Titan Text G1 - Premier is a large language model for text generation. It is useful for a wide range of tasks including open-ended and context-based question answering, code generation, and summarization. This model is integrated with Amazon Bedrock Knowledge Base and Amazon Bedrock Agents. The model also supports Custom Finetuning in preview.',
      displayName: 'Titan Text Premier',
      id: 'amazon.titan-text-premier-v1:0',
      tokens: 32_000,
    },
*/
    {
      description: 'Claude 3.5 Sonnet 提高了行业的智能标准, 在广泛的基准测试中超越了竞争对手模型以及 Claude 3 Opus, 以中端模型的速度和成本，展现出卓越性能。 Claude 3.5 Sonnet 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Anthropic 推出的 Claude 3 Sonnet 模型在智能和速度之间取得理想的平衡，尤其是在处理企业工作负载方面。该模型提供最大的效用，同时价格低于竞争产品，并且其经过精心设计，是大规模部署人工智能的可信赖、高耐久性骨干模型。 Claude 3 Sonnet 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 3 Opus 是 Anthropic 最强大的人工智能模型，在处理高度复杂的任务方面具备顶尖性能。该模型能够以非凡的流畅性和类似人类的理解能力引导开放式的提示和未可见的场景。Claude 3 Opus 向我们展示生成式人工智能的美好前景。 Claude 3 Opus 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-opus-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 3 Haiku 是 Anthropic 最快速、最紧凑的模型，具有近乎即时的响应能力。该模型可以快速回答简单的查询和请求。客户将能够构建模仿人类交互的无缝人工智能体验。 Claude 3 Haiku 可以处理图像和返回文本输出，并且提供 200K 上下文窗口。',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-haiku-20240307-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 2.1 v2.1，上下文大小等于 200k。Claude 2 的更新版本，采用双倍的上下文窗口，并在长文档和 RAG 上下文中提高可靠性、幻觉率和循证准确性。',
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      tokens: 200_000,
    },
    {
      displayName: 'Claude 2.0',
      id: 'anthropic.claude-v2',
      tokens: 100_000,
    },
    {
      description: 'Claude Instant 1.2 v1.2，上下文大小等于 100k。一种更快速、更实惠但仍然非常强大的模型，它可以处理一系列任务，包括随意对话、文本分析、摘要和文档问题回答。',
      displayName: 'Claude Instant',
      id: 'anthropic.claude-instant-v1',
      tokens: 100_000,
    },
    {
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-8b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-70b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-405b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Llama 3 8B Instruct',
      id: 'meta.llama3-8b-instruct-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 70B Instruct',
      id: 'meta.llama3-70b-instruct-v1:0',
      tokens: 8192,
    },
/*
    // This model is unavailable. To enable access to this model, contact support . Note that your request may be fully approved, partially approved, or denied to maintain service performance and ensure appropriate usage of Amazon Bedrock.
    {
      displayName: 'Llama 2 Chat 13B',
      id: 'meta.llama2-13b-chat-v1',
      tokens: 4096,
    },
    {
      displayName: 'Llama 2 Chat 70B',
      id: 'meta.llama2-70b-chat-v1',
      tokens: 4096,
    },
*/
/*
    // TODO: Not support for now
    {
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistral.mistral-7b-instruct-v0:2',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral 8X7B Instruct',
      enabled: true,
      id: 'mistral.mixtral-8x7b-instruct-v0:1',
      tokens: 4096,
    },
    {
      displayName: 'Mistral Small',
      functionCall: true,
      id: 'mistral.mistral-small-2402-v1:0',
      tokens: 8192,
    },
    {
      displayName: 'Mistral Large 2 (24.07)',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2407-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Mistral Large',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2402-v1:0',
      tokens: 8192,
    },
*/
/*
    // TODO: Not support for now
    {
      displayName: 'Command R+',
      enabled: true,
      functionCall: true,
      id: 'cohere.command-r-plus-v1:0',
      tokens: 128_000,
    },
    {
      displayName: 'Command R',
      enabled: true,
      functionCall: true,
      id: 'cohere.command-r-v1:0',
      tokens: 128_000,
    },
*/
/*
    // Cohere Command (Text) and AI21 Labs Jurassic-2 (Text) don't support chat with the Converse API
    {
      displayName: 'Command',
      id: 'cohere.command-text-v14',
      tokens: 4096,
    },
    {
      displayName: 'Command Light',
      id: 'cohere.command-light-text-v14',
      tokens: 4096,
    },
*/
/*
    // TODO: Not support for now
    {
      displayName: 'Jamba-Instruct',
      id: 'ai21.jamba-instruct-v1:0',
      tokens: 4096,
    },
*/
/*
    // Cohere Command (Text) and AI21 Labs Jurassic-2 (Text) don't support chat with the Converse API
    {
      displayName: 'Jurassic-2 Mid',
      id: 'ai21.j2-mid-v1',
      tokens: 8192,
    },
    {
      displayName: 'Jurassic-2 Ultra',
      id: 'ai21.j2-ultra-v1',
      tokens: 8192,
    },
*/
  ],
  checkModel: 'anthropic.claude-instant-v1',
  id: 'bedrock',
  name: 'Bedrock',
};

export default Bedrock;
