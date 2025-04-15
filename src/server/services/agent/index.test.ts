// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionModel } from '@/database/models/session';
import { parseAgentConfig } from '@/server/globalConfig/parseDefaultAgent';

import { AgentService } from './index';

vi.mock('@/config/app', () => ({
  appEnv: {
    DEFAULT_AGENT_CONFIG: 'model=gpt-4;temperature=0.7',
  },
}));

vi.mock('@/server/globalConfig/parseDefaultAgent', () => ({
  parseAgentConfig: vi.fn(),
}));

vi.mock('@/database/models/session', () => ({
  SessionModel: vi.fn(),
}));

describe('AgentService', () => {
  let service: AgentService;
  const mockDb = {} as any;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AgentService(mockDb, mockUserId);
  });

  describe('createInbox', () => {
    it('should create inbox with default agent config', async () => {
      const mockConfig = { model: 'gpt-4', temperature: 0.7 };
      const mockSessionModel = {
        createInbox: vi.fn(),
      };

      (SessionModel as any).mockImplementation(() => mockSessionModel);
      (parseAgentConfig as any).mockReturnValue(mockConfig);

      await service.createInbox();

      expect(SessionModel).toHaveBeenCalledWith(mockDb, mockUserId);
      expect(parseAgentConfig).toHaveBeenCalledWith('model=gpt-4;temperature=0.7');
      expect(mockSessionModel.createInbox).toHaveBeenCalledWith(mockConfig);
    });

    it('should create inbox with empty config if parseAgentConfig returns undefined', async () => {
      const mockSessionModel = {
        createInbox: vi.fn(),
      };

      (SessionModel as any).mockImplementation(() => mockSessionModel);
      (parseAgentConfig as any).mockReturnValue(undefined);

      await service.createInbox();

      expect(SessionModel).toHaveBeenCalledWith(mockDb, mockUserId);
      expect(parseAgentConfig).toHaveBeenCalledWith('model=gpt-4;temperature=0.7');
      expect(mockSessionModel.createInbox).toHaveBeenCalledWith({});
    });
  });
});
