
// Market API service for agent submission
export class MarketApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://localhost:8787';
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new agent
  async createAgent(agentData: {
    homepage?: string;
    identifier: string;
    isFeatured?: boolean;
    name: string;
    status?: 'published' | 'unpublished' | 'archived' | 'deprecated';
    visibility?: 'public' | 'private' | 'internal';
  }) {
    return this.makeRequest('/api/v1/agents/create', {
      body: JSON.stringify(agentData),
      method: 'POST',
    });
  }

  // Get agent detail by identifier
  async getAgentDetail(identifier: string) {
    return this.makeRequest(`/api/v1/agents/detail/${identifier}`);
  }

  // Create agent version
  async createAgentVersion(versionData: {
    a2aProtocolVersion?: string;
    avatar?: string;
    category?: string;
    changelog?: string;
    config?: Record<string, any>;
    defaultInputModes?: string[];
    defaultOutputModes?: string[];
    description?: string;
    documentationUrl?: string;
    extensions?: Record<string, any>[];
    hasPushNotifications?: boolean;
    hasStateTransitionHistory?: boolean;
    hasStreaming?: boolean;
    identifier: string;
    interfaces?: Record<string, any>[];
    name?: string;
    preferredTransport?: string;
    providerId?: number;
    securityRequirements?: Record<string, any>[];
    securitySchemes?: Record<string, any>;
    setAsCurrent?: boolean;
    summary?: string;
    supportsAuthenticatedExtendedCard?: boolean;
    tokenUsage?: number;
    url?: string;
  }) {
    return this.makeRequest('/api/v1/agents/version/create', {
      body: JSON.stringify(versionData),
      method: 'POST',
    });
  }
}

export const marketApiService = new MarketApiService();