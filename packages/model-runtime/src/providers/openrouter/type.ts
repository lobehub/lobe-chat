interface ModelPricing {
  completion: string;
  image?: string;
  input_cache_read?: string;
  input_cache_write?: string;
  prompt: string;
  request?: string;
  web_search?: string;
  internal_reasoning?: string;
}

interface TopProvider {
  context_length: number;
  max_completion_tokens: number | null;
  is_moderated: boolean;
}

interface Architecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string;
  instruct_type: string | null;
}

export interface OpenRouterModelCard {
  id: string;
  canonical_slug: string;
  hugging_face_id?: string;
  name: string;
  created: number;
  description?: string;
  context_length: number;
  architecture: Architecture;
  pricing: ModelPricing;
  top_provider: TopProvider;
  per_request_limits?: any | null;
  supported_parameters: string[];
  default_parameters?: any | null;
}

interface OpenRouterOpenAIReasoning {
  effort: 'high' | 'medium' | 'low';
  exclude?: boolean;
}

interface OpenRouterAnthropicReasoning {
  exclude?: boolean;
  max_tokens: number;
}

interface OpenRouterCommonReasoning {
  exclude?: boolean;
}

export type OpenRouterReasoning =
  | OpenRouterOpenAIReasoning
  | OpenRouterAnthropicReasoning
  | OpenRouterCommonReasoning;
