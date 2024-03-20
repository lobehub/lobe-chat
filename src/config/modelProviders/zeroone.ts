import { ModelProviderCard } from '@/types/llm';

const ZeroOne: ModelProviderCard = {
  chatModels: [
    {
      description: '支持聊天、问答、对话、写作、翻译等功能。',
      displayName: 'YI 34B Chat',
      id: 'yi-34b-chat-0205',
      tokens: 4000,
    },
    {
      description: '支持通用图片问答、图表理解、OCR、视觉推理，能处理高分辨率（1024*1024）的图像，能在复杂视觉任务上提供优秀性能，同时支持多种语言。',
      displayName: 'YI Vision Plus',
      id: 'yi-vl-plus',
      tokens: 4000,
      vision: true,
    },
    {
      description: '增强了问答对话交互和深度内容创作能力。文档问答和构建知识库小能手。',
      displayName: 'YI 34B Chat 200k',
      id: 'yi-34b-chat-200k',
      tokens: 200_000,
    },
  ],
  id: 'zeroone',
};

export default ZeroOne;
