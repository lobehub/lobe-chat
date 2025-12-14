import type {
  AgentState,
  GroupOrchestrationContext,
  GroupOrchestrationInstruction,
  GroupOrchestrationInstructionAgentSpoke,
  GroupOrchestrationInstructionAgentsBroadcasted,
  GroupOrchestrationInstructionBroadcast,
  GroupOrchestrationInstructionCallSupervisor,
  GroupOrchestrationInstructionDelegate,
  GroupOrchestrationInstructionFinish,
  GroupOrchestrationInstructionSpeak,
  IGroupOrchestrationSupervisor,
} from '@lobechat/agent-runtime';

export interface GroupOrchestrationConfig {
  maxRounds: number;
  supervisorAgentId: string;
}

/**
 * GroupOrchestrationSupervisor - Routes phases to instructions
 *
 * This is the "Brain" for Multi-Agent Group Orchestration.
 * It's a pure router that converts phases to instructions.
 * The actual execution is handled by the Executors.
 *
 * Implements IGroupOrchestrationSupervisor interface (NOT Agent interface)
 */
export class GroupOrchestrationSupervisor implements IGroupOrchestrationSupervisor {
  constructor(private config: GroupOrchestrationConfig) {}

  async runner(
    context: GroupOrchestrationContext,
    state: AgentState,
  ): Promise<GroupOrchestrationInstruction> {
    const { phase, payload = {} } = context;

    switch (phase) {
      case 'call_supervisor': {
        return {
          payload: {
            groupId: (payload as Record<string, unknown>).groupId as string,
            round: (payload as Record<string, unknown>).round as number,
            supervisorAgentId: this.config.supervisorAgentId,
          },
          type: 'call_supervisor',
        } as GroupOrchestrationInstructionCallSupervisor;
      }

      case 'speak': {
        return {
          payload: payload as GroupOrchestrationInstructionSpeak['payload'],
          type: 'speak',
        } as GroupOrchestrationInstructionSpeak;
      }

      case 'broadcast': {
        return {
          payload: payload as GroupOrchestrationInstructionBroadcast['payload'],
          type: 'broadcast',
        } as GroupOrchestrationInstructionBroadcast;
      }

      case 'delegate': {
        console.log(state);
        return {
          payload: payload as GroupOrchestrationInstructionDelegate['payload'],
          type: 'delegate',
        } as GroupOrchestrationInstructionDelegate;
      }

      case 'agent_spoke': {
        return {
          payload: payload as GroupOrchestrationInstructionAgentSpoke['payload'],
          type: 'agent_spoke',
        } as GroupOrchestrationInstructionAgentSpoke;
      }

      case 'agents_broadcasted': {
        return {
          payload: payload as GroupOrchestrationInstructionAgentsBroadcasted['payload'],
          type: 'agents_broadcasted',
        } as GroupOrchestrationInstructionAgentsBroadcasted;
      }

      default: {
        return {
          reason: 'unknown_phase',
          type: 'finish',
        } as GroupOrchestrationInstructionFinish;
      }
    }
  }
}
