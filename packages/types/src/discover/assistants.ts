import { FewShots } from '../llm';
import { MetaData } from '../meta';
import { LobeAgentSettings } from '../session';

export enum AssistantCategory {
  Academic = 'academic',
  All = 'all',
  Career = 'career',
  CopyWriting = 'copywriting',
  Design = 'design',
  Education = 'education',
  Emotions = 'emotions',
  Entertainment = 'entertainment',
  Games = 'games',
  General = 'general',
  Life = 'life',
  Marketing = 'marketing',
  Office = 'office',
  Programming = 'programming',
  Translation = 'translation',
}

export enum AssistantSorts {
  CreatedAt = 'createdAt',
  Identifier = 'identifier',
  KnowledgeCount = 'knowledgeCount',
  PluginCount = 'pluginCount',
  Title = 'title',
  TokenUsage = 'tokenUsage',
}

export enum AssistantNavKey {
  Capabilities = 'capabilities',
  Overview = 'overview',
  Related = 'related',
  SystemRole = 'systemRole',
}

export interface DiscoverAssistantItem extends Omit<LobeAgentSettings, 'meta'>, MetaData {
  author: string;
  category?: AssistantCategory;
  createdAt: string;
  homepage: string;
  identifier: string;
  knowledgeCount: number;
  pluginCount: number;
  tokenUsage: number;
}

export interface AssistantQueryParams {
  category?: string;
  locale?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: AssistantSorts;
}

export interface AssistantListResponse {
  currentPage: number;
  items: DiscoverAssistantItem[];
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DiscoverAssistantDetail extends DiscoverAssistantItem {
  examples?: FewShots;
  related: DiscoverAssistantItem[];
  summary?: string;
}
