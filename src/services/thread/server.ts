import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';

import { IThreadService } from './type';

export class ServerService implements IThreadService {
  getThreads: IThreadService['getThreads'] = (topicId) => {
    return lambdaClient.thread.getThreads.query({ topicId });
  };

  createThreadWithMessage: IThreadService['createThreadWithMessage'] = async ({
    message,
    ...params
  }) => {
    return lambdaClient.thread.createThreadWithMessage.mutate({
      ...params,
      message: { ...message, sessionId: this.toDbSessionId(message.sessionId) },
    });
  };

  updateThread: IThreadService['updateThread'] = async (id, data) => {
    return lambdaClient.thread.updateThread.mutate({ id, value: data });
  };

  removeThread: IThreadService['removeThread'] = async (id) => {
    return lambdaClient.thread.removeThread.mutate({ id });
  };

  private toDbSessionId = (sessionId: string | undefined) => {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  };
}
