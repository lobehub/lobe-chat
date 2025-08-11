import { ModelProviderCard } from '@/types/llm';

// ref :https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
// ref :https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/models
// ref :https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/models
// ref :https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html
const Bedrock: ModelProviderCard = {
  chatModels: [
    // Amazon Nova Models (Cross-Region Inference Profiles)
    {
      contextWindowTokens: 300_000,
      description:
        'Amazon Nova Premier 是 Amazon 最先进的多模态基础模型，具有最高的智能水平，能够处理复杂的推理、数学、编程和多语言任务。',
      displayName: 'Nova Premier (US)',
      enabled: true,
      functionCall: true,
      id: 'us.amazon.nova-premier-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 8,
        output: 32,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 300_000,
      description:
        'Amazon Nova Pro 在性能和成本之间取得平衡，适合各种任务，包括内容生成、对话AI、文档处理和代码生成。',
      displayName: 'Nova Pro (US)',
      enabled: true,
      functionCall: true,
      id: 'us.amazon.nova-pro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.8,
        output: 3.2,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 300_000,
      description:
        'Amazon Nova Lite 是一个快速、成本效益高的多模态模型，适合简单的任务和高频使用场景。',
      displayName: 'Nova Lite (US)',
      enabled: true,
      functionCall: true,
      id: 'us.amazon.nova-lite-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.06,
        output: 0.24,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'Amazon Nova Micro 是一个仅文本的模型，专为速度和成本效率而设计，适合简单的文本处理任务。',
      displayName: 'Nova Micro (US)',
      enabled: true,
      functionCall: true,
      id: 'us.amazon.nova-micro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.035,
        output: 0.14,
      },
      releasedAt: '2024-12-03',
    },
    // EU Region Nova Models
    {
      contextWindowTokens: 300_000,
      description: 'Amazon Nova Pro 欧盟区域版本，在性能和成本之间取得平衡。',
      displayName: 'Nova Pro (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.amazon.nova-pro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.8,
        output: 3.2,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 300_000,
      description: 'Amazon Nova Lite 欧盟区域版本，快速且成本效益高。',
      displayName: 'Nova Lite (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.amazon.nova-lite-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.06,
        output: 0.24,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description: 'Amazon Nova Micro 欧盟区域版本，专为速度和成本效率而设计。',
      displayName: 'Nova Micro (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.amazon.nova-micro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.035,
        output: 0.14,
      },
      releasedAt: '2024-12-03',
    },
    // APAC Region Nova Models
    {
      contextWindowTokens: 300_000,
      description: 'Amazon Nova Pro 亚太区域版本，在性能和成本之间取得平衡。',
      displayName: 'Nova Pro (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.amazon.nova-pro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.8,
        output: 3.2,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 300_000,
      description: 'Amazon Nova Lite 亚太区域版本，快速且成本效益高。',
      displayName: 'Nova Lite (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.amazon.nova-lite-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.06,
        output: 0.24,
      },
      releasedAt: '2024-12-03',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description: 'Amazon Nova Micro 亚太区域版本，专为速度和成本效率而设计。',
      displayName: 'Nova Micro (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.amazon.nova-micro-v1:0',
      maxOutput: 5000,
      pricing: {
        input: 0.035,
        output: 0.14,
      },
      releasedAt: '2024-12-03',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.7 sonnet 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.7 Sonnet 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
      displayName: 'Claude 3.7 Sonnet (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
      maxOutput: 8192,
      releasedAt: '2025-02-24',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.7 Sonnet 欧盟区域版本，是 Anthropic 最快的下一代模型。',
      displayName: 'Claude 3.7 Sonnet (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.anthropic.claude-3-7-sonnet-20250219-v1:0',
      maxOutput: 64_000,
      pricing: {
        cachedInput: 0.1,
        input: 1,
        output: 5,
        writeCacheInput: 1.25,
      },
      releasedAt: '2025-02-24',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.7 Sonnet 亚太区域版本，是 Anthropic 最快的下一代模型。',
      displayName: 'Claude 3.7 Sonnet (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.1,
        input: 1,
        output: 5,
        writeCacheInput: 1.25,
      },
      releasedAt: '2025-11-05',
      vision: true,
    },

    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.5 Sonnet 提升了行业标准，性能超过竞争对手模型和 Claude 3 Opus，在广泛的评估中表现出色，同时具有我们中等层级模型的速度和成本。',
      displayName: 'Claude 3.5 Sonnet v2 (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.5 Sonnet 亚太区域版本，提升了行业标准。',
      displayName: 'Claude 3.5 Sonnet v2 (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },

    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.5 Sonnet 0620 美国区域版本，提升了行业标准。',
      displayName: 'Claude 3.5 Sonnet 0620 (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.5 Sonnet 0620 亚太区域版本，提升了行业标准。',
      displayName: 'Claude 3.5 Sonnet 0620 (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },

    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Haiku 美国区域版本，是 Anthropic 最快、最紧凑的模型。',
      displayName: 'Claude 3 Haiku (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-haiku-20240307-v1:0',
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Haiku 欧盟区域版本，是 Anthropic 最快、最紧凑的模型。',
      displayName: 'Claude 3 Haiku (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.anthropic.claude-3-haiku-20240307-v1:0',
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Haiku 亚太区域版本，是 Anthropic 最快、最紧凑的模型。',
      displayName: 'Claude 3 Haiku (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-3-haiku-20240307-v1:0',
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      vision: true,
    },

    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Sonnet 美国区域版本，在智能和速度之间达到了理想的平衡。',
      displayName: 'Claude 3 Sonnet (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-sonnet-20240229-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Sonnet 欧盟区域版本，在智能和速度之间达到了理想的平衡。',
      displayName: 'Claude 3 Sonnet (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.anthropic.claude-3-sonnet-20240229-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Sonnet 亚太区域版本，在智能和速度之间达到了理想的平衡。',
      displayName: 'Claude 3 Sonnet (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-3-sonnet-20240229-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },

    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Opus 美国区域版本，是 Anthropic 最强大的 AI 模型。',
      displayName: 'Claude 3 Opus (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-3-opus-20240229-v1:0',
      pricing: {
        input: 15,
        output: 75,
      },
      vision: true,
    },
    // Claude 4 Models (Cross-Region)
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 4 Opus 是 Anthropic 最新一代的旗舰模型，具有前所未有的智能水平和推理能力。',
      displayName: 'Claude 4 Opus (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-opus-4-20250514-v1:0',
      pricing: {
        input: 60,
        output: 180,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 4 Sonnet 是 Anthropic 新一代的平衡型模型，在智能和效率之间取得最佳平衡。',
      displayName: 'Claude 4 Sonnet (US)',
      enabled: true,
      functionCall: true,
      id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      pricing: {
        input: 15,
        output: 75,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 4 Sonnet 欧盟区域版本，是 Anthropic 新一代的平衡型模型。',
      displayName: 'Claude 4 Sonnet (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.anthropic.claude-sonnet-4-20250514-v1:0',
      pricing: {
        input: 15,
        output: 75,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 4 Sonnet 亚太区域版本，是 Anthropic 新一代的平衡型模型。',
      displayName: 'Claude 4 Sonnet (APAC)',
      enabled: true,
      functionCall: true,
      id: 'apac.anthropic.claude-sonnet-4-20250514-v1:0',
      pricing: {
        input: 15,
        output: 75,
      },
      vision: true,
    },

    // DeepSeek Models (Cross-Region)
    {
      contextWindowTokens: 128_000,
      description: 'DeepSeek R1 是一个具有强大推理能力的模型，专门针对复杂问题解决进行优化。',
      displayName: 'DeepSeek R1 (US)',
      enabled: true,
      functionCall: true,
      id: 'us.deepseek.r1-v1:0',
      pricing: {
        input: 0.14,
        output: 2.19,
      },
    },
    // Meta Llama Models (Cross-Region)

    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.1 8B Instruct 美国区域版本。',
      displayName: 'Llama 3.1 8B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-1-8b-instruct-v1:0',
      pricing: {
        input: 0.22,
        output: 0.22,
      },
    },

    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.1 70B Instruct 美国区域版本。',
      displayName: 'Llama 3.1 70B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-1-70b-instruct-v1:0',
      pricing: {
        input: 0.99,
        output: 0.99,
      },
    },

    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.1 405B Instruct 美国区域版本，是最大、最强大的模型。',
      displayName: 'Llama 3.1 405B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-1-405b-instruct-v1:0',
      pricing: {
        input: 5.32,
        output: 16,
      },
    },
    // Llama 3.2 Models (Cross-Region)
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.2 11B Instruct 是一个中等规模的高效模型，适合各种对话和推理任务。',
      displayName: 'Llama 3.2 11B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-2-11b-instruct-v1:0',
      pricing: {
        input: 0.35,
        output: 0.35,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.2 1B Instruct 是一个轻量级模型，专为资源受限环境设计。',
      displayName: 'Llama 3.2 1B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-2-1b-instruct-v1:0',
      pricing: {
        input: 0.055,
        output: 0.055,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.2 1B Instruct 欧盟区域版本，是一个轻量级模型。',
      displayName: 'Llama 3.2 1B Instruct (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.meta.llama3-2-1b-instruct-v1:0',
      pricing: {
        input: 0.055,
        output: 0.055,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        'Meta Llama 3.2 3B Instruct 是一个小型但功能强大的模型，在效率和性能之间取得平衡。',
      displayName: 'Llama 3.2 3B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-2-3b-instruct-v1:0',
      pricing: {
        input: 0.075,
        output: 0.075,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.2 3B Instruct 欧盟区域版本，在效率和性能之间取得平衡。',
      displayName: 'Llama 3.2 3B Instruct (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.meta.llama3-2-3b-instruct-v1:0',
      pricing: {
        input: 0.075,
        output: 0.075,
      },
    },
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.2 90B Instruct 是一个大型高性能模型，适合复杂的推理和生成任务。',
      displayName: 'Llama 3.2 90B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-2-90b-instruct-v1:0',
      pricing: {
        input: 2,
        output: 2,
      },
    },
    // Llama 3.3 Models (Cross-Region)
    {
      contextWindowTokens: 128_000,
      description: 'Meta Llama 3.3 70B Instruct 是最新一代的高性能模型，具有改进的推理和对话能力。',
      displayName: 'Llama 3.3 70B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama3-3-70b-instruct-v1:0',
      pricing: {
        input: 0.99,
        output: 0.99,
      },
    },
    // Llama 4 Models (Cross-Region)
    {
      contextWindowTokens: 128_000,
      description:
        'Meta Llama 4 Maverick 17B Instruct 是下一代模型的早期版本，具有创新的架构和能力。',
      displayName: 'Llama 4 Maverick 17B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama4-maverick-17b-instruct-v1:0',
      pricing: {
        input: 0.5,
        output: 0.5,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        'Meta Llama 4 Scout 17B Instruct 是下一代模型的探索版本，专注于高效的推理和生成。',
      displayName: 'Llama 4 Scout 17B Instruct (US)',
      enabled: true,
      functionCall: true,
      id: 'us.meta.llama4-scout-17b-instruct-v1:0',
      pricing: {
        input: 0.5,
        output: 0.5,
      },
    },

    // Mistral Models (Cross-Region)
    {
      contextWindowTokens: 128_000,
      description:
        'Mistral Pixtral Large 是一个多模态模型，能够处理文本和图像输入，具有强大的视觉理解能力。',
      displayName: 'Pixtral Large 2502 (US)',
      enabled: true,
      functionCall: true,
      id: 'us.mistral.pixtral-large-2502-v1:0',
      pricing: {
        input: 3,
        output: 9,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description: 'Mistral Pixtral Large 欧盟区域版本，是一个多模态模型。',
      displayName: 'Pixtral Large 2502 (EU)',
      enabled: true,
      functionCall: true,
      id: 'eu.mistral.pixtral-large-2502-v1:0',
      pricing: {
        input: 3,
        output: 9,
      },
      vision: true,
    },
    // US GovCloud Models
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3.5 Sonnet 美国政府专区版本，提升了行业标准。',
      displayName: 'Claude 3.5 Sonnet (US-Gov)',
      enabled: true,
      functionCall: true,
      id: 'us-gov.anthropic.claude-3-5-sonnet-20240620-v1:0',
      pricing: {
        input: 3,
        output: 15,
      },
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description: 'Claude 3 Haiku 美国政府专区版本，是 Anthropic 最快、最紧凑的模型。',
      displayName: 'Claude 3 Haiku (US-Gov)',
      enabled: true,
      functionCall: true,
      id: 'us-gov.anthropic.claude-3-haiku-20240307-v1:0',
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      vision: true,
    },
  ],
  checkModel: 'us.amazon.nova-lite-v1:0',
  description:
    'Bedrock 是亚马逊 AWS 提供的一项服务，专注于为企业提供先进的 AI 语言模型和视觉模型。其模型家族包括 Anthropic 的 Claude 系列、Meta 的 Llama 3.1 系列等，涵盖从轻量级到高性能的多种选择，支持文本生成、对话、图像处理等多种任务，适用于不同规模和需求的企业应用。支持跨区域推理配置文件，提供更好的性能和可用性。',
  id: 'bedrock',
  modelsUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html',
  name: 'Bedrock',
  settings: { sdkType: 'bedrock' },
  url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html',
};

export default Bedrock;
