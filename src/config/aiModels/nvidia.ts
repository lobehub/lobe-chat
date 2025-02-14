import { AIChatModelCard } from '@/types/aiModel';

const nvidiaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    "contextWindowTokens": 128_000,
    "description": "DeepSeek 推出的推理模型。在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。",
    "displayName": "DeepSeek R1",
    "enabled": true,
    "id": "deepseek-ai/deepseek-r1",
    "type": "chat"
  }
]

export const allModels = [...nvidiaChatModels];

export default allModels;
