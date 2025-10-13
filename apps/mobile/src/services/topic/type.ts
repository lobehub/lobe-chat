import { ChatTopic, TopicRankItem } from '@lobechat/types';
import { BatchTaskResult } from '@lobechat/types/@/service';

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
  batchCreateTopics(importTopics: ChatTopic[]): Promise<BatchTaskResult>;
  batchRemoveTopics(topics: string[]): Promise<any>;
  cloneTopic(id: string, newTitle?: string): Promise<string>;

  countTopics(params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number>;
  createTopic(params: CreateTopicParams): Promise<string>;
  getAllTopics(): Promise<ChatTopic[]>;
  getTopics(params: QueryTopicParams): Promise<ChatTopic[]>;
  rankTopics(limit?: number): Promise<TopicRankItem[]>;

  removeAllTopic(): Promise<any>;

  removeTopic(id: string): Promise<any>;
  removeTopics(sessionId: string): Promise<any>;
  searchTopics(keyword: string, sessionId?: string): Promise<ChatTopic[]>;
  updateTopic(id: string, data: Partial<ChatTopic>): Promise<any>;
}
