import { ModelProviderCard } from '@/types/llm';

// ref: https://docs.mistral.ai/getting-started/models/
// ref: https://docs.mistral.ai/capabilities/function_calling/
const Mistral: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Mistral 7B是一款紧凑但高性能的模型，擅长批量处理和简单任务，如分类和文本生成，具有良好的推理能力。',
      displayName: 'Mistral 7B',
      enabled: true,
      id: 'open-mistral-7b',
      tokens: 32_768,
    },
    {
      description:
        'Mixtral 8x7B是一个稀疏专家模型，利用多个参数提高推理速度，适合处理多语言和代码生成任务。',
      displayName: 'Mixtral 8x7B',
      enabled: true,
      id: 'open-mixtral-8x7b',
      tokens: 32_768,
    },
    {
      description:
        'Mixtral 8x22B是一个更大的专家模型，专注于复杂任务，提供出色的推理能力和更高的吞吐量。',
      displayName: 'Mixtral 8x22B',
      functionCall: true,
      id: 'open-mixtral-8x22b',
      tokens: 65_536,
    },
    {
      description:
        'Mistral Nemo是一个与Nvidia合作开发的12B模型，提供出色的推理和编码性能，易于集成和替换。',
      displayName: 'Mistral Nemo',
      enabled: true,
      functionCall: true,
      id: 'open-mistral-nemo',
      tokens: 128_000,
    },
    {
      description:
        'Mistral Large是旗舰大模型，擅长多语言任务、复杂推理和代码生成，是高端应用的理想选择。',
      displayName: 'Mistral Large',
      enabled: true,
      functionCall: true,
      id: 'mistral-large-latest',
      tokens: 128_000,
    },
    {
      description: 'Codestral是专注于代码生成的尖端生成模型，优化了中间填充和代码补全任务。',
      displayName: 'Codestral',
      enabled: true,
      id: 'codestral-latest',
      tokens: 32_768,
    },
    {
      description:
        'Codestral Mamba是专注于代码生成的Mamba 2语言模型，为先进的代码和推理任务提供强力支持。',
      displayName: 'Codestral Mamba',
      enabled: true,
      id: 'open-codestral-mamba',
      tokens: 256_000,
    },
  ],
  checkModel: 'open-mistral-7b',
  description:
    'Mistral 提供先进的通用、专业和研究型模型，广泛应用于复杂推理、多语言任务、代码生成等领域，通过功能调用接口，用户可以集成自定义功能，实现特定应用。',
  id: 'mistral',
  modelsUrl: 'https://docs.mistral.ai/getting-started/models',
  name: 'Mistral',
  url: 'https://mistral.ai',
};

export default Mistral;
