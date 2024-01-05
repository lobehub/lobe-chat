import { BaseDataModel } from '@/types/meta';

export interface ChatTopic extends Omit<BaseDataModel, 'meta'> {
  favorite?: boolean;
  sessionId?: string;
  title: string;
}

export type ChatTopicMap = Record<string, ChatTopic>;
