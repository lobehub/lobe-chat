import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useFetchThreads = (activeTopicId?: string) => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  const [useFetchThreads] = useChatStore((s) => [s.useFetchThreads]);

  useFetchThreads(isDBInited, activeTopicId);
};
