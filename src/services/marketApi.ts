import { AgentItemDetail } from '@lobehub/market-sdk';

import { MARKET_ENDPOINTS } from '@/services/_url';

export class MarketApiService {
  private accessToken?: string;

  // eslint-disable-next-line no-undef
  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);

    if (init?.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    if (this.accessToken && !headers.has('authorization')) {
      headers.set('authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(endpoint, {
      ...init,
      credentials: init?.credentials ?? 'same-origin',
      headers,
    });

    if (!response.ok) {
      let message = 'Unknown error';

      try {
        const errorBody = await response.json();
        message = errorBody?.message ?? message;
      } catch {
        message = await response.text();
      }

      throw new Error(message || 'Market request failed');
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }
  // Create new agent
  async createAgent(agentData: {
    homepage?: string;
    identifier: string;
    isFeatured?: boolean;
    name: string;
    status?: 'published' | 'unpublished' | 'archived' | 'deprecated';
    tokenUsage?: number;
    visibility?: 'public' | 'private' | 'internal';
  }): Promise<AgentItemDetail> {
    return this.request(MARKET_ENDPOINTS.createAgent, {
      body: JSON.stringify(agentData),
      method: 'POST',
    });
  }

  // Get agent detail by identifier
  async getAgentDetail(identifier: string): Promise<AgentItemDetail> {
    return this.request(MARKET_ENDPOINTS.getAgentDetail(identifier), {
      method: 'GET',
    });
  }

  // Check if agent exists (returns true if exists, false if not)
  async checkAgentExists(identifier: string): Promise<boolean> {
    try {
      await this.getAgentDetail(identifier);
      return true;
    } catch {
      return false;
    }
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
  }): Promise<AgentItemDetail> {
    const { identifier, ...rest } = versionData;
    const targetIdentifier = identifier;
    if (!targetIdentifier) throw new Error('Identifier is required');

    return this.request(MARKET_ENDPOINTS.createAgentVersion, {
      body: JSON.stringify({
        identifier: targetIdentifier,
        ...rest,
      }),
      method: 'POST',
    });
  }
}

export const marketApiService = new MarketApiService();
