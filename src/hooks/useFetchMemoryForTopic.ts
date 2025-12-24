import { useUserMemoryStore } from '@/store/userMemory';

export const useFetchTopicMemories = (topicId?: string) => {
  const useFetchMemoriesForTopic = useUserMemoryStore((s) => s.useFetchMemoriesForTopic);

  useFetchMemoriesForTopic(topicId);
};
