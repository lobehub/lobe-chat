import { V1Config } from './v1';

export interface V2ConfigState {
  messages: V2Message[];
  sessions: V2Session[];
  topics: V2Topic[];
}

export interface V2Session {
  config: V1Config;
  createdAt: number;
  group: 'default' | 'pinned';
  id: string;
  meta: Meta;
  type: string;
  updatedAt: number;
}

export interface Meta {
  avatar?: string;
  backgroundColor?: string;
  description?: string;
  tags?: string[];
  title?: string;
}

export interface V2Topic {
  createdAt: number;
  id: string;
  sessionId: string;
  title: string;
  updatedAt: number;
}

export interface V2Message {
  content: string;
  createdAt: number;
  fromModel?: string;
  id: string;
  meta: Meta;
  parentId?: string;
  plugin?: {
    apiName: string;
    arguments: string;
    identifier: string;
    type: 'default';
  };
  role: string;
  sessionId: string;
  topicId: string;
  updatedAt: number;
}
