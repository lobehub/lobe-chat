import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { ITopicService } from '@/services/topic/type';

export class ServerService implements ITopicService {
  createTopic: ITopicService['createTopic'] = (params) =>
    lambdaClient.topic.createTopic.mutate({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });

  batchCreateTopics: ITopicService['batchCreateTopics'] = (importTopics) =>
    lambdaClient.topic.batchCreateTopics.mutate(importTopics);

  cloneTopic: ITopicService['cloneTopic'] = (id, newTitle) =>
    lambdaClient.topic.cloneTopic.mutate({ id, newTitle });

  getTopics: ITopicService['getTopics'] = (params) =>
    lambdaClient.topic.getTopics.query({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    }) as any;

  getAllTopics: ITopicService['getAllTopics'] = () =>
    lambdaClient.topic.getAllTopics.query() as any;

  countTopics: ITopicService['countTopics'] = async (params) => {
    return lambdaClient.topic.countTopics.query(params);
  };

  rankTopics: ITopicService['rankTopics'] = async (limit) => {
    return lambdaClient.topic.rankTopics.query(limit);
  };

  searchTopics: ITopicService['searchTopics'] = (keywords, sessionId) =>
    lambdaClient.topic.searchTopics.query({
      keywords,
      sessionId: this.toDbSessionId(sessionId),
    }) as any;

  updateTopic: ITopicService['updateTopic'] = (id, data) =>
    lambdaClient.topic.updateTopic.mutate({ id, value: data });

  removeTopic: ITopicService['removeTopic'] = (id) => lambdaClient.topic.removeTopic.mutate({ id });

  removeTopics: ITopicService['removeTopics'] = (sessionId) =>
    lambdaClient.topic.batchDeleteBySessionId.mutate({ id: this.toDbSessionId(sessionId) });

  batchRemoveTopics: ITopicService['batchRemoveTopics'] = (topics) =>
    lambdaClient.topic.batchDelete.mutate({ ids: topics });

  removeAllTopic: ITopicService['removeAllTopic'] = () =>
    lambdaClient.topic.removeAllTopics.mutate();

  private toDbSessionId = (sessionId?: string | null) =>
    sessionId === INBOX_SESSION_ID ? null : sessionId;
}
