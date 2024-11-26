import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { CreateMessageParams } from '@/types/message';
import { CreateThreadParams, ThreadItem } from '@/types/topic';

interface CreateThreadWithMessageParams extends CreateThreadParams {
  message: CreateMessageParams;
}
export class ThreadService {
  getThreads = (topicId: string): Promise<ThreadItem[]> => {
    return lambdaClient.thread.getThreads.query({ topicId });
  };

  createThreadWithMessage({
    message,
    ...params
  }: CreateThreadWithMessageParams): Promise<{ messageId: string; threadId: string }> {
    return lambdaClient.thread.createThreadWithMessage.mutate({
      ...params,
      message: { ...message, sessionId: this.toDbSessionId(message.sessionId) },
    });
  }

  // createThread(params: CreateThreadParams): Promise<string> {
  //   return lambdaClient.thread.createThread.mutate(params);
  // }

  updateThread(id: string, data: Partial<ThreadItem>): Promise<any> {
    return lambdaClient.thread.updateThread.mutate({ id, value: data });
  }

  //
  removeThread(id: string): Promise<any> {
    return lambdaClient.thread.removeThread.mutate({ id });
  }
  //
  // removeThreads(sessionId: string): Promise<any> {
  //   return lambdaClient.thread.batchDeleteBySessionId.mutate({ id: this.toDbSessionId(sessionId) });
  // }
  //
  // batchRemoveThreads(topics: string[]): Promise<any> {
  //   return lambdaClient.thread.batchDelete.mutate({ ids: topics });
  // }
  //
  // removeAllThread(): Promise<any> {
  //   return lambdaClient.thread.removeAllThreads.mutate();
  // }

  private toDbSessionId(sessionId: string | undefined) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}

export const threadService = new ThreadService();
