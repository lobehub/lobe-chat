import { SessionModel } from '@/database/models/session';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

class SessionService {
  async createNewSession(
    type: LobeSessionType,
    defaultValue: Partial<LobeAgentSession>,
  ): Promise<string> {
    const item = await SessionModel.create(type, defaultValue);
    if (!item) {
      throw new Error('session create Error');
    }
    return item.id;
  }

  async getSessions() {
    return SessionModel.query()
  }

  async removeSession(id: string) {
    return SessionModel.delete(id);
  }

  async removeAllSessions() {
    return SessionModel.clearTable();
  }
}

export const sessionService = new SessionService();
