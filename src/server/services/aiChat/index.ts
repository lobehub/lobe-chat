import { MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import { LobeChatDatabase } from '@/database/type';
import { FileService } from '@/server/services/file';

export class AiChatService {
  private userId: string;
  private messageModel: MessageModel;
  private fileService: FileService;
  private topicModel: TopicModel;

  constructor(serverDB: LobeChatDatabase, userId: string) {
    this.userId = userId;

    this.messageModel = new MessageModel(serverDB, userId);
    this.topicModel = new TopicModel(serverDB, userId);
    this.fileService = new FileService(serverDB, userId);
  }

  async getMessagesAndTopics(params: {
    current?: number;
    includeTopic?: boolean;
    pageSize?: number;
    sessionId?: string;
    topicId?: string;
  }) {
    const [messages, topics] = await Promise.all([
      this.messageModel.query(params, {
        postProcessUrl: (path) => this.fileService.getFullFileUrl(path),
      }),
      params.includeTopic ? this.topicModel.query({ sessionId: params.sessionId }) : undefined,
    ]);

    return { messages, topics };
  }
}
