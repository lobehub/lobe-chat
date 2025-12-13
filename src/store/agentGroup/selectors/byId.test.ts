import { AgentGroupDetail } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { ChatGroupStore } from '../initialState';
import { agentGroupByIdSelectors } from './byId';

describe('agentGroupByIdSelectors', () => {
  describe('groupBySupervisorAgentId', () => {
    it('should find group by supervisor agent ID', () => {
      const mockGroup: AgentGroupDetail = {
        id: 'group-1',
        title: 'Test Group',
        supervisorAgentId: 'supervisor-agent-1',
        agents: [
          { id: 'supervisor-agent-1', title: 'Supervisor', isSupervisor: true },
          { id: 'agent-1', title: 'Agent 1', isSupervisor: false },
        ],
      } as AgentGroupDetail;

      const state: Partial<ChatGroupStore> = {
        groupMap: {
          'group-1': mockGroup,
        },
      };

      const result = agentGroupByIdSelectors.groupBySupervisorAgentId('supervisor-agent-1')(
        state as ChatGroupStore,
      );

      expect(result).toEqual(mockGroup);
    });

    it('should return undefined when supervisor agent ID not found', () => {
      const mockGroup: AgentGroupDetail = {
        id: 'group-1',
        title: 'Test Group',
        supervisorAgentId: 'supervisor-agent-1',
        agents: [],
      } as AgentGroupDetail;

      const state: Partial<ChatGroupStore> = {
        groupMap: {
          'group-1': mockGroup,
        },
      };

      const result = agentGroupByIdSelectors.groupBySupervisorAgentId('non-existent-supervisor')(
        state as ChatGroupStore,
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined when groupMap is empty', () => {
      const state: Partial<ChatGroupStore> = {
        groupMap: {},
      };

      const result = agentGroupByIdSelectors.groupBySupervisorAgentId('any-supervisor')(
        state as ChatGroupStore,
      );

      expect(result).toBeUndefined();
    });

    it('should find correct group when multiple groups exist', () => {
      const mockGroup1: AgentGroupDetail = {
        id: 'group-1',
        title: 'Group 1',
        supervisorAgentId: 'supervisor-1',
        agents: [],
      } as AgentGroupDetail;

      const mockGroup2: AgentGroupDetail = {
        id: 'group-2',
        title: 'Group 2',
        supervisorAgentId: 'supervisor-2',
        agents: [],
      } as AgentGroupDetail;

      const state: Partial<ChatGroupStore> = {
        groupMap: {
          'group-1': mockGroup1,
          'group-2': mockGroup2,
        },
      };

      const result = agentGroupByIdSelectors.groupBySupervisorAgentId('supervisor-2')(
        state as ChatGroupStore,
      );

      expect(result).toEqual(mockGroup2);
    });
  });
});
