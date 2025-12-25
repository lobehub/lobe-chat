import { ModelProviderCard } from '@/types/llm';

// ref :https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html
// ref :https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/models
// ref :https://us-west-2.console.aws.amazon.com/bedrock/home?region=us-west-2#/models
const Bedrock: ModelProviderCard = {
  chatModels: [],
  checkModel: 'anthropic.claude-instant-v1',
  description:
    'Bedrock 是亚马逊 AWS 提供的一项服务，专注于为企业提供先进的 AI 语言模型和视觉模型。其模型家族包括 Anthropic 的 Claude 系列、Meta 的 Llama 3.1 系列等，涵盖从轻量级到高性能的多种选择，支持文本生成、对话、图像处理等多种任务，适用于不同规模和需求的企业应用。',
  id: 'bedrock',
  modelsUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html',
  name: 'Bedrock',
  settings: { sdkType: 'bedrock' },
  url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html',
};

export default Bedrock;
