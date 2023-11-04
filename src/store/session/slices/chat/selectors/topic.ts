// 展示在聊天框中的消息
import { ChatTopic } from '@/types/topic';

import { SessionStore } from '../../../store';
import { sessionSelectors } from '../../session/selectors';
import { organizeChats } from './utils';

export const currentTopics = (s: SessionStore): ChatTopic[] => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return [];

  const topics = Object.values(session.topics || {});

  // 按时间倒序
  const favTopics = topics.filter((t) => t.favorite).sort((a, b) => b.updateAt - a.updateAt);
  const defaultTopics = topics.filter((t) => !t.favorite).sort((a, b) => b.updateAt - a.updateAt);

  return [...favTopics, ...defaultTopics];
};

export const currentTopicLength = (s: SessionStore): number => {
  return currentTopics(s).length;
};

export const getTopicMessages = (topicId: string) => (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return [];

  return organizeChats(session, { topicId });
};
