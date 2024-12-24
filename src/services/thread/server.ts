import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';
import { CreateMessageParams } from '@/types/message';
import { CreateThreadParams, ThreadItem } from '@/types/topic';

import { IThreadService } from './type';

interface CreateThreadWithMessageParams extends CreateThreadParams {
  message: CreateMessageParams;
}
export class ServerService implements IThreadService {
  getThreads = async (topicId: string): Promise<ThreadItem[]> => {
    return lambdaClient.thread.getThreads.query({ topicId });
  };

  createThreadWithMessage = async ({
    message,
    ...params
  }: CreateThreadWithMessageParams): Promise<{
    messageId: string;
    threadId: string;
  }> =>
    lambdaClient.thread.createThreadWithMessage.mutate({
      ...params,
      message: { ...message, sessionId: this.toDbSessionId(message.sessionId) },
    });

  updateThread = async (id: string, data: Partial<ThreadItem>): Promise<any> => {
    return lambdaClient.thread.updateThread.mutate({
      id,
      value: data,
    });
  };

  removeThread = async (id: string): Promise<any> => {
    return lambdaClient.thread.removeThread.mutate({ id });
  };

  private toDbSessionId = (sessionId: string | undefined) => {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  };
}
