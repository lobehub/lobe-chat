import { BaseDataModel } from '@/types/meta';

export interface ChatTopic extends Omit<BaseDataModel, 'meta'> {
  favorite?: boolean;
  title: string;
}

export type ChatTopicMap = Record<string, ChatTopic>;
