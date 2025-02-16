import { appEnv } from '@/config/app';
import { serverDB } from '@/database/server';
import { SessionModel } from '@/database/server/models/session';
import { parseAgentConfig } from '@/server/globalConfig/parseDefaultAgent';

export class AgentService {
  private readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createInbox() {
    const sessionModel = new SessionModel(serverDB, this.userId);

    const defaultAgentConfig = parseAgentConfig(appEnv.DEFAULT_AGENT_CONFIG) || {};

    await sessionModel.createInbox(defaultAgentConfig);
  }
}
