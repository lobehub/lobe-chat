interface ModelPricing {
  completion: string;
  image: string;
  prompt: string;
  request: string;
}

interface ModelArchitecture {
  instruct_type: string | null;
  modality: string;
  tokenizer: string;
}

interface ModelTopProvider {
  is_moderated: boolean;
  max_completion_tokens: number | null;
}

export interface OpenRouterModelCard {
  architecture: ModelArchitecture;
  context_length: number;
  created: number;
  description: string;
  id: string;
  name: string;
  per_request_limits: any | null;
  pricing: ModelPricing;
  top_provider: ModelTopProvider;
}

interface OpenRouterModelEndpoint {
  supports_reasoning?: boolean;
  supports_tool_parameters?: boolean;
}

export interface OpenRouterModelExtraInfo {
  endpoint?: OpenRouterModelEndpoint;
  slug: string;
}
