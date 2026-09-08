// @vitest-environment node
import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import { acceptances, users, verifyCheckResults, verifyEvidence, verifyRuns } from '../../schemas';
import { AcceptanceFlowModel, projectFlowCheckResults, validateFlow } from '../acceptanceFlow';

const db = await getTestDB();
const owner = 'flow-test-owner';
const other = 'flow-test-other';
const model = new AcceptanceFlowModel(db, owner);
const definition = {
  title: 'Send and retry',
  goal: 'Recover from a failed send',
  preconditions: 'Signed in',
  entryNodeKey: 'ready',
  nodes: [
    { key: 'ready', title: 'Ready', instruction: 'Open chat', expected: 'Composer visible' },
    {
      key: 'failed',
      title: 'Failure shown',
      instruction: 'Send while offline',
      expected: 'Retry available',
    },
  ],
  edges: [
    { key: 'send', source: 'ready', target: 'failed', trigger: 'Send offline', required: true },
    { key: 'retry', source: 'failed', target: 'ready', trigger: 'Retry', required: true },
  ],
};
let acceptanceId: string;
let roundId: string;
beforeEach(async () => {
  await db.insert(users).values([{ id: owner }, { id: other }]);
  const [acceptance] = await db
    .insert(acceptances)
    .values({ userId: owner, subjectType: 'standalone', subjectId: randomUUID() })
    .returning();
  acceptanceId = acceptance.id;
  const [round] = await db
    .insert(verifyRuns)
    .values({ userId: owner, acceptanceId, roundIndex: 1 })
    .returning();
  roundId = round.id;
});
afterEach(async () => {
  await db.delete(users);
});

describe('AcceptanceFlowModel', () => {
  it('instantiates nodes only on start and reruns without carrying results', async () => {
    const published = await model.publish(acceptanceId, definition);
    expect(
      (await db.select().from(verifyRuns).where(eq(verifyRuns.id, roundId)))[0].plan,
    ).toBeNull();
    const first = await model.start(acceptanceId, published.versionId, roundId);
    await model.start(acceptanceId, published.versionId, roundId);
    const firstRound = (await db.select().from(verifyRuns).where(eq(verifyRuns.id, roundId)))[0];
    expect(firstRound.plan).toHaveLength(2);
    expect(firstRound.plan?.[0].sourceFlowNode?.versionId).toBe(published.versionId);
    await model.record(acceptanceId, {
      flowRunId: first.id,
      nodeKey: 'ready',
      requestId: 'first',
      verdict: 'passed',
      observation: 'First execution',
    });
    const second = await model.start(acceptanceId, published.versionId);
    expect(second.verifyRunId).not.toBe(first.verifyRunId);
    const secondRound = (
      await db.select().from(verifyRuns).where(eq(verifyRuns.id, second.verifyRunId))
    )[0];
    expect(secondRound.plan).toEqual(firstRound.plan);
    const flowData = await model.list(acceptanceId);
    expect(flowData[0].versions[0].runs[0].attempts).toEqual([]);
    const outcomes = projectFlowCheckResults(await db.select().from(verifyCheckResults), flowData);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].checkItemId).toBe(
      firstRound.plan?.find((item) => item.sourceFlowNode?.nodeKey === 'ready')?.id,
    );
    expect(outcomes[0].verifyRunId).toBe(first.verifyRunId);
    expect(outcomes[0].verdict).toBe('uncertain'); // required return branch has not run
  });

  it('publishes a complete graph before execution and preserves immutable versions', async () => {
    const first = await model.publish(acceptanceId, definition);
    const second = await model.publish(
      acceptanceId,
      { ...definition, title: 'Changed' },
      first.flowId,
    );
    const [flow] = await model.list(acceptanceId);
    expect(flow.versions.map((v) => v.title)).toEqual(['Changed', 'Send and retry']);
    expect(flow.versions[1].runs).toEqual([]);
    expect(flow.versions[1].edges).toHaveLength(2);
    expect(second.version).toBe(2);
  });
  it('keeps retries and refuses completion with uncovered branches', async () => {
    const version = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, version.versionId, roundId);
    const first = await model.record(acceptanceId, {
      flowRunId: run.id,
      nodeKey: 'ready',
      requestId: '1',
      verdict: 'passed',
      observation: 'Composer visible',
    });
    const failed = await model.record(acceptanceId, {
      flowRunId: run.id,
      nodeKey: 'failed',
      incomingEdgeKey: 'send',
      previousAttemptId: first.id,
      requestId: '2',
      verdict: 'failed',
      observation: 'Retry absent',
    });
    await expect(model.complete(acceptanceId, run.id)).rejects.toThrow('Required');
    await expect(
      model.record(acceptanceId, {
        flowRunId: run.id,
        nodeKey: 'ready',
        incomingEdgeKey: 'retry',
        previousAttemptId: failed.id,
        requestId: 'invalid',
        verdict: 'passed',
        observation: 'Ready',
      }),
    ).rejects.toThrow('Previous');
    const recovered = await model.record(acceptanceId, {
      flowRunId: run.id,
      nodeKey: 'failed',
      incomingEdgeKey: 'send',
      previousAttemptId: first.id,
      requestId: '3',
      verdict: 'passed',
      observation: 'Retry visible',
    });
    const final = {
      flowRunId: run.id,
      nodeKey: 'ready',
      incomingEdgeKey: 'retry',
      previousAttemptId: recovered.id,
      requestId: '4',
      verdict: 'passed' as const,
      observation: 'Recovered',
    };
    await model.record(acceptanceId, final);
    await model.record(acceptanceId, final);
    expect((await model.complete(acceptanceId, run.id)).status).toBe('completed');
    const [flow] = await model.list(acceptanceId);
    expect(flow.versions[0].runs[0].attempts.map((a) => a.verdict)).toEqual([
      'passed',
      'failed',
      'passed',
      'passed',
    ]);
    expect(flow.versions[0].runs[0].attempts[0].evidence[0].content).toBe('Composer visible');
    const outcomes = projectFlowCheckResults(await db.select().from(verifyCheckResults), [flow]);
    expect(
      outcomes.find((result) => result.checkItemId.endsWith(':ready'))?.toulmin?.evidence,
    ).toBe('Recovered');
    await model.review(acceptanceId, recovered.id, 'accepted', 'Checked', owner);
    const check = await db.query.verifyCheckResults.findFirst({
      where: eq(verifyCheckResults.id, recovered.checkResultId),
    });
    expect(check?.userDecision).toBe('accepted');
    expect(check?.userDecisionDetail).toMatchObject({ comment: 'Checked', decidedBy: owner });
    expect((await model.list(acceptanceId))[0].versions[0].runs[0].attempts[2].review).toBe(
      'accepted',
    );
  });
  it('persists circled feedback on its own evidence and rejects foreign evidence', async () => {
    const version = await model.publish(acceptanceId, definition);
    const run = await model.start(acceptanceId, version.versionId, roundId);
    const attempt = await model.record(acceptanceId, {
      flowRunId: run.id,
      nodeKey: 'ready',
      requestId: 'review',
      verdict: 'passed',
      observation: 'Shown',
    });
    const [evidence] = await db
      .insert(verifyEvidence)
      .values({
        checkResultId: attempt.checkResultId,
        userId: owner,
        type: 'screenshot',
        content: 'screen',
      })
      .returning();
    const annotation = {
      evidenceId: evidence.id,
      comment: 'Composer is clipped',
      rect: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
    };
    await model.review(acceptanceId, attempt.id, 'rejected', 'Please fix', owner, {
      annotations: [annotation],
    });
    const saved = (await model.list(acceptanceId))[0].versions[0].runs[0].attempts[0];
    expect(saved.reviewDetail?.annotations).toEqual([annotation]);
    await expect(
      model.review(acceptanceId, attempt.id, 'rejected', 'Invalid', owner, {
        annotations: [{ ...annotation, evidenceId: randomUUID() }],
      }),
    ).rejects.toThrow('this result screenshot');
    await expect(
      new AcceptanceFlowModel(db, other).review(acceptanceId, attempt.id, 'accepted', '', other),
    ).rejects.toThrow('not found');
  });
  it('isolates acceptances and prevents mixing rounds and graph versions', async () => {
    await expect(
      new AcceptanceFlowModel(db, other).publish(acceptanceId, definition),
    ).rejects.toThrow('not found');
    await expect(new AcceptanceFlowModel(db, other).list(acceptanceId)).rejects.toThrow(
      'not found',
    );
    const version = await model.publish(acceptanceId, definition);
    await expect(model.start(acceptanceId, version.versionId, randomUUID())).rejects.toThrow(
      'open verification',
    );
    const run = await model.start(acceptanceId, version.versionId, roundId);
    await expect(
      model.record(acceptanceId, {
        flowRunId: run.id,
        nodeKey: 'failed',
        requestId: 'bad',
        verdict: 'passed',
        observation: 'Skipped entry',
      }),
    ).rejects.toThrow('entry');
  });
  it('rejects dangling edges, duplicate keys and unreachable states before publishing', () => {
    expect(() => validateFlow({ ...definition, entryNodeKey: 'missing' })).toThrow('Entry');
    expect(() =>
      validateFlow({ ...definition, nodes: [...definition.nodes, definition.nodes[0]] }),
    ).toThrow('Duplicate');
    expect(() =>
      validateFlow({ ...definition, edges: [{ ...definition.edges[0], target: 'missing' }] }),
    ).toThrow('endpoint');
    expect(() => validateFlow({ ...definition, edges: [] })).toThrow('Unreachable');
  });
});
