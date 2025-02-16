import { appEnv } from '@/config/app';
import { SessionModel } from '@/database/server/models/session';
import { LobeChatDatabase } from '@/database/type';
import { parseAgentConfig } from '@/server/globalConfig/parseDefaultAgent';

export class AgentService {
  private readonly userId: string;
  private readonly db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  async createInbox() {
    const sessionModel = new SessionModel(this.db, this.userId);

    const defaultAgentConfig = parseAgentConfig(appEnv.DEFAULT_AGENT_CONFIG) || {};

    await sessionModel.createInbox(defaultAgentConfig);
  }
}
