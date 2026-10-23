import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';

/** Every message of `topicId` containing `keyword`, read from the server's full history. */
export const useTopicSearch = (topicId: string | undefined, keyword: string) => {
  const query = keyword.trim();

  return useClientDataSWR(
    topicId && query ? ['topicMessageSearch', topicId, query] : null,
    ([, id, text]: [string, string, string]) =>
      messageService.searchInTopic({ keyword: text, topicId: id }),
    { keepPreviousData: true, revalidateOnFocus: false },
  );
};
