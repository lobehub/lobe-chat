import { INBOX_SESSION_ID } from '@/const/session';
import { trpcClient } from '@/services/_auth/trpc';
import { ITopicService } from '@/services/topic/type';

export class ServerService implements ITopicService {
  createTopic: ITopicService['createTopic'] = (params) =>
    trpcClient.topic.createTopic.mutate({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });

  batchCreateTopics: ITopicService['batchCreateTopics'] = (importTopics) =>
    trpcClient.topic.batchCreateTopics.mutate(importTopics);

  cloneTopic: ITopicService['cloneTopic'] = (id, newTitle) =>
    trpcClient.topic.cloneTopic.mutate({ id, newTitle });

  getTopics: ITopicService['getTopics'] = (params) =>
    trpcClient.topic.getTopics.query({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    }) as any;

  getAllTopics: ITopicService['getAllTopics'] = () => trpcClient.topic.getAllTopics.query() as any;

  countTopics: ITopicService['countTopics'] = async (params) => {
    return trpcClient.topic.countTopics.query(params);
  };

  rankTopics: ITopicService['rankTopics'] = async (limit) => {
    return trpcClient.topic.rankTopics.query(limit);
  };

  searchTopics: ITopicService['searchTopics'] = (keywords, sessionId) =>
    trpcClient.topic.searchTopics.query({
      keywords,
      sessionId: this.toDbSessionId(sessionId),
    }) as any;

  updateTopic: ITopicService['updateTopic'] = (id, data) =>
    trpcClient.topic.updateTopic.mutate({ id, value: data });

  removeTopic: ITopicService['removeTopic'] = (id) => trpcClient.topic.removeTopic.mutate({ id });

  removeTopics: ITopicService['removeTopics'] = (sessionId) =>
    trpcClient.topic.batchDeleteBySessionId.mutate({ id: this.toDbSessionId(sessionId) });

  batchRemoveTopics: ITopicService['batchRemoveTopics'] = (topics) =>
    trpcClient.topic.batchDelete.mutate({ ids: topics });

  removeAllTopic: ITopicService['removeAllTopic'] = () => trpcClient.topic.removeAllTopics.mutate();

  private toDbSessionId(sessionId?: string | null) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}
