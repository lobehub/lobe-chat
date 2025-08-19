/* eslint-disable @typescript-eslint/no-unused-vars */
import { trpcClient } from './_auth/trpc';
import { ISessionService } from './type';

export class ServerService implements ISessionService {
  getGroupedSessions: ISessionService['getGroupedSessions'] = async () => {
    try {
      // 使用 tRPC 客户端调用
      const sessions = await trpcClient.session.getGroupedSessions.query();
      return sessions || { sessionGroups: [], sessions: [] };
    } catch (error) {
      console.error('Failed to fetch grouped sessions:', error);
      throw error;
    }
  };

  // getSessionGroups: ISessionService['getSessionGroups'] = () => {
  //   return lambdaClient.sessionGroup.getSessionGroup.query();
  // };
}

const sessionService = new ServerService();

export default sessionService;
