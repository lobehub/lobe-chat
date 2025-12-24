import type { AIChatModelCard, AIImageModelCard } from 'model-bank';

const lobehubChatModels: AIChatModelCard[] = [];

const lobehubImageModels: AIImageModelCard[] = [];

export const allModels = [...lobehubChatModels, ...lobehubImageModels];

export default allModels;
