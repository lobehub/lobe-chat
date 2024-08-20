import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { CreateTopicParams, ITopicService, QueryTopicParams } from '@/services/topic/type';
import { BatchTaskResult } from '@/types/service';
import { ChatTopic } from '@/types/topic';

export class ServerService implements ITopicService {
  createTopic(params: CreateTopicParams): Promise<string> {
    return lambdaClient.topic.createTopic.mutate({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });
  }

  batchCreateTopics(importTopics: ChatTopic[]): Promise<BatchTaskResult> {
    return lambdaClient.topic.batchCreateTopics.mutate(importTopics);
  }

  cloneTopic(id: string, newTitle?: string | undefined): Promise<string> {
    return lambdaClient.topic.cloneTopic.mutate({ id, newTitle });
  }

  getTopics(params: QueryTopicParams): Promise<ChatTopic[]> {
    return lambdaClient.topic.getTopics.query({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    }) as any;
  }

  getAllTopics(): Promise<ChatTopic[]> {
    return lambdaClient.topic.getAllTopics.query() as any;
  }

  async countTopics() {
    return lambdaClient.topic.countTopics.query();
  }

  searchTopics(keywords: string, sessionId?: string | undefined): Promise<ChatTopic[]> {
    return lambdaClient.topic.searchTopics.query({
      keywords,
      sessionId: this.toDbSessionId(sessionId),
    }) as any;
  }

  updateTopic(id: string, data: Partial<ChatTopic>): Promise<any> {
    return lambdaClient.topic.updateTopic.mutate({ id, value: data });
  }

  removeTopic(id: string): Promise<any> {
    return lambdaClient.topic.removeTopic.mutate({ id });
  }

  removeTopics(sessionId: string): Promise<any> {
    return lambdaClient.topic.batchDeleteBySessionId.mutate({ id: this.toDbSessionId(sessionId) });
  }

  batchRemoveTopics(topics: string[]): Promise<any> {
    return lambdaClient.topic.batchDelete.mutate({ ids: topics });
  }

  removeAllTopic(): Promise<any> {
    return lambdaClient.topic.removeAllTopics.mutate();
  }

  private toDbSessionId(sessionId?: string | null) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}
