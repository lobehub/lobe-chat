import { INBOX_SESSION_ID } from '@/const/session';
import { SessionModel } from '@/database/models/session';
import { LobeAgentSession, LobeSessionType, LobeSessions, SessionGroupKey } from '@/types/session';

export interface GetSessionsResponse {
  inbox: LobeAgentSession;
  sessions: LobeSessions;
}

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

  async getSessions(): Promise<GetSessionsResponse> {
    console.time('getSessions');

    const inbox = await SessionModel.findById(INBOX_SESSION_ID);
    const sessions = await SessionModel.query();

    console.timeEnd('getSessions');

    return { inbox, sessions };
  }

  async removeSession(id: string) {
    return SessionModel.delete(id);
  }

  async removeAllSessions() {
    return SessionModel.clearTable();
  }

  async updateSessionGroup(id: string, group: SessionGroupKey) {
    return SessionModel.update(id, { group });
  }

  async batchCreateSessions(importSessions: LobeSessions) {
    return SessionModel.batchCreate(importSessions);
  }
}

export const sessionService = new SessionService();
