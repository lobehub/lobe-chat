/* eslint-disable typescript-sort-keys/interface */
import { ChatTopic } from '@/types/topic';

export interface CreateTopicParams {
  favorite?: boolean;
  messages?: string[];
  sessionId: string;
  title: string;
}

export interface QueryTopicParams {
  current?: number;
  pageSize?: number;
  sessionId: string;
}

export interface ITopicService {
  createTopic(params: CreateTopicParams): Promise<string>;
  batchCreateTopics(importTopics: ChatTopic[]): Promise<any>;
  cloneTopic(id: string, newTitle?: string): Promise<string>;

  getTopics(params: QueryTopicParams): Promise<ChatTopic[]>;
  getAllTopics(): Promise<ChatTopic[]>;
  searchTopics(keyword: string, sessionId?: string): Promise<ChatTopic[]>;

  updateTopic(id: string, data: Partial<ChatTopic>): Promise<any>;

  removeTopic(id: string): Promise<any>;
  removeTopics(sessionId: string): Promise<any>;
  batchRemoveTopics(topics: string[]): Promise<any>;
  removeAllTopic(): Promise<any>;
}
