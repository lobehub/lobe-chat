interface ModelPricing {
  completion: string;
  prompt: string;
}

interface ModelTopProvider {
  max_completion_tokens: number | null;
}

export interface CometAPIModelCard {
  context_length: number;
  created: number;
  description: string;
  id: string;
  name: string;
  pricing: ModelPricing;
  top_provider: ModelTopProvider;
}
