// @vitest-environment node
import { randomUUID } from 'node:crypto';

import type { AcceptanceFlowDefinition } from '@lobechat/types';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { acceptances, users, verifyCheckResults, verifyCriteria, verifyRuns } from '../../schemas';
import { AcceptanceFlowModel, getFlowPlanHash, validateFlow } from '../acceptanceFlow';

const db = await getTestDB();
const owner = 'flow-asset-owner';
const other = 'flow-asset-other';
const model = new AcceptanceFlowModel(db, owner);
let acceptanceId: string;
let definition: AcceptanceFlowDefinition;
beforeEach(async () => {
  await db
    .insert(users)
    .values([{ id: owner }, { id: other }])
    .onConflictDoNothing();
  const [acceptance] = await db
    .insert(acceptances)
    .values({ userId: owner, subjectType: 'standalone', subjectId: randomUUID() })
    .returning();
  acceptanceId = acceptance.id;
  const first = randomUUID();
  const second = randomUUID();
  definition = {
    title: 'Send and retry',
    entryNodeId: first,
    nodes: [
      {
        id: first,
        check: {
          id: randomUUID(),
          title: 'Ready',
          definition: {
            steps: [{ id: 'open', instruction: 'Open chat' }],
            expected: 'Composer visible',
          },
        },
      },
      {
        id: second,
        check: {
          id: randomUUID(),
          title: 'Failure shown',
          definition: {
            steps: [{ id: 'send', instruction: 'Send offline' }],
            expected: 'Retry available',
          },
        },
      },
    ],
    edges: [
      {
        id: randomUUID(),
        sourceNodeId: first,
        targetNodeId: second,
        trigger: 'Send offline',
        required: true,
      },
      {
        id: randomUUID(),
        sourceNodeId: second,
        targetNodeId: first,
        trigger: 'Retry',
        required: true,
      },
    ],
  };
});
afterEach(async () => {
  await db.delete(users).where(eq(users.id, owner));
  await db.delete(users).where(eq(users.id, other));
});

async function roundPlan(id: string) {
  const [run] = await db.select().from(verifyRuns).where(eq(verifyRuns.id, id));
  return run;
}

async function confirmRound(id: string) {
  return model.confirmPlan(acceptanceId, id, getFlowPlanHash(await roundPlan(id)));
}

describe('check assets and round snapshots', () => {
  it.each(['accepted', 'closed'] as const)(
    'requires reopening a %s acceptance before starting or replaying',
    async (status) => {
      const published = await model.publish(acceptanceId, definition);
      const original = await model.start(acceptanceId, published.flowId);
      await db.update(acceptances).set({ status }).where(eq(acceptances.id, acceptanceId));
      await expect(model.start(acceptanceId, published.flowId)).rejects.toThrow(
        'Acceptance is closed',
      );
      await expect(
        model.start(acceptanceId, published.flowId, undefined, original.id),
      ).rejects.toThrow('Acceptance is closed');
      await expect(model.start(acceptanceId, published.flowId, original.id)).rejects.toThrow(
        'Acceptance is closed',
      );
      expect(
        await db.select().from(verifyRuns).where(eq(verifyRuns.acceptanceId, acceptanceId)),
      ).toHaveLength(1);
      const [current] = await db.select().from(acceptances).where(eq(acceptances.id, acceptanceId));
      expect(current.status).toBe(status);
    },
  );

  it('keeps the proposed flow unexecuted until the user confirms its plan', async () => {
    const flow = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, flow.flowId);
    const round = await roundPlan(run.id);
    await expect(
      model.record(acceptanceId, {
        verifyRunId: run.id,
        checkItemId: round.plan![0].id,
        verdict: 'passed',
        observation: 'Must not start before approval',
      }),
    ).rejects.toThrow('Flow plan must be confirmed');
    expect((await roundPlan(run.id)).planConfirmedAt).toBeNull();
    expect(await db.select().from(verifyCheckResults)).toHaveLength(0);
  });

  it('confirms only the current reviewed snapshot and freezes its checks', async () => {
    const flow = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, flow.flowId);
    const hash = getFlowPlanHash(await roundPlan(run.id));
    await expect(
      new AcceptanceFlowModel(db, other).confirmPlan(acceptanceId, run.id, hash),
    ).rejects.toThrow('Acceptance not found');
    await expect(model.confirmPlan(acceptanceId, run.id, 'stale')).rejects.toThrow(
      'Flow plan changed',
    );
    const confirmed = await confirmRound(run.id);
    expect((await confirmRound(run.id)).planConfirmedAt).toEqual(confirmed.planConfirmedAt);
    const replay = await model.start(acceptanceId, flow.flowId, undefined, run.id);
    expect((await roundPlan(replay.id)).planConfirmedAt).toEqual(confirmed.planConfirmedAt);
    const fresh = await model.start(acceptanceId, flow.flowId);
    expect((await roundPlan(fresh.id)).planConfirmedAt).toBeNull();
    await expect(model.confirmPlan(acceptanceId, run.id, hash)).rejects.toThrow(
      'Current flow plan required',
    );
  });

  it('does not treat a legacy execution timestamp as user approval when replaying', async () => {
    const flow = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, flow.flowId);
    await db
      .update(verifyRuns)
      .set({ planConfirmedAt: new Date() })
      .where(eq(verifyRuns.id, run.id));
    const replay = await model.start(acceptanceId, flow.flowId, undefined, run.id);
    expect((await roundPlan(replay.id)).planConfirmedAt).toBeNull();
  });

  it('invalidates a pending approval when another flow is added to the draft round', async () => {
    const first = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, first.flowId);
    const oldHash = getFlowPlanHash(await roundPlan(run.id));
    const node = randomUUID();
    const second = await model.publish(acceptanceId, {
      title: 'Second journey',
      entryNodeId: node,
      nodes: [{ id: node, criterionId: definition.nodes[0].check!.id }],
      edges: [],
    });
    await model.start(acceptanceId, second.flowId, run.id);
    await expect(model.confirmPlan(acceptanceId, run.id, oldHash)).rejects.toThrow(
      'Flow plan changed',
    );
    await confirmRound(run.id);
    const thirdNode = randomUUID();
    const third = await model.publish(acceptanceId, {
      title: 'Third journey',
      entryNodeId: thirdNode,
      nodes: [{ id: thirdNode, criterionId: definition.nodes[0].check!.id }],
      edges: [],
    });
    await expect(model.start(acceptanceId, third.flowId, run.id)).rejects.toThrow('already frozen');
    const partial = await model.start(acceptanceId, first.flowId, undefined, run.id);
    expect((await roundPlan(partial.id)).planConfirmedAt).toBeNull();
  });

  it('creates assets before execution and instantiates each incoming branch in the canonical plan', async () => {
    const published = await model.publish(acceptanceId, definition);
    expect(
      await db.select().from(verifyCriteria).where(eq(verifyCriteria.userId, owner)),
    ).toHaveLength(2);
    expect(await db.select().from(verifyCheckResults)).toHaveLength(0);
    const run = await model.start(acceptanceId, published.flowId);
    const round = await roundPlan(run.id);
    expect(round.plan).toHaveLength(3);
    expect(round.flowSnapshots?.[0].nodes).toHaveLength(2);
    expect(round.plan?.every((p) => p.sourceCriterionId && p.definition?.expected)).toBe(true);
    expect((await model.start(acceptanceId, published.flowId, run.id)).id).toBe(run.id);
  });

  it('requires every mandatory branch and writes directly to canonical results with idempotent evidence', async () => {
    const { flowId } = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, flowId);
    const plan = (await roundPlan(run.id)).plan!;
    const input = {
      verifyRunId: run.id,
      checkItemId: plan[0].id,
      verdict: 'passed' as const,
      observation: 'Composer visible',
    };
    await confirmRound(run.id);
    const result = await model.record(acceptanceId, input);
    expect((await model.record(acceptanceId, input)).id).toBe(result.id);
    expect(result.sourceCriterionId).toBe(plan[0].sourceCriterionId);
    expect(result.checkItemId).toBe(plan[0].id);
    await expect(model.complete(acceptanceId, run.id)).rejects.toThrow('Required flow branches');
    await expect(model.record(acceptanceId, { ...input, verdict: 'failed' })).rejects.toThrow(
      'new verification round',
    );
    for (const item of plan.slice(1))
      await model.record(acceptanceId, { ...input, checkItemId: item.id });
    await model.complete(acceptanceId, run.id);
    await model.review(acceptanceId, result.id, 'accepted', 'Reviewed', owner);
    const view = (await model.list(acceptanceId))[0].versions.find((v) =>
      v.runs.some((r) => r.id === run.id),
    )!;
    expect(view.runs[0].attempts.map((a) => a.checkItemId)).toEqual(plan.map((p) => p.id));
    expect((await roundPlan(run.id)).status).toBe('delivered');
    const fresh = await model.start(acceptanceId, flowId);
    expect((await roundPlan(fresh.id)).plan?.map((p) => p.id)).toEqual(plan.map((p) => p.id));
    expect(
      await db
        .select()
        .from(verifyCheckResults)
        .where(eq(verifyCheckResults.verifyRunId, fresh.id)),
    ).toHaveLength(0);
  });

  it('keeps old definitions unchanged after asset edits and allows replay of the frozen round', async () => {
    const { flowId } = await model.publish(acceptanceId, definition);
    const first = await model.start(acceptanceId, flowId);
    const initial = await roundPlan(first.id);
    const assetId = definition.nodes[0].check!.id;
    await db
      .update(verifyCriteria)
      .set({ title: 'New criterion', definition: { expected: 'New expectation' } })
      .where(eq(verifyCriteria.id, assetId));
    const current = await model.start(acceptanceId, flowId);
    const replay = await model.start(acceptanceId, flowId, undefined, first.id);
    expect((await roundPlan(first.id)).plan).toEqual(initial.plan);
    expect((await roundPlan(replay.id)).plan).toEqual(initial.plan);
    expect(
      (await roundPlan(current.id)).plan?.find((p) => p.sourceCriterionId === assetId)?.definition
        ?.expected,
    ).toBe('New expectation');
    const data = await model.list(acceptanceId);
    expect(
      data[0].versions
        .find((v) => v.runs[0]?.id === first.id)
        ?.nodes.find((n) => n.criterionId === assetId)?.expected,
    ).toBe('Composer visible');
  });

  it('reuses one asset in different positions and rejects cross-user references', async () => {
    const { flowId, hash } = await model.publish(acceptanceId, definition);
    const shared = definition.nodes[0].check!.id;
    definition.nodes = definition.nodes.map((n) => ({ id: n.id, criterionId: shared }));
    await model.publish(acceptanceId, definition, flowId, hash);
    expect((await model.list(acceptanceId))[0].versions[0].nodes.map((n) => n.criterionId)).toEqual(
      [shared, shared],
    );
    await expect(new AcceptanceFlowModel(db, other).start(acceptanceId, flowId)).rejects.toThrow(
      'Acceptance not found',
    );
    const [foreign] = await db
      .insert(verifyCriteria)
      .values({ userId: other, title: 'Private', verifierType: 'agent' })
      .returning();
    definition.nodes[0] = { id: definition.nodes[0].id, criterionId: foreign.id };
    await expect(
      model.publish(acceptanceId, definition, flowId, (await model.list(acceptanceId))[0].hash),
    ).rejects.toThrow('Check asset not found');
  });

  it('detects concurrent graph edits and keeps assets after deleting the acceptance', async () => {
    const published = await model.publish(acceptanceId, definition);
    const revised = { ...definition, title: 'Updated graph' };
    await model.publish(acceptanceId, revised, published.flowId, published.hash);
    await expect(
      model.publish(acceptanceId, definition, published.flowId, published.hash),
    ).rejects.toThrow('Flow changed');
    await db.delete(acceptances).where(eq(acceptances.id, acceptanceId));
    expect(
      await db.select().from(verifyCriteria).where(eq(verifyCriteria.userId, owner)),
    ).toHaveLength(2);
  });

  it('keeps two business flows and their results separate in one verification round', async () => {
    definition.nodes[0].check!.definition.preconditions = ['Signed in'];
    const first = await model.publish(acceptanceId, definition);
    const nodeId = randomUUID();
    const second = await model.publish(acceptanceId, {
      title: 'View group profile',
      entryNodeId: nodeId,
      nodes: [{ id: nodeId, criterionId: definition.nodes[0].check!.id }],
      edges: [],
    });
    const run = await model.start(acceptanceId, first.flowId);
    await model.start(acceptanceId, second.flowId, run.id);
    const round = await roundPlan(run.id);
    expect(round.flowSnapshots?.map((flow) => flow.flowId)).toEqual([first.flowId, second.flowId]);
    expect(round.plan).toHaveLength(4);
    const firstItems = round.plan!.filter((item) => item.sourceFlowNode?.flowId === first.flowId);
    const secondItem = round.plan!.find((item) => item.sourceFlowNode?.flowId === second.flowId)!;
    expect(secondItem.definition?.preconditions).toEqual(['Signed in']);
    expect(new Set(round.plan!.map((item) => item.id)).size).toBe(4);
    await confirmRound(run.id);
    for (const item of firstItems)
      await model.record(acceptanceId, {
        verifyRunId: run.id,
        checkItemId: item.id,
        verdict: 'passed',
        observation: 'Verified',
      });
    await expect(model.complete(acceptanceId, run.id)).rejects.toThrow('Required flow branches');
    const views = await model.list(acceptanceId);
    const viewFor = (flowId: string) =>
      views.find((flow) => flow.id === flowId)!.versions.find((v) => v.runs[0]?.id === run.id)!;
    expect(viewFor(first.flowId).runs[0].attempts).toHaveLength(3);
    expect(viewFor(second.flowId).runs[0].attempts).toHaveLength(0);
    await model.record(acceptanceId, {
      verifyRunId: run.id,
      checkItemId: secondItem.id,
      verdict: 'passed',
      observation: 'Profile ready',
    });
    await model.complete(acceptanceId, run.id);
    expect((await roundPlan(run.id)).status).toBe('delivered');
    expect((await roundPlan(run.id)).flowSnapshots).toEqual(round.flowSnapshots);
  });

  it('freezes composed flows and isolates repeated subflow occurrences', async () => {
    const child = await model.publish(acceptanceId, definition);
    const a = randomUUID(),
      b = randomUUID();
    const parentDefinition: AcceptanceFlowDefinition = {
      title: 'End to end',
      entryNodeId: a,
      nodes: [
        { id: a, subFlowId: child.flowId },
        { id: b, subFlowId: child.flowId },
      ],
      edges: [
        { id: randomUUID(), sourceNodeId: a, targetNodeId: b, trigger: 'Continue', required: true },
      ],
    };
    const parent = await model.publish(acceptanceId, parentDefinition);
    const run = await model.start(acceptanceId, parent.flowId);
    const initial = await roundPlan(run.id);
    expect(initial.plan).toHaveLength(6);
    expect(new Set(initial.plan!.map((item) => item.id)).size).toBe(6);
    const firstItems = initial.plan!.filter((item) =>
      item.sourceFlowNode?.nodeId.startsWith(a + '/'),
    );
    expect(firstItems).toHaveLength(3);
    await confirmRound(run.id);
    for (const item of firstItems)
      await model.record(acceptanceId, {
        verifyRunId: run.id,
        checkItemId: item.id,
        verdict: 'passed',
        observation: 'First occurrence only',
      });
    await expect(model.complete(acceptanceId, run.id)).rejects.toThrow('Required flow branches');
    const version = (await model.list(acceptanceId))
      .find((flow) => flow.id === parent.flowId)!
      .versions.find((v) => v.runs[0]?.id === run.id)!;
    expect(version.runs[0].attempts).toHaveLength(3);
    expect(version.runs[0].attempts.every((visit) => visit.nodeId.startsWith(a + '/'))).toBe(true);
    expect(version.nodes.filter((n) => n.subFlowId)).toHaveLength(2);
    await model.publish(
      acceptanceId,
      { ...definition, title: 'Revised child' },
      child.flowId,
      child.hash,
    );
    const replay = await model.start(acceptanceId, parent.flowId, undefined, run.id);
    expect((await roundPlan(replay.id)).flowSnapshots).toEqual(initial.flowSnapshots);
    expect((await roundPlan(replay.id)).plan).toEqual(initial.plan);
    const fresh = await model.start(acceptanceId, parent.flowId);
    expect(
      (await roundPlan(fresh.id)).flowSnapshots?.[0].nodes.find((n) => n.id === a)?.title,
    ).toBe('Revised child');
    await expect(
      model.publish(
        acceptanceId,
        {
          ...definition,
          nodes: [{ id: definition.entryNodeId, subFlowId: parent.flowId }],
          edges: [],
        },
        child.flowId,
        (await model.list(acceptanceId)).find((flow) => flow.id === child.flowId)!.hash,
      ),
    ).rejects.toThrow('Recursive subflow');
    const [otherAcceptance] = await db
      .insert(acceptances)
      .values({ userId: owner, subjectType: 'standalone', subjectId: randomUUID() })
      .returning();
    await expect(model.publish(otherAcceptance.id, parentDefinition)).rejects.toThrow(
      'same acceptance',
    );
  });

  it('rejects unreachable nodes and missing entry points', () => {
    expect(() => validateFlow({ ...definition, entryNodeId: randomUUID() })).toThrow('Entry node');
    expect(() => validateFlow({ ...definition, edges: [] })).toThrow('Unreachable');
  });
});
