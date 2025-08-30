import { AIChatModelCard } from '../types/aiModel';

// https://developer.qiniu.com/aitokenapi

const qiniuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '推理速度大幅提升，位居开源模型之首，媲美顶尖闭源模型。采用负载均衡辅助策略和多标记预测训练，性能显著增强。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek R1 是 DeepSeek 团队发布的最新开源模型，具备非常强悍的推理性能，尤其在数学、编程和推理任务上达到了与 OpenAI 的 o1 模型相当的水平。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat',
  },
];

export const allModels = [...qiniuChatModels];

export default allModels;
