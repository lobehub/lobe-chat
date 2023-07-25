// 展示在聊天框中的消息
import { SessionStore, sessionSelectors } from '@/store/session';
import { ChatTopic } from '@/types/topic';

export const currentTopics = (s: SessionStore): ChatTopic[] => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return [];

  const topics = Object.values(session.topics || {});

  // 按时间倒序
  const favTopics = topics.filter((t) => t.favorite).sort((a, b) => b.updateAt - a.updateAt);
  const defaultTopics = topics.filter((t) => !t.favorite).sort((a, b) => b.updateAt - a.updateAt);

  return [...favTopics, ...defaultTopics];
};
