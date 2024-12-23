import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { MessageModel } from '@/database/server/models/message';
import { ThreadModel } from '@/database/server/models/thread';
import { BaseClientService } from '@/services/baseClientService';
import { CreateMessageParams } from '@/types/message';
import { CreateThreadParams, ThreadItem } from '@/types/topic';

import { IThreadService } from './type';

interface CreateThreadWithMessageParams extends CreateThreadParams {
  message: CreateMessageParams;
}
export class ClientService extends BaseClientService implements IThreadService {
  private get threadModel(): ThreadModel {
    return new ThreadModel(clientDB as any, this.userId);
  }
  private get messageModel(): MessageModel {
    return new MessageModel(clientDB as any, this.userId);
  }

  getThreads = async (topicId: string): Promise<ThreadItem[]> => {
    return this.threadModel.queryByTopicId(topicId);
  };

  createThreadWithMessage = async (
    input: CreateThreadWithMessageParams,
  ): Promise<{ messageId: string; threadId: string }> => {
    const thread = await this.threadModel.create({
      parentThreadId: input.parentThreadId,
      sourceMessageId: input.sourceMessageId,
      title: input.message.content.slice(0, 20),
      topicId: input.topicId,
      type: input.type,
    });

    const message = await this.messageModel.create({
      ...input.message,
      sessionId: this.toDbSessionId(input.message.sessionId) as string,
      threadId: thread?.id,
    });

    return { messageId: message?.id, threadId: thread?.id };
  };

  updateThread(id: string, data: Partial<ThreadItem>): Promise<any> {
    return this.threadModel.update(id, data);
  }

  removeThread(id: string): Promise<any> {
    return this.threadModel.delete(id);
  }

  private toDbSessionId(sessionId: string | undefined) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}
