/** Shared helpers for the goal service tests: the database lifecycle, and driving a batch through its release review. */
import { afterEach, beforeEach, expect, vi } from 'vitest';

import {
  acceptances,
  agentOperations,
  agents,
  goalEdges,
  goalEvents,
  goalNodeDecisions,
  goalNodes,
  goals,
  metricPoints,
  metrics,
  projects,
  tasks,
  taskTopics,
  topics,
  users,
} from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';

import type { GoalService } from './index';

/** Seed the test user before each test and clear everything a goal test writes after it. */
export const registerGoalServiceTestCleanup = (serverDB: LobeChatDatabase, userId: string) => {
  beforeEach(async () => {
    await serverDB.insert(users).values({ id: userId }).onConflictDoNothing();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    // PGlite does not consistently order the nested user -> goal -> graph
    // cascades, so clear graph leaves explicitly before their owned roots.
    await serverDB.delete(goalNodeDecisions);
    await serverDB.delete(goalEdges);
    await serverDB.delete(goalEvents);
    await serverDB.delete(goalNodes);
    await serverDB.delete(goals);
    await serverDB.delete(metricPoints);
    await serverDB.delete(metrics);
    await serverDB.delete(acceptances);
    await serverDB.delete(agentOperations);
    // A project holds its coordinator agent; it goes before the agents do.
    await serverDB.delete(projects);
    await serverDB.delete(taskTopics);
    await serverDB.delete(topics);
    await serverDB.delete(tasks);
    await serverDB.delete(agents);
    await serverDB.delete(users);
  });
};

/** The release a passed batch gate is held for, still waiting on the owner. */
export const pendingRelease = async (service: GoalService, goalId: string) =>
  (await service.graph(goalId)).decisions.find(
    (decision) =>
      decision.status === 'pending' && decision.options?.some((option) => option.id === 'release'),
  );

/** Approve the release a passed batch gate is held for, as the owner would, and advance. */
export const approveRelease = async (service: GoalService, goalId: string) => {
  const pending = await pendingRelease(service, goalId);
  expect(pending).toBeDefined();
  await service.answerReleaseGate(pending!.nodeId, 'release');
  return service.tick(goalId);
};
