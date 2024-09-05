import { ModelProviderCard } from '@/types/llm';

// ref https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
// ref https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
// ref https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/models
// ref https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/models
const Bedrock: ModelProviderCard = {
  chatModels: [
/*
    // TODO: Not support for now
    {
      description: 'Amazon Titan Text Lite is a light weight efficient model ideal for fine-tuning for English-language tasks, including like summarization and copywriting, where customers want a smaller, more cost-effective model that is also highly customizable.',
      displayName: 'Titan Text G1 - Lite',
      id: 'amazon.titan-text-lite-v1',
      tokens: 4000,
    },
    {
      description: 'Amazon Titan Text Express has a context length of up to 8,000 tokens, making it well-suited for a wide range of advanced, general language tasks such as open-ended text generation and conversational chat, as well as support within Retrieval Augmented Generation (RAG). At launch, the model is optimized for English, with multilingual support for more than 100 additional languages available in preview.',
      displayName: 'Titan Text G1 - Express',
      id: 'amazon.titan-text-express-v1',
      tokens: 8000,
    },
    {
      description: 'Titan Text Premier is a powerful and advanced model within the Titan Text family, designed to deliver superior performance across a wide range of enterprise applications. With its cutting-edge capabilities, it offers enhanced accuracy and exceptional results, making it an excellent choice for organizations seeking top-notch text processing solutions.',
      displayName: 'Titan Text G1 - Premier',
      id: 'amazon.titan-text-premier-v1:0',
      tokens: 32_000,
    },
*/
    {
      description: 'Claude 3.5 Sonnet raises the industry bar for intelligence, outperforming competitor models and Claude 3 Opus on a wide range of evaluations, with the speed and cost of our mid-tier model, Claude 3 Sonnet.',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 3 Sonnet by Anthropic strikes the ideal balance between intelligence and speed—particularly for enterprise workloads. It offers maximum utility at a lower price than competitors, and is engineered to be the dependable, high-endurance workhorse for scaled AI deployments. Claude 3 Sonnet can process images and return text outputs, and features a 200K context window.',
      displayName: 'Claude 3 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 3 Opus is Anthropic most powerful AI model, with state-of-the-art performance on highly complex tasks. It can navigate open-ended prompts and sight-unseen scenarios with remarkable fluency and human-like understanding. Claude 3 Opus shows us the frontier of what’s possible with generative AI. Claude 3 Opus can process images and return text outputs, and features a 200K context window.',
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-opus-20240229-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'Claude 3 Haiku is Anthropic fastest, most compact model for near-instant responsiveness. It answers simple queries and requests with speed. Customers will be able to build seamless AI experiences that mimic human interactions. Claude 3 Haiku can process images and return text outputs, and features a 200K context window.',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'anthropic.claude-3-haiku-20240307-v1:0',
      tokens: 200_000,
      vision: true,
    },
    {
      description: 'An update to Claude 2 that features double the context window, plus improvements across reliability, hallucination rates, and evidence-based accuracy in long document and RAG contexts.',
      displayName: 'Claude 2.1',
      id: 'anthropic.claude-v2:1',
      tokens: 200_000,
    },
    {
      description: 'Anthropic highly capable model across a wide range of tasks from sophisticated dialogue and creative content generation to detailed instruction following.',
      displayName: 'Claude 2.0',
      id: 'anthropic.claude-v2',
      tokens: 100_000,
    },
    {
      description: 'A fast, affordable yet still very capable model, which can handle a range of tasks including casual dialogue, text analysis, summarization, and document question-answering.',
      displayName: 'Claude Instant',
      id: 'anthropic.claude-instant-v1',
      tokens: 100_000,
    },
    {
      description: 'An update to Meta Llama 3 8B Instruct that includes an expanded 128K context length, multilinguality and improved reasoning capabilities. The Llama 3.1 offering of multilingual large language models (LLMs) is a collection of pretrained and instruction-tuned generative models in 8B, 70B and 405B sizes (text in/text out). The Llama 3.1 instruction-tuned text only models (8B, 70B, 405B) are optimized for multilingual dialogue use cases and outperform many of the available open source chat models on common industry benchmarks. Llama 3.1 is intended for commercial and research use in multiple languages. Instruction tuned text only models are intended for assistant-like chat, whereas pretrained models can be adapted for a variety of natural language generation tasks. The Llama 3.1 models also support the ability to leverage the outputs of its models to improve other models including synthetic data generation and distillation. Llama 3.1 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align with human preferences for helpfulness and safety.',
      displayName: 'Llama 3.1 8B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-8b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      description: 'An update to Meta Llama 3 70B Instruct that includes an expanded 128K context length, multilinguality and improved reasoning capabilities. The Llama 3.1 offering of multilingual large language models (LLMs) is a collection of pretrained and instruction-tuned generative models in 8B, 70B and 405B sizes (text in/text out). The Llama 3.1 instruction-tuned text only models (8B, 70B, 405B) are optimized for multilingual dialogue use cases and outperform many of the available open source chat models on common industry benchmarks. Llama 3.1 is intended for commercial and research use in multiple languages. Instruction tuned text only models are intended for assistant-like chat, whereas pretrained models can be adapted for a variety of natural language generation tasks. The Llama 3.1 models also support the ability to leverage the outputs of its models to improve other models including synthetic data generation and distillation. Llama 3.1 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align with human preferences for helpfulness and safety.',
      displayName: 'Llama 3.1 70B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-70b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      description: 'Meta Llama 3.1 405B Instruct is the largest and most powerful of the Llama 3.1 Instruct models that is a highly advanced model for conversational inference and reasoning, synthetic data generation, and a base to do specialized continual pre-training or fine-tuning on a specific domain. The Llama 3.1 offering of multilingual large language models (LLMs) is a collection of pretrained and instruction-tuned generative models in 8B, 70B and 405B sizes (text in/text out). The Llama 3.1 instruction-tuned text only models (8B, 70B, 405B) are optimized for multilingual dialogue use cases and outperform many of the available open source chat models on common industry benchmarks. Llama 3.1 is intended for commercial and research use in multiple languages. Instruction tuned text only models are intended for assistant-like chat, whereas pretrained models can be adapted for a variety of natural language generation tasks. The Llama 3.1 models also support the ability to leverage the outputs of its models to improve other models including synthetic data generation and distillation. Llama 3.1 is an auto-regressive language model that uses an optimized transformer architecture. The tuned versions use supervised fine-tuning (SFT) and reinforcement learning with human feedback (RLHF) to align with human preferences for helpfulness and safety.',
      displayName: 'Llama 3.1 405B Instruct',
      enabled: true,
      functionCall: true,
      id: 'meta.llama3-1-405b-instruct-v1:0',
      tokens: 128_000,
    },
    {
      description: 'Meta Llama 3 is an accessible, open large language model (LLM) designed for developers, researchers, and businesses to build, experiment, and responsibly scale their generative AI ideas. Part of a foundational system, it serves as a bedrock for innovation in the global community. Ideal for limited computational power and resources, edge devices, and faster training times.',
      displayName: 'Llama 3 8B Instruct',
      id: 'meta.llama3-8b-instruct-v1:0',
      tokens: 8000,
    },
    {
      description: 'Meta Llama 3 is an accessible, open large language model (LLM) designed for developers, researchers, and businesses to build, experiment, and responsibly scale their generative AI ideas. Part of a foundational system, it serves as a bedrock for innovation in the global community. Ideal for content creation, conversational AI, language understanding, R&D, and Enterprise applications.',
      displayName: 'Llama 3 70B Instruct',
      id: 'meta.llama3-70b-instruct-v1:0',
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
  id: 'bedrock',
  name: 'Bedrock',
};

export default Bedrock;
