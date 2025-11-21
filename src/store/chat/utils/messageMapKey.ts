export const messageMapKey = (
  sessionId: string,
  topicId?: string | null,
  threadId?: string | null,
) => {
  if (threadId) return `${sessionId}_thread_${threadId}`;

  let topic = topicId;

  if (typeof topicId === 'undefined') topic = null;

  return `${sessionId}_${topic}`;
};
