import { AIChatModelCard } from '../types/aiModel';

// NewAPI Router Provider - 聚合多个 AI 服务
// 模型通过动态获取，不预定义具体模型
const newapiChatModels: AIChatModelCard[] = [
  // NewAPI 作为路由提供商，模型列表通过 API 动态获取
];

export const allModels = [...newapiChatModels];

export default allModels;
