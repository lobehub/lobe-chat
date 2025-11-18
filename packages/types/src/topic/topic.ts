import type { BaseDataModel } from '../meta';

// Type definitions
export type TimeGroupId =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | `${number}-${string}`
  | `${number}`;

/* eslint-disable typescript-sort-keys/string-enum */
export enum TopicDisplayMode {
  ByTime = 'byTime',
  Flat = 'flat',
  // AscMessages = 'ascMessages',
  // DescMessages = 'descMessages',
}
/* eslint-enable */

export interface GroupedTopic {
  children: ChatTopic[];
  id: string;
  title?: string;
}

export interface ChatTopicMetadata {
  model?: string;
  provider?: string;
}

export interface ChatTopicSummary {
  content: string;
  model: string;
  provider: string;
}

export interface ChatTopic extends Omit<BaseDataModel, 'meta'> {
  favorite?: boolean;
  historySummary?: string;
  metadata?: ChatTopicMetadata;
  sessionId?: string;
  title: string;
}

export type ChatTopicMap = Record<string, ChatTopic>;

export interface TopicRankItem {
  count: number;
  id: string;
  sessionId: string | null;
  title: string | null;
}

export interface CreateTopicParams {
  favorite?: boolean;
  groupId?: string | null;
  messages?: string[];
  sessionId?: string | null;
  title: string;
}

export interface QueryTopicParams {
  containerId?: string | null; // sessionId or groupId
  current?: number;
  pageSize?: number;
}
