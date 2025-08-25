interface ModelPricing {
  completion: string;
  image: string;
  prompt: string;
  request: string;
}

interface ModelEndpoint {
  max_completion_tokens: number | null;
  supported_parameters: string[];
}

export interface OpenRouterModelCard {
  context_length: number;
  created: number;
  description?: string;
  endpoint: ModelEndpoint;
  input_modalities?: string[];
  name?: string;
  output_modalities?: string[];
  per_request_limits?: any | null;
  pricing: ModelPricing;
  short_name?: string;
  slug: string;
}

interface OpenRouterModelEndpoint {
  supports_reasoning?: boolean;
  supports_tool_parameters?: boolean;
}

export interface OpenRouterModelExtraInfo {
  endpoint?: OpenRouterModelEndpoint;
  slug: string;
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
