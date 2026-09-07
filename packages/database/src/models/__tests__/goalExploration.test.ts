// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { goals, users } from '../../schemas';
import { GoalModel } from '../goal';
import { GoalExplorationModel, goalExplorationSnapshot } from '../goalExploration';
import { GoalGraphModel } from '../goalGraph';
import { TaskModel } from '../task';
import { WorkModel } from '../work';

const db = await getTestDB();
const userId = 'exploration-owner';
const graphModel = new GoalGraphModel(db, userId);
const model = new GoalExplorationModel(db, userId);

beforeEach(async () => {
  await db.insert(users).values([{ id: userId }, { id: 'other-owner' }]);
});
afterEach(async () => {
  await db.delete(users);
});

async function seed(maxExperiments = 3) {
  const goal = await new GoalModel(db, userId).create({
    title: 'Explore candidates',
    subjectType: 'standalone',
    status: 'running',
    config: { exploration: { instruction: 'Compare results', maxExperiments } },
  });
  await graphModel.createNode(goal.id, { kind: 'problem', title: 'Find a candidate' });
  const parent = await graphModel.createNode(goal.id, {
    kind: 'task',
    title: 'Baseline',
    status: 'resolved',
  });
  return { goalId: goal.id, parent: parent! };
}
async function claim(goalId: string) {
  return model.claim(goalId, goalExplorationSnapshot((await graphModel.getGraph(goalId))!));
}
const expand = (parentNodeId: string) => ({
  action: 'expand' as const,
  parentNodeId,
  title: 'Alternative',
  instruction: 'Change the baseline using its evidence',
  reason: 'The first result is promising',
});

describe('GoalExplorationModel', () => {
  it('branches from an older experiment and pins its produced version with an auditable reason', async () => {
    const { goalId, parent } = await seed();
    await graphModel.createNode(goalId, {
      kind: 'task',
      title: 'Newer failed candidate',
      status: 'resolved',
    });
    const task = await new TaskModel(db, userId).create({ instruction: 'baseline evidence' });
    const work = await new WorkModel(db, userId).registerTask({
      changeType: 'created',
      taskId: task.id,
      toolIdentifier: 'test',
      toolName: 'createTask',
    });
    await graphModel.attachWorkVersion(goalId, parent.id, work!.currentVersionId!, 'produced');
    const lease = await claim(goalId);
    const result = await model.apply(goalId, lease!.token, expand(parent.id));
    expect(result.outcome).toBe('expanded');
    const graph = (await graphModel.getGraph(goalId))!;
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        kind: 'derived_from',
        sourceNodeId: result.nodeId,
        targetNodeId: parent.id,
      }),
    );
    expect(graph.workVersions).toContainEqual(
      expect.objectContaining({
        nodeId: result.nodeId,
        relation: 'input',
        workVersionId: work!.currentVersionId,
      }),
    );
    expect(graph.events).toContainEqual(
      expect.objectContaining({
        actorType: 'system',
        reason: `Expanded from ${parent.id}: The first result is promising`,
      }),
    );
    expect((await model.apply(goalId, lease!.token, expand(parent.id))).outcome).toBe('stale');
    expect(
      (await graphModel.getGraph(goalId))!.nodes.filter((n) => n.kind === 'task'),
    ).toHaveLength(3);
  });

  it('leases a single planner when advances race', async () => {
    const { goalId } = await seed();
    const snapshot = goalExplorationSnapshot((await graphModel.getGraph(goalId))!);
    const claims = await Promise.all([
      model.claim(goalId, snapshot),
      model.claim(goalId, snapshot),
    ]);
    expect(claims.filter(Boolean)).toHaveLength(1);
  });

  it('discards a late plan after a human pause or graph edit', async () => {
    const { goalId, parent } = await seed();
    const first = await claim(goalId);
    await graphModel.createNode(goalId, { kind: 'finding', title: 'New evidence' });
    expect((await model.apply(goalId, first!.token, expand(parent.id))).outcome).toBe('stale');
    const second = await claim(goalId);
    await db.update(goals).set({ status: 'paused' }).where(eq(goals.id, goalId));
    expect((await model.apply(goalId, second!.token, expand(parent.id))).outcome).toBe('stale');
    await model.fail(goalId, second!.token, 'late error');
    expect(
      (await graphModel.getGraph(goalId))!.nodes.filter((n) => n.kind === 'task'),
    ).toHaveLength(1);
    expect(await claim(goalId)).toBeUndefined();
  });

  it('parks an exhausted search without claiming achievement', async () => {
    const { goalId, parent } = await seed(1);
    const lease = await claim(goalId);
    expect((await model.apply(goalId, lease!.token, expand(parent.id))).outcome).toBe('limit');
    const graph = (await graphModel.getGraph(goalId))!;
    expect(graph.goal.status).toBe('paused');
    expect(graph.goal.config?.exploration?.checkpoint).toBeUndefined();
    expect(graph.nodes.filter((n) => n.kind === 'task')).toHaveLength(1);
    expect(await claim(goalId)).toBeUndefined();
  });

  it('requests independent acceptance at the cap, never directly marks achieved', async () => {
    const { goalId, parent } = await seed(1);
    const lease = await claim(goalId);
    expect(
      (await model.apply(goalId, lease!.token, { ...expand(parent.id), action: 'verify' })).outcome,
    ).toBe('verify');
    const graph = (await graphModel.getGraph(goalId))!;
    expect(graph.goal.status).toBe('running');
    expect(graph.goal.config?.exploration?.checkpoint).toMatchObject({
      readyForAcceptance: true,
      reviewedNodeIds: [parent.id],
    });
  });

  it('rejects foreign ownership and unresolved or foreign parents atomically', async () => {
    const { goalId } = await seed();
    const snapshot = goalExplorationSnapshot((await graphModel.getGraph(goalId))!);
    expect(
      await new GoalExplorationModel(db, 'other-owner').claim(goalId, snapshot),
    ).toBeUndefined();
    const lease = await claim(goalId);
    await expect(model.apply(goalId, lease!.token, expand('foreign-node'))).rejects.toThrow(
      'resolved experiment',
    );
    expect(
      (await graphModel.getGraph(goalId))!.nodes.filter((n) => n.kind === 'task'),
    ).toHaveLength(1);
  });
});

describe('experiment containers', () => {
  it('persists nested answers with mixed node kinds and enforces ownership, scope and cycles', async () => {
    const { goalId } = await seed();
    const question = await graphModel.createNode(goalId, { kind: 'problem', title: 'Question' });
    const answer = await graphModel.createNode(goalId, {
      kind: 'experiment',
      title: 'Candidate',
      questionId: question!.id,
    });
    const task = await graphModel.createNode(goalId, {
      kind: 'task',
      title: 'Measure',
      scopeId: answer!.id,
      status: 'resolved',
    });
    const subq = await graphModel.createNode(goalId, {
      kind: 'problem',
      title: 'Subquestion',
      scopeId: answer!.id,
    });
    const nested = await graphModel.createNode(goalId, {
      kind: 'experiment',
      title: 'Nested candidate',
      scopeId: answer!.id,
      questionId: subq!.id,
    });
    await graphModel.createNode(goalId, {
      kind: 'finding',
      title: 'Evidence',
      scopeId: answer!.id,
      status: 'resolved',
    });
    await graphModel.createNode(goalId, {
      kind: 'decision',
      title: 'Review',
      scopeId: nested!.id,
      status: 'waiting',
    });
    const graph = (await graphModel.getGraph(goalId))!;
    expect(graph.nodes.find((n) => n.id === answer!.id)?.status).toBe('waiting');
    expect(graph.nodes.find((n) => n.id === answer!.id)?.taskId).toBeNull();
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        sourceNodeId: nested!.id,
        targetNodeId: subq!.id,
        kind: 'answers',
      }),
    );
    await expect(
      graphModel.createEdge(goalId, nested!.id, answer!.id, 'contains'),
    ).rejects.toThrow();
    await expect(graphModel.createEdge(goalId, nested!.id, task!.id, 'contains')).rejects.toThrow(
      'only one',
    );
    await expect(
      graphModel.createNode(goalId, {
        kind: 'experiment',
        title: 'Wrong scope',
        questionId: subq!.id,
      }),
    ).rejects.toThrow('scope');
    await expect(graphModel.createEdge(goalId, answer!.id, task!.id, 'answers')).rejects.toThrow(
      'question',
    );
    await expect(
      graphModel.createEdge(goalId, answer!.id, question!.id, 'contains'),
    ).rejects.toThrow();
    expect((await graphModel.getGraph(goalId))!.nodes.some((n) => n.title === 'Wrong scope')).toBe(
      false,
    );
    expect(
      await new GoalGraphModel(db, 'other-owner').createNode(goalId, {
        kind: 'task',
        title: 'Foreign',
        scopeId: answer!.id,
      }),
    ).toBeUndefined();
  });
});
