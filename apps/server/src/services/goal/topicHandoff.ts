import type { GoalItem } from '@lobechat/types';

import { GoalModel } from '@/database/models/goal';
import type { LobeChatDatabase } from '@/database/type';

import { GoalAssignmentService } from './assignment';

/**
 * Keeps a goal with the conversation it is supervised from when that
 * conversation moves to another agent.
 *
 * Moving a topic rewrites only the conversation rows. A goal bound to it kept
 * its previous agent, so the coordinator went on dispatching the goal's Tasks
 * to that agent, planned in a new hidden conversation of that agent, and
 * refused the new agent's run in the moved conversation — the goal looked
 * frozen from the conversation the user was now working in. The goal is
 * handed over the way `lh goal set-agent` does: the target becomes its
 * supervisor, its unfinished Tasks follow unless it has a dedicated executor,
 * and its planning turns keep landing in the moved conversation, which the
 * target now owns.
 */
export class GoalTopicHandoffService {
  private assignment: GoalAssignmentService;
  private goalModel: GoalModel;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    this.assignment = new GoalAssignmentService(db, userId, workspaceId);
    this.goalModel = new GoalModel(db, userId, workspaceId);
  }

  /**
   * The goals that must follow these topics to `targetAgentId`. Call before
   * moving: it throws when the target cannot supervise one of them, so the
   * move is refused instead of leaving the goal behind on the previous agent.
   */
  prepare = async (topicIds: string[], targetAgentId: string): Promise<GoalItem[]> => {
    const bound = await this.goalModel.findUnfinishedBySubjectTopics(topicIds);
    const following = bound.filter((goal) => goal.agentId !== targetAgentId);
    for (const goal of following) await this.assignment.assertUsableForGoal(goal, targetAgentId);
    return following;
  };

  /** Hand the prepared goals to `targetAgentId` once their topics have moved. */
  handOver = async (goals: GoalItem[], targetAgentId: string): Promise<string[]> => {
    for (const goal of goals) await this.assignment.setAgent(goal.id, targetAgentId);
    return goals.map((goal) => goal.id);
  };
}
