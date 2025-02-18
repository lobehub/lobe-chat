import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { MessageModel } from '@/database/server/models/message';
import { BaseClientService } from '@/services/baseClientService';
import { clientS3Storage } from '@/services/file/ClientS3';
import { ChatMessage } from '@/types/message';

import { IMessageService } from './type';

export class ClientService extends BaseClientService implements IMessageService {
  private get messageModel(): MessageModel {
    return new MessageModel(clientDB as any, this.userId);
  }

  createMessage: IMessageService['createMessage'] = async ({ sessionId, ...params }) => {
    const { id } = await this.messageModel.create({
      ...params,
      sessionId: this.toDbSessionId(sessionId) as string,
    });

    return id;
  };

  batchCreateMessages: IMessageService['batchCreateMessages'] = async (messages) => {
    return this.messageModel.batchCreate(messages);
  };

  getMessages: IMessageService['getMessages'] = async (sessionId, topicId) => {
    const data = await this.messageModel.query(
      {
        sessionId: this.toDbSessionId(sessionId),
        topicId,
      },
      {
        postProcessUrl: async (url, file) => {
          const hash = (url as string).replace('client-s3://', '');
          const base64 = await this.getBase64ByFileHash(hash);

          return `data:${file.fileType};base64,${base64}`;
        },
      },
    );

    return data as unknown as ChatMessage[];
  };

  getAllMessages: IMessageService['getAllMessages'] = async () => {
    const data = await this.messageModel.queryAll();

    return data as unknown as ChatMessage[];
  };

  countMessages: IMessageService['countMessages'] = async (params) => {
    return this.messageModel.count(params);
  };

  countWords: IMessageService['countWords'] = async (params) => {
    return this.messageModel.countWords(params);
  };

  rankModels: IMessageService['rankModels'] = async () => {
    return this.messageModel.rankModels();
  };

  getHeatmaps: IMessageService['getHeatmaps'] = async () => {
    return this.messageModel.getHeatmaps();
  };

  getAllMessagesInSession: IMessageService['getAllMessagesInSession'] = async (sessionId) => {
    const data = this.messageModel.queryBySessionId(this.toDbSessionId(sessionId));

    return data as unknown as ChatMessage[];
  };

  updateMessageError: IMessageService['updateMessageError'] = async (id, error) => {
    return this.messageModel.update(id, { error });
  };

  updateMessage: IMessageService['updateMessage'] = async (id, message) => {
    return this.messageModel.update(id, message);
  };

  updateMessageTTS: IMessageService['updateMessageTTS'] = async (id, tts) => {
    return this.messageModel.updateTTS(id, tts as any);
  };

  updateMessageTranslate: IMessageService['updateMessageTranslate'] = async (id, translate) => {
    return this.messageModel.updateTranslate(id, translate as any);
  };

  updateMessagePluginState: IMessageService['updateMessagePluginState'] = async (id, value) => {
    return this.messageModel.updatePluginState(id, value);
  };

  updateMessagePluginArguments: IMessageService['updateMessagePluginArguments'] = async (
    id,
    value,
  ) => {
    const args = typeof value === 'string' ? value : JSON.stringify(value);

    return this.messageModel.updateMessagePlugin(id, { arguments: args });
  };

  removeMessage: IMessageService['removeMessage'] = async (id) => {
    return this.messageModel.deleteMessage(id);
  };

  removeMessages: IMessageService['removeMessages'] = async (ids) => {
    return this.messageModel.deleteMessages(ids);
  };

  removeMessagesByAssistant: IMessageService['removeMessagesByAssistant'] = async (
    sessionId,
    topicId,
  ) => {
    return this.messageModel.deleteMessagesBySession(this.toDbSessionId(sessionId), topicId);
  };

  removeAllMessages: IMessageService['removeAllMessages'] = async () => {
    return this.messageModel.deleteAllMessages();
  };

  hasMessages: IMessageService['hasMessages'] = async () => {
    const number = await this.countMessages();
    return number > 0;
  };

  messageCountToCheckTrace: IMessageService['messageCountToCheckTrace'] = async () => {
    const number = await this.countMessages();
    return number >= 4;
  };

  private toDbSessionId = (sessionId: string | undefined) => {
    return sessionId === INBOX_SESSION_ID ? undefined : sessionId;
  };

  private getBase64ByFileHash = async (hash: string) => {
    const fileItem = await clientS3Storage.getObject(hash);
    if (!fileItem) throw new Error('file not found');

    return Buffer.from(await fileItem.arrayBuffer()).toString('base64');
  };
}
