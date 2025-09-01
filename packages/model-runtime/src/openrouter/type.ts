interface ModelPricing {
  completion: string;
  image: string;
  prompt: string;
  request: string;
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
  max_completion_tokens: number | null;
  pricing: ModelPricing;
  supported_parameters: string[];
  supports_reasoning?: boolean;
  supports_tool_parameters?: boolean;
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
