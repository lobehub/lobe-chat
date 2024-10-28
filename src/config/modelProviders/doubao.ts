import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1330310
const Doubao: ModelProviderCard = {
  chatModels: [
    {
      deploymentName: 'Doubao-lite-4k',
      description: 
        '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
      displayName: 'Doubao Lite 4k',
      enabled: true,
      id: 'Doubao-lite-4k',
      tokens: 4096,
    },
    {
      deploymentName: 'Doubao-lite-32k',
      description: 
        '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
      displayName: 'Doubao Lite 32k',
      enabled: true,
      id: 'Doubao-lite-32k',
      tokens: 32_768,
    },
    {
      deploymentName: 'Doubao-lite-128k',
      description: 
        '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 128k 上下文窗口的推理和精调。',
      displayName: 'Doubao Lite 128k',
      enabled: true,
      id: 'Doubao-lite-128k',
      tokens: 128_000,
    },
    {
      deploymentName: 'Doubao-pro-4k',
      description: 
        '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 4k 上下文窗口的推理和精调。',
      displayName: 'Doubao Pro 4k',
      enabled: true,
      id: 'Doubao-pro-4k',
      tokens: 4096,
    },
    {
      deploymentName: 'Doubao-pro-32k',
      description: 
        '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 32k 上下文窗口的推理和精调。',
      displayName: 'Doubao Pro 32k',
      enabled: true,
      id: 'Doubao-pro-32k',
      tokens: 32_768,
    },
    {
      deploymentName: 'Doubao-pro-128k',
      description: 
        '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 128k 上下文窗口的推理和精调。',
      displayName: 'Doubao Pro 128k',
      enabled: true,
      id: 'Doubao-pro-128k',
      tokens: 128_000,
    },
  ],
  description: '字节跳动推出的自研大模型。通过字节跳动内部50+业务场景实践验证，每日万亿级tokens大使用量持续打磨，提供多种模态能力，以优质模型效果为企业打造丰富的业务体验。',
  disableBrowserRequest: true, // CORS error
  id: 'doubao',
  modelsUrl: 'https://www.volcengine.com/product/doubao',
  name: '豆包',
  url: 'https://www.volcengine.com/product/doubao',
};

export default Doubao;
