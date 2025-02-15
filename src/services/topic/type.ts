/* eslint-disable typescript-sort-keys/interface */
import { BatchTaskResult } from '@/types/service';
import { ChatTopic, TopicRankItem } from '@/types/topic';

export interface CreateTopicParams {
  favorite?: boolean;
  messages?: string[];
  sessionId?: string | null;
  title: string;
}

export interface QueryTopicParams {
  current?: number;
  pageSize?: number;
  sessionId: string;
}

export interface ITopicService {
  createTopic(params: CreateTopicParams): Promise<string>;
  batchCreateTopics(importTopics: ChatTopic[]): Promise<BatchTaskResult>;
  cloneTopic(id: string, newTitle?: string): Promise<string>;

  getTopics(params: QueryTopicParams): Promise<ChatTopic[]>;
  getAllTopics(): Promise<ChatTopic[]>;
  countTopics(params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number>;
  rankTopics(limit?: number): Promise<TopicRankItem[]>;
  searchTopics(keyword: string, sessionId?: string): Promise<ChatTopic[]>;

  updateTopic(id: string, data: Partial<ChatTopic>): Promise<any>;

  removeTopic(id: string): Promise<any>;
  removeTopics(sessionId: string): Promise<any>;
  batchRemoveTopics(topics: string[]): Promise<any>;
  removeAllTopic(): Promise<any>;
}
