import type { AIChatModelCard } from '../types/aiModel';

// Token Market's model catalog is fetched dynamically from the unified API.
const tokensmarketChatModels: AIChatModelCard[] = [];

export const allModels = [...tokensmarketChatModels];

export default allModels;
