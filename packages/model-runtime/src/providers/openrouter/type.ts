interface ModelPricing {
  completion: string;
  image?: string;
  input_cache_read?: string;
  input_cache_write?: string;
  prompt: string;
  request?: string;
}

export interface OpenRouterModelCard {
  context_length: number;
  created_at: number;
  description?: string;
  endpoint: OpenRouterModelEndpoint;
  input_modalities?: string[];
  name?: string;
  output_modalities?: string[];
  per_request_limits?: any | null;
  short_name?: string;
  slug: string;
}

interface OpenRouterModelEndpoint {
  context_length?: number;
  max_completion_tokens: number | null;
  model?: {
    description?: string;
    input_modalities?: string[];
    name?: string;
    short_name?: string;
    slug: string;
  };
  model_variant_slug?: string;
  pricing: ModelPricing;
  supported_parameters: string[];
  supports_reasoning?: boolean;
  supports_tool_parameters?: boolean;
  variant?: 'free' | 'standard' | 'unknown';
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
