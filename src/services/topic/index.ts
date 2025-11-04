import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { BatchTaskResult } from '@/types/service';
import { ChatTopic, CreateTopicParams, QueryTopicParams, TopicRankItem } from '@/types/topic';

export class TopicService {
  createTopic = (params: CreateTopicParams): Promise<string> => {
    return lambdaClient.topic.createTopic.mutate({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });
  };

  batchCreateTopics = (importTopics: ChatTopic[]): Promise<BatchTaskResult> => {
    return lambdaClient.topic.batchCreateTopics.mutate(importTopics);
  };

  cloneTopic = (id: string, newTitle?: string): Promise<string> => {
    return lambdaClient.topic.cloneTopic.mutate({ id, newTitle });
  };

  getTopics = (params: QueryTopicParams): Promise<ChatTopic[]> => {
    return lambdaClient.topic.getTopics.query({
      ...params,
      containerId: this.toDbSessionId(params.containerId),
    }) as any;
  };

  getAllTopics = (): Promise<ChatTopic[]> => {
    return lambdaClient.topic.getAllTopics.query() as any;
  };

  countTopics = async (params?: {
    endDate?: string;
    range?: [string, string];
    startDate?: string;
  }): Promise<number> => {
    return lambdaClient.topic.countTopics.query(params);
  };

  rankTopics = async (limit?: number): Promise<TopicRankItem[]> => {
    return lambdaClient.topic.rankTopics.query(limit);
  };

  searchTopics = (keywords: string, sessionId?: string, groupId?: string): Promise<ChatTopic[]> => {
    return lambdaClient.topic.searchTopics.query({
      groupId,
      keywords,
      sessionId: this.toDbSessionId(sessionId),
    }) as any;
  };

  updateTopic = (id: string, data: Partial<ChatTopic>) => {
    return lambdaClient.topic.updateTopic.mutate({ id, value: data });
  };

  removeTopic = (id: string) => {
    return lambdaClient.topic.removeTopic.mutate({ id });
  };

  removeTopics = (sessionId: string) => {
    return lambdaClient.topic.batchDeleteBySessionId.mutate({ id: this.toDbSessionId(sessionId) });
  };

  batchRemoveTopics = (topics: string[]) => {
    return lambdaClient.topic.batchDelete.mutate({ ids: topics });
  };

  removeAllTopic = () => {
    return lambdaClient.topic.removeAllTopics.mutate();
  };

  private toDbSessionId = (sessionId?: string | null) =>
    sessionId === INBOX_SESSION_ID ? null : sessionId;
}

export const topicService = new TopicService();
