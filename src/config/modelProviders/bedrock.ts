import { ModelProviderCard } from '@/types/llm';

// ref :https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
// ref :https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/models
// ref :https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/models
const Bedrock: ModelProviderCard = {
  chatModels: [
    /*
    // TODO: Not support for now
    {
      description: '亚马逊 Titan Text Lite 是一款轻量级高效模型，非常适合对英语任务进行微调，包括总结和文案编写等，客户希望有一个更小、更经济的模型，同时也非常可定制。',
      displayName: 'Titan Text G1 - Lite',
      id: 'amazon.titan-text-lite-v1',
      tokens: 4000,
    },
    {
      description: '亚马逊 Titan Text Express 的上下文长度可达 8,000 个标记，非常适合广泛的高级通用语言任务，如开放式文本生成和对话聊天，以及在检索增强生成 (RAG) 中的支持。在推出时，该模型针对英语进行了优化，预览版还支持其他 100 多种语言。',
      displayName: 'Titan Text G1 - Express',
      id: 'amazon.titan-text-express-v1',
      tokens: 8000,
    },
    {
      description: 'Titan Text Premier 是 Titan Text 系列中一款强大的先进模型，旨在为广泛的企业应用提供卓越的性能。凭借其尖端能力，它提供了更高的准确性和卓越的结果，是寻求一流文本处理解决方案的组织的绝佳选择。',
      displayName: 'Titan Text G1 - Premier',
      id: 'amazon.titan-text-premier-v1:0',
      tokens: 32_000,
    },
*/
    {
      description:
        'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Claude 3 Haiku 是 Anthropic 最快、最紧凑的模型，提供近乎即时的响应速度。它可以快速回答简单的查询和请求。客户将能够构建模仿人类互动的无缝 AI 体验。Claude 3 Haiku 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-haiku-20240307-v1:0',
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Anthropic 的 Claude 3 Sonnet 在智能和速度之间达到了理想的平衡——特别适合企业工作负载。它以低于竞争对手的价格提供最大的效用，并被设计成为可靠的、高耐用的主力机，适用于规模化的 AI 部署。Claude 3 Sonnet 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
      displayName: 'Claude 3 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Claude 3 Opus 是 Anthropic 最强大的 AI 模型，具有在高度复杂任务上的最先进性能。它可以处理开放式提示和未见过的场景，具有出色的流畅性和类人的理解能力。Claude 3 Opus 展示了生成 AI 可能性的前沿。Claude 3 Opus 可以处理图像并返回文本输出，具有 200K 的上下文窗口。',
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-opus-20240229-v1:0',
      pricing: {
        input: 15,
        output: 75,
      },
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Claude 2 的更新版，具有双倍的上下文窗口，以及在长文档和 RAG 上下文中的可靠性、幻觉率和基于证据的准确性的改进。',
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      pricing: {
        input: 8,
        output: 24,
      },
      tokens: 200_000,
    },
    {
      description:
        'Anthropic 在从复杂对话和创意内容生成到详细指令跟随的广泛任务中都表现出高度能力的模型。',
      displayName: 'Claude 2.0',
      id: 'anthropic.claude-v2',
      pricing: {
        input: 8,
        output: 24,
      },
      tokens: 100_000,
    },
    {
      description:
        '一款快速、经济且仍然非常有能力的模型，可以处理包括日常对话、文本分析、总结和文档问答在内的一系列任务。',
      displayName: 'Claude Instant',
      id: 'anthropic.claude-instant-v1',
      pricing: {
        input: 0.8,
        output: 2.4,
      },
      tokens: 100_000,
    },
    {
      description:
        'Meta Llama 3.1 8B Instruct 的更新版，包括扩展的 128K 上下文长度、多语言性和改进的推理能力。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-8b-instruct-v1:0',
      pricing: {
        input: 0.22,
        output: 0.22,
      },
      tokens: 128_000,
    },
    {
      description:
        'Meta Llama 3.1 70B Instruct 的更新版，包括扩展的 128K 上下文长度、多语言性和改进的推理能力。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-70b-instruct-v1:0',
      pricing: {
        input: 0.99,
        output: 0.99,
      },
      tokens: 128_000,
    },
    {
      description:
        'Meta Llama 3.1 405B Instruct 是 Llama 3.1 Instruct 模型中最大、最强大的模型，是一款高度先进的对话推理和合成数据生成模型，也可以用作在特定领域进行专业持续预训练或微调的基础。Llama 3.1 提供的多语言大型语言模型 (LLMs) 是一组预训练的、指令调整的生成模型，包括 8B、70B 和 405B 大小 (文本输入/输出)。Llama 3.1 指令调整的文本模型 (8B、70B、405B) 专为多语言对话用例进行了优化，并在常见的行业基准测试中超过了许多可用的开源聊天模型。Llama 3.1 旨在用于多种语言的商业和研究用途。指令调整的文本模型适用于类似助手的聊天，而预训练模型可以适应各种自然语言生成任务。Llama 3.1 模型还支持利用其模型的输出来改进其他模型，包括合成数据生成和精炼。Llama 3.1 是使用优化的变压器架构的自回归语言模型。调整版本使用监督微调 (SFT) 和带有人类反馈的强化学习 (RLHF) 来符合人类对帮助性和安全性的偏好。',
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-405b-instruct-v1:0',
      pricing: {
        input: 5.32,
        output: 16,
      },
      tokens: 128_000,
    },
    {
      description:
        'Meta Llama 3 是一款面向开发者、研究人员和企业的开放大型语言模型 (LLM)，旨在帮助他们构建、实验并负责任地扩展他们的生成 AI 想法。作为全球社区创新的基础系统的一部分，它非常适合计算能力和资源有限、边缘设备和更快的训练时间。',
      displayName: 'Llama 3 8B Instruct',
      id: 'meta.llama3-8b-instruct-v1:0',
      pricing: {
        input: 0.3,
        output: 0.6,
      },
      tokens: 8000,
    },
    {
      description:
        'Meta Llama 3 是一款面向开发者、研究人员和企业的开放大型语言模型 (LLM)，旨在帮助他们构建、实验并负责任地扩展他们的生成 AI 想法。作为全球社区创新的基础系统的一部分，它非常适合内容创建、对话 AI、语言理解、研发和企业应用。',
      displayName: 'Llama 3 70B Instruct',
      id: 'meta.llama3-70b-instruct-v1:0',
      pricing: {
        input: 2.65,
        output: 3.5,
      },
      tokens: 8000,
    },
    /*
    // TODO: Not support for now
    {
      description: 'A 7B dense Transformer, fast-deployed and easily customisable. Small, yet powerful for a variety of use cases. Supports English and code, and a 32k context window.',
      displayName: 'Mistral 7B Instruct',
      enabled: true,
      id: 'mistral.mistral-7b-instruct-v0:2',
      tokens: 32_000,
    },
    {
      description: 'A 7B sparse Mixture-of-Experts model with stronger capabilities than Mistral 7B. Uses 12B active parameters out of 45B total. Supports multiple languages, code and 32k context window.',
      displayName: 'Mixtral 8X7B Instruct',
      enabled: true,
      id: 'mistral.mixtral-8x7b-instruct-v0:1',
      tokens: 32_000,
    },
    {
      description: 'Mistral Small is perfectly suited for straightforward tasks that can be performed in bulk, such as classification, customer support, or text generation. It provides outstanding performance at a cost-effective price point.',
      displayName: 'Mistral Small',
      functionCall: true,
      id: 'mistral.mistral-small-2402-v1:0',
      tokens: 32_000,
    },
    {
      description: 'Mistral Large 2407 is an advanced Large Language Model (LLM) that supports dozens of languages and is trained on 80+ coding languages. It has best-in-class agentic capabilities with native function calling JSON outputting and reasoning capabilities.',
      displayName: 'Mistral Large 2 (24.07)',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2407-v1:0',
      tokens: 128_000,
    },
    {
      description: 'The most advanced Mistral AI Large Language model capable of handling any language task including complex multilingual reasoning, text understanding, transformation, and code generation.',
      displayName: 'Mistral Large',
      enabled: true,
      functionCall: true,
      id: 'mistral.mistral-large-2402-v1:0',
      tokens: 32_000,
    },
*/
    /*
    // TODO: Not support for now
    {
      description: 'Command R+ is a highly performant generative language model optimized for large scale production workloads.',
      displayName: 'Command R+',
      enabled: true,
      functionCall: true,
      id: 'cohere.command-r-plus-v1:0',
      tokens: 128_000,
    },
    {
      description: 'Command R is a generative language model optimized for long-context tasks and large scale production workloads.',
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
      description: 'Command is Cohere flagship text generation model. It is trained to follow user commands and to be instantly useful in practical business applications.',
      displayName: 'Command',
      id: 'cohere.command-text-v14',
      tokens: 4000,
    },
    {
      description: 'Cohere Command-Light is a generative model that responds well with instruction-like prompts. This model provides customers with an unbeatable balance of quality, cost-effectiveness, and low-latency inference.',
      displayName: 'Command Light',
      id: 'cohere.command-light-text-v14',
      tokens: 4000,
    },
*/
    /*
    // TODO: Not support for now
    {
      description: 'The latest Foundation Model from AI21 Labs, Jamba-Instruct offers an impressive 256K context window and delivers the best value per price on core text generation, summarization, and question answering tasks for the enterprise.',
      displayName: 'Jamba-Instruct',
      id: 'ai21.jamba-instruct-v1:0',
      tokens: 256_000,
    },
*/
    /*
    // Cohere Command (Text) and AI21 Labs Jurassic-2 (Text) don't support chat with the Converse API
    {
      description: 'Jurassic-2 Mid is less powerful than Ultra, yet carefully designed to strike the right balance between exceptional quality and affordability. Jurassic-2 Mid can be applied to any language comprehension or generation task including question answering, summarization, long-form copy generation, advanced information extraction and many others.',
      displayName: 'Jurassic-2 Mid',
      id: 'ai21.j2-mid-v1',
      tokens: 8191,
    },
    {
      description: 'Jurassic-2 Ultra is AI21’s most powerful model for complex tasks that require advanced text generation and comprehension. Popular use cases include question answering, summarization, long-form copy generation, advanced information extraction, and more.',
      displayName: 'Jurassic-2 Ultra',
      id: 'ai21.j2-ultra-v1',
      tokens: 8191,
    },
*/
  ],
  checkModel: 'anthropic.claude-instant-v1',
  description:
    'Bedrock 是亚马逊 AWS 提供的一项服务，专注于为企业提供先进的 AI 语言模型和视觉模型。其模型家族包括 Anthropic 的 Claude 系列、Meta 的 Llama 3.1 系列等，涵盖从轻量级到高性能的多种选择，支持文本生成、对话、图像处理等多种任务，适用于不同规模和需求的企业应用。',
  id: 'bedrock',
  modelsUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html',
  name: 'Bedrock',
  url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html',
};

export default Bedrock;
