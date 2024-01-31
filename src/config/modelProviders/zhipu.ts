import { ModelProviderCard } from '@/types/llm';

const ZhiPuModelCard: ModelProviderCard = {
  chatModels: [
    {
      description: '最新的 GLM-4 、最大支持 128k 上下文、支持 Function Call 、Retreival',
      displayName: 'GLM-4',
      functionCall: true,
      id: 'glm-4',
      tokens: 128_000,
    },
    {
      description:
        '实现了视觉语言特征的深度融合，支持视觉问答、图像字幕、视觉定位、复杂目标检测等各类多模态理解任务',
      displayName: 'GLM-4 Vision',
      id: 'glm-4v',
      tokens: 128_000,
      vision: true,
    },
    {
      description: '最新的glm-3-turbo、最大支持 128k上下文、支持Function Call、Retreival',
      displayName: 'GLM-3 Turbo',
      functionCall: true,
      id: 'glm-3-turbo',
      tokens: 128_000,
    },
  ],
  id: 'zhipu',
};

export default ZhiPuModelCard;
