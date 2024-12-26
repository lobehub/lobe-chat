import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { LobeChatPluginMeta, Meta } from '@lobehub/chat-plugin-sdk/lib/types/market';

import { Locales } from '@/locales/resources';
import { ChatModelCard, ModelProviderCard } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { PageProps } from '@/types/next';
import { LobeAgentSettings } from '@/types/session';

export type DiscoverPageProps<T = string> = PageProps<{ slug: T }, { hl?: Locales }>;

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

export enum PluginCategory {
  All = 'all',
  GamingEntertainment = 'gaming-entertainment',
  LifeStyle = 'lifestyle',
  MediaGenerate = 'media-generate',
  ScienceEducation = 'science-education',
  Social = 'social',
  StocksFinance = 'stocks-finance',
  Tools = 'tools',
  WebSearch = 'web-search',
}

export enum DiscoverTab {
  Assistants = 'assistants',
  Home = 'home',
  Models = 'models',
  Plugins = 'plugins',
  Providers = 'providers',
}

// TODO 可能需要修改
export interface ExampleTopic {
  description: string;
  id: string;
  title: string;
}

// TODO 服务端接口待补充
export interface DiscoverAssistantItem extends LobeAgentSettings {
  author: string;
  createdAt: string;
  examples?: ExampleTopic[];
  homepage: string;
  identifier: string;
  meta: MetaData & {
    category?: AssistantCategory;
  };
  schemaVersion: 1;
  socialData: {
    conversations: number;
    likes: number;
    users: number;
  };
  suggestions: Omit<DiscoverAssistantItem, 'suggestions' | 'socialData' | 'config'>[];
}

export interface DiscoverModelItem {
  createdAt: string;
  identifier: string;
  meta: Omit<ChatModelCard, 'displayName' | 'deploymentName'> & {
    category?: string;
    title: string;
  };
  providers?: string[];
  socialData: {
    conversations: number;
    likes: number;
    tokens: number;
  };
  suggestions: Omit<DiscoverModelItem, 'suggestions' | 'socialData' | 'providers'>[];
}

export interface DiscoverProviderItem {
  createdAt: string;
  identifier: string;
  meta: Omit<ModelProviderCard, 'chatModels' | 'name'> & {
    description?: string;
    title: string;
  };
  models: string[];
  socialData: {
    conversations: number;
    likes: number;
    users: number;
  };
  suggestions: Omit<DiscoverProviderItem, 'suggestions' | 'socialData'>[];
}

// TODO 服务端接口待补充
export type DiscoverPlugintem = LobeChatPluginMeta & {
  manifest: LobeChatPluginManifest;
  meta: Meta & {
    category?: PluginCategory;
  };
  socialData: {
    called: number;
    executionTime: number;
    likes: number;
    relatedAssistants: number;
    successRate: number;
    users: number;
  };
  suggestions: Omit<DiscoverPlugintem, 'suggestions' | 'socialData' | 'manifest'>[];
};

export enum SortBy {
  MostLiked = 'liked',
  MostUsed = 'used',
  Newest = 'newest',
  Oldest = 'oldest',
  Recommended = 'recommended',
}

export enum TimePeriod {
  All = 'all',
  Day = 'day',
  Month = 'month',
  Week = 'week',
  Year = 'year',
}

export enum AuthorRange {
  Everyone = 'everyone',
  Followed = 'followed',
}

export interface FilterBy {
  author?: AuthorRange;
  content?: number;
  fc?: boolean;
  knowledge?: boolean;
  plugin?: boolean;
  price?: number;
  time?: TimePeriod;
  token?: number;
  vision?: boolean;
}
