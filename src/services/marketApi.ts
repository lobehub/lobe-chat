// Market API service for agent submission
import { MarketSDK } from '@lobehub/market-sdk';

export class MarketApiService {
  market: MarketSDK;

  constructor() {
    this.market = new MarketSDK({
      baseURL: process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://localhost:8787',
    });
  }

  setAccessToken(token: string) {
    this.market = new MarketSDK({
      accessToken: token,
      baseURL: process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://localhost:8787',
    });
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
  }) {
    return this.market.agents.createAgent(agentData);
  }

  // Get agent detail by identifier
  async getAgentDetail(identifier: string) {
    return this.market.agents.getAgentDetail(identifier);
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
  }) {
    return this.market.agents.createAgentVersion(versionData);
  }
}

export const marketApiService = new MarketApiService();
