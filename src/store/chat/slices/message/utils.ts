export const messageMapKey = (sessionId: string, topicId?: string | null) => {
  let topic = topicId;

  if (typeof topicId === 'undefined') topic = null;

  return `${sessionId}_${topic}`;
};
