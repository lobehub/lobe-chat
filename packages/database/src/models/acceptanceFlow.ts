import { randomUUID } from 'node:crypto';

import type {
  AcceptanceFlowDefinition,
  AcceptanceFlowReview,
  AcceptanceFlowVerdict,
  AcceptanceReviewAnnotation,
  VerifyCheckItem,
} from '@lobechat/types';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import {
  acceptanceFlowEdges as edges,
  acceptanceFlowNodes as nodes,
  acceptanceFlowRuns as runs,
  acceptanceFlows as flows,
  acceptanceFlowStepAttempts as attempts,
  acceptanceFlowVersions as versions,
} from '../schemas/acceptanceFlow';
import { acceptances, verifyCheckResults, verifyEvidence, verifyRuns } from '../schemas/verify';
import type { LobeChatDatabase } from '../type';

export function validateFlow(definition: AcceptanceFlowDefinition) {
  const nodeKeys = new Set(definition.nodes.map((n) => n.key));
  if (nodeKeys.size !== definition.nodes.length) throw new Error('Duplicate node keys');
  if (!nodeKeys.has(definition.entryNodeKey)) throw new Error('Entry node not found');
  if (new Set(definition.edges.map((e) => e.key)).size !== definition.edges.length)
    throw new Error('Duplicate edge keys');
  for (const edge of definition.edges) {
    if (!nodeKeys.has(edge.source) || !nodeKeys.has(edge.target))
      throw new Error('Unknown edge endpoint');
  }
  const reached = new Set([definition.entryNodeKey]);
  for (let changed = true; changed;) {
    changed = false;
    for (const edge of definition.edges)
      if (reached.has(edge.source) && !reached.has(edge.target)) {
        reached.add(edge.target);
        changed = true;
      }
  }
  if (reached.size !== nodeKeys.size) throw new Error('Unreachable nodes');
}

/** Access is inherited from the acceptance; the router binds the authorized owner. */
export class AcceptanceFlowModel {
  constructor(
    private db: LobeChatDatabase,
    private userId: string,
  ) {}

  private async owned(acceptanceId: string, database: Pick<LobeChatDatabase, 'select'> = this.db) {
    const [row] = await database
      .select()
      .from(acceptances)
      .where(and(eq(acceptances.id, acceptanceId), eq(acceptances.userId, this.userId)));
    if (!row) throw new Error('Acceptance not found');
    return row;
  }

  async publish(acceptanceId: string, definition: AcceptanceFlowDefinition, flowId?: string) {
    validateFlow(definition);
    await this.owned(acceptanceId);
    return this.db.transaction(async (tx) => {
      const [acceptance] = await tx
        .select()
        .from(acceptances)
        .where(eq(acceptances.id, acceptanceId))
        .for('update');
      if (['accepted', 'closed'].includes(acceptance.status))
        throw new Error('Reopen acceptance before publishing');
      let flow;
      if (flowId) {
        [flow] = await tx
          .select()
          .from(flows)
          .where(and(eq(flows.id, flowId), eq(flows.acceptanceId, acceptanceId)));
        if (!flow) throw new Error('Flow not found');
      } else {
        [flow] = await tx
          .insert(flows)
          .values({ acceptanceId, title: definition.title })
          .returning();
      }
      const [last] = await tx
        .select()
        .from(versions)
        .where(eq(versions.flowId, flow.id))
        .orderBy(desc(versions.version))
        .limit(1);
      const [version] = await tx
        .insert(versions)
        .values({
          flowId: flow.id,
          version: (last?.version ?? 0) + 1,
          title: definition.title,
          goal: definition.goal,
          preconditions: definition.preconditions,
          entryNodeKey: definition.entryNodeKey,
        })
        .returning();
      await tx.insert(nodes).values(
        definition.nodes.map(({ key, ...node }) => ({
          ...node,
          flowVersionId: version.id,
          nodeKey: key,
        })),
      );
      if (definition.edges.length)
        await tx.insert(edges).values(
          definition.edges.map(({ key, source, target, ...edge }) => ({
            ...edge,
            flowVersionId: version.id,
            edgeKey: key,
            sourceNodeKey: source,
            targetNodeKey: target,
          })),
        );
      return { flowId: flow.id, versionId: version.id, version: version.version };
    });
  }

  async list(acceptanceId: string) {
    await this.owned(acceptanceId);
    const flowRows = await this.db
      .select()
      .from(flows)
      .where(eq(flows.acceptanceId, acceptanceId))
      .orderBy(asc(flows.createdAt));
    return Promise.all(
      flowRows.map(async (flow) => {
        const versionRows = await this.db
          .select()
          .from(versions)
          .where(eq(versions.flowId, flow.id))
          .orderBy(desc(versions.version));
        return {
          ...flow,
          versions: await Promise.all(
            versionRows.map(async (version) => {
              const [nodeRows, edgeRows, runRows] = await Promise.all([
                this.db.select().from(nodes).where(eq(nodes.flowVersionId, version.id)),
                this.db.select().from(edges).where(eq(edges.flowVersionId, version.id)),
                this.db
                  .select()
                  .from(runs)
                  .where(eq(runs.flowVersionId, version.id))
                  .orderBy(desc(runs.createdAt)),
              ]);
              return {
                ...version,
                nodes: nodeRows,
                edges: edgeRows,
                runs: await Promise.all(
                  runRows.map(async (run) => {
                    const visits = await this.db
                      .select()
                      .from(attempts)
                      .where(eq(attempts.flowRunId, run.id))
                      .orderBy(asc(attempts.sequence));
                    const evidence = visits.length
                      ? await this.db
                          .select()
                          .from(verifyEvidence)
                          .where(
                            inArray(
                              verifyEvidence.checkResultId,
                              visits.map((v) => v.checkResultId),
                            ),
                          )
                      : [];
                    const results = visits.length
                      ? await this.db
                          .select()
                          .from(verifyCheckResults)
                          .where(
                            inArray(
                              verifyCheckResults.id,
                              visits.map((v) => v.checkResultId),
                            ),
                          )
                      : [];
                    const resultById = new Map(results.map((result) => [result.id, result]));
                    return {
                      ...run,
                      attempts: visits.map((visit) => ({
                        ...visit,
                        reviewComment:
                          resultById.get(visit.checkResultId)?.userDecisionDetail?.comment ?? null,
                        review:
                          resultById.get(visit.checkResultId)?.userDecision === 'accepted'
                            ? ('accepted' as const)
                            : resultById.get(visit.checkResultId)?.userDecision === 'rejected'
                              ? ('rejected' as const)
                              : null,
                        reviewDetail:
                          resultById.get(visit.checkResultId)?.userDecisionDetail ?? null,
                        evidence: evidence.filter((e) => e.checkResultId === visit.checkResultId),
                      })),
                    };
                  }),
                ),
              };
            }),
          ),
        };
      }),
    );
  }

  private async version(
    acceptanceId: string,
    versionId: string,
    database: Pick<LobeChatDatabase, 'select'> = this.db,
  ) {
    await this.owned(acceptanceId, database);
    const [row] = await database
      .select({ version: versions })
      .from(versions)
      .innerJoin(flows, eq(flows.id, versions.flowId))
      .where(and(eq(versions.id, versionId), eq(flows.acceptanceId, acceptanceId)));
    if (!row) throw new Error('Flow version not found');
    return row.version;
  }

  async start(acceptanceId: string, versionId: string, verifyRunId?: string) {
    const version = await this.version(acceptanceId, versionId);
    return this.db.transaction(async (tx) => {
      const [acceptance] = await tx
        .select()
        .from(acceptances)
        .where(eq(acceptances.id, acceptanceId))
        .for('update');
      if (acceptance.status === 'closed' || (verifyRunId && acceptance.status === 'accepted'))
        throw new Error('Acceptance is closed');
      if (!verifyRunId) {
        const [last] = await tx
          .select()
          .from(verifyRuns)
          .where(eq(verifyRuns.acceptanceId, acceptanceId))
          .orderBy(desc(verifyRuns.roundIndex))
          .limit(1);
        const [created] = await tx
          .insert(verifyRuns)
          .values({
            acceptanceId,
            userId: acceptance.userId,
            workspaceId: acceptance.workspaceId,
            roundIndex: (last?.roundIndex ?? 0) + 1,
            title: version.title,
            status: 'planned',
          })
          .returning();
        verifyRunId = created.id;
      }
      const [round] = await tx
        .select()
        .from(verifyRuns)
        .where(and(eq(verifyRuns.id, verifyRunId), eq(verifyRuns.acceptanceId, acceptanceId)));
      if (!round || round.userDecision) throw new Error('An open verification round is required');
      const [run] = await tx
        .insert(runs)
        .values({ flowVersionId: versionId, verifyRunId })
        .onConflictDoNothing()
        .returning();
      if (run) {
        if (round.plan?.some((item) => item.sourceFlowNode?.flowId === version.flowId))
          throw new Error('This flow already belongs to the verification round');
        const graphNodes = await tx.select().from(nodes).where(eq(nodes.flowVersionId, versionId));
        const graphEdges = await tx.select().from(edges).where(eq(edges.flowVersionId, versionId));
        const plan: VerifyCheckItem[] = graphNodes.map((node, index) => ({
          id: `${version.flowId}:${node.nodeKey}`,
          index: (round.plan?.length ?? 0) + index,
          title: node.title,
          category: version.title,
          description: node.instruction,
          required:
            node.nodeKey === version.entryNodeKey ||
            graphEdges.some((edge) => edge.targetNodeKey === node.nodeKey && edge.required),
          onFail: 'manual',
          verifierType: 'agent',
          verifierConfig: { method: node.instruction, expected: node.expected },
          sourceFlowNode: {
            flowId: version.flowId,
            versionId,
            nodeId: node.id,
            nodeKey: node.nodeKey,
          },
        }));
        await tx
          .update(verifyRuns)
          .set({ plan: [...(round.plan ?? []), ...plan] })
          .where(eq(verifyRuns.id, verifyRunId));
        await tx
          .update(acceptances)
          .set({ status: 'planned', completedAt: null })
          .where(eq(acceptances.id, acceptanceId));
        return run;
      }
      const [existing] = await tx
        .select()
        .from(runs)
        .where(and(eq(runs.flowVersionId, versionId), eq(runs.verifyRunId, verifyRunId)));
      return existing;
    });
  }

  async record(
    acceptanceId: string,
    input: {
      flowRunId: string;
      nodeKey: string;
      incomingEdgeKey?: string;
      previousAttemptId?: string;
      requestId: string;
      observation: string;
      verdict: AcceptanceFlowVerdict;
    },
  ) {
    const acceptance = await this.owned(acceptanceId);
    return this.db.transaction(async (tx) => {
      const [run] = await tx.select().from(runs).where(eq(runs.id, input.flowRunId)).for('update');
      if (!run) throw new Error('Flow run not found');
      await this.version(acceptanceId, run.flowVersionId, tx);
      const [existing] = await tx
        .select()
        .from(attempts)
        .where(and(eq(attempts.flowRunId, run.id), eq(attempts.requestId, input.requestId)));
      if (existing) {
        const [existingNode] = await tx.select().from(nodes).where(eq(nodes.id, existing.nodeId));
        const [existingEdge] = existing.incomingEdgeId
          ? await tx.select().from(edges).where(eq(edges.id, existing.incomingEdgeId))
          : [];
        if (
          existing.observation !== input.observation ||
          existing.verdict !== input.verdict ||
          existingNode.nodeKey !== input.nodeKey ||
          (existingEdge?.edgeKey ?? undefined) !== input.incomingEdgeKey ||
          (existing.previousAttemptId ?? undefined) !== input.previousAttemptId
        )
          throw new Error('Request id already used');
        return existing;
      }
      if (run.status !== 'running') throw new Error('Flow run is complete');
      const [round] = await tx.select().from(verifyRuns).where(eq(verifyRuns.id, run.verifyRunId));
      if (round.userDecision || ['accepted', 'closed'].includes(acceptance.status))
        throw new Error('Acceptance is closed');
      const [version] = await tx.select().from(versions).where(eq(versions.id, run.flowVersionId));
      const [node] = await tx
        .select()
        .from(nodes)
        .where(and(eq(nodes.flowVersionId, version.id), eq(nodes.nodeKey, input.nodeKey)));
      if (!node) throw new Error('Node not found');
      let edgeId: string | undefined;
      if (input.incomingEdgeKey) {
        const [edge] = await tx
          .select()
          .from(edges)
          .where(
            and(eq(edges.flowVersionId, version.id), eq(edges.edgeKey, input.incomingEdgeKey)),
          );
        const [previous] = input.previousAttemptId
          ? await tx
              .select({ attempt: attempts, node: nodes })
              .from(attempts)
              .innerJoin(nodes, eq(nodes.id, attempts.nodeId))
              .where(and(eq(attempts.id, input.previousAttemptId), eq(attempts.flowRunId, run.id)))
          : [];
        if (
          !edge ||
          edge.targetNodeKey !== node.nodeKey ||
          !previous ||
          previous.node.nodeKey !== edge.sourceNodeKey
        )
          throw new Error('Invalid path transition');
        if (previous.attempt.verdict !== 'passed')
          throw new Error('Previous state has not been verified');
        edgeId = edge.id;
      } else if (node.nodeKey !== version.entryNodeKey || input.previousAttemptId)
        throw new Error('A path must start at the entry node');
      const [last] = await tx
        .select()
        .from(attempts)
        .where(eq(attempts.flowRunId, run.id))
        .orderBy(desc(attempts.sequence))
        .limit(1);
      await tx
        .update(verifyRuns)
        .set({ status: 'collecting_evidence' })
        .where(eq(verifyRuns.id, run.verifyRunId));
      await tx
        .update(acceptances)
        .set({ status: 'verifying' })
        .where(eq(acceptances.id, acceptanceId));
      const attemptId = randomUUID();
      const [result] = await tx
        .insert(verifyCheckResults)
        .values({
          verifyRunId: run.verifyRunId,
          userId: acceptance.userId,
          workspaceId: acceptance.workspaceId,
          checkItemId: attemptId,
          checkItemTitle: node.title,
          verifierType: 'agent',
          status:
            input.verdict === 'passed'
              ? 'passed'
              : input.verdict === 'blocked'
                ? 'skipped'
                : 'failed',
          verdict: input.verdict === 'blocked' ? 'uncertain' : input.verdict,
          toulmin: { evidence: input.observation, reasoning: node.expected },
        })
        .returning();
      await tx.insert(verifyEvidence).values({
        checkResultId: result.id,
        userId: acceptance.userId,
        workspaceId: acceptance.workspaceId,
        type: 'text',
        content: input.observation,
        description: node.title,
        capturedBy: 'cli',
      });
      const [attempt] = await tx
        .insert(attempts)
        .values({
          id: attemptId,
          flowRunId: run.id,
          nodeId: node.id,
          incomingEdgeId: edgeId,
          previousAttemptId: input.previousAttemptId,
          requestId: input.requestId,
          sequence: (last?.sequence ?? 0) + 1,
          observation: input.observation,
          verdict: input.verdict,
          checkResultId: result.id,
        })
        .returning();
      return attempt;
    });
  }

  async complete(acceptanceId: string, flowRunId: string) {
    await this.owned(acceptanceId);
    return this.db.transaction(async (tx) => {
      const [run] = await tx.select().from(runs).where(eq(runs.id, flowRunId)).for('update');
      if (!run) throw new Error('Flow run not found');
      const version = await this.version(acceptanceId, run.flowVersionId, tx);
      const [graphEdges, graphNodes, visits] = await Promise.all([
        tx.select().from(edges).where(eq(edges.flowVersionId, version.id)),
        tx.select().from(nodes).where(eq(nodes.flowVersionId, version.id)),
        tx
          .select()
          .from(attempts)
          .where(eq(attempts.flowRunId, run.id))
          .orderBy(asc(attempts.sequence)),
      ]);
      const latest = new Map(visits.map((v) => [v.incomingEdgeId ?? 'entry', v]));
      const entry = graphNodes.find((n) => n.nodeKey === version.entryNodeKey);
      if (
        latest.get('entry')?.nodeId !== entry?.id ||
        latest.get('entry')?.verdict !== 'passed' ||
        graphEdges.some((e) => e.required && latest.get(e.id)?.verdict !== 'passed')
      )
        throw new Error('Required flow branches have not passed');
      const [updated] = await tx
        .update(runs)
        .set({ status: 'completed' })
        .where(eq(runs.id, run.id))
        .returning();
      const [round] = await tx.select().from(verifyRuns).where(eq(verifyRuns.id, run.verifyRunId));
      const siblings = await tx.select().from(runs).where(eq(runs.verifyRunId, run.verifyRunId));
      if (
        round.plan?.every((item) => item.sourceFlowNode) &&
        siblings.every((sibling) => sibling.status === 'completed')
      ) {
        await tx
          .update(verifyRuns)
          .set({ status: 'delivered' })
          .where(eq(verifyRuns.id, run.verifyRunId));
      }
      return updated;
    });
  }

  async review(
    acceptanceId: string,
    attemptId: string,
    review: AcceptanceFlowReview,
    comment: string,
    actor: string,
    feedback?: { annotations?: AcceptanceReviewAnnotation[]; fileIds?: string[] },
  ) {
    const data = await this.list(acceptanceId);
    const visit = data
      .flatMap((f) => f.versions.flatMap((v) => v.runs.flatMap((r) => r.attempts)))
      .find((a) => a.id === attemptId);
    if (!visit) throw new Error('Attempt not found');
    if (
      feedback?.annotations?.some(
        (annotation) =>
          !visit.evidence.some(
            (evidence) => evidence.id === annotation.evidenceId && evidence.type === 'screenshot',
          ),
      )
    )
      throw new Error('Annotation must reference this result screenshot');
    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(attempts)
        .set({ review, reviewComment: comment, reviewedBy: actor })
        .where(eq(attempts.id, attemptId))
        .returning();
      await tx
        .update(verifyCheckResults)
        .set({
          userDecision: review === 'accepted' ? 'accepted' : 'rejected',
          userDecisionDetail: {
            ...feedback,
            comment,
            decidedBy: actor,
            decidedAt: new Date().toISOString(),
          },
        })
        .where(eq(verifyCheckResults.id, visit.checkResultId));
      return updated;
    });
  }
}

/** Fold immutable path attempts into one check outcome per node per verification round. */
export function projectFlowCheckResults(
  results: (typeof verifyCheckResults.$inferSelect)[],
  flowData: Awaited<ReturnType<AcceptanceFlowModel['list']>>,
) {
  const attemptIds = new Set(
    flowData.flatMap((flow) =>
      flow.versions.flatMap((version) =>
        version.runs.flatMap((run) => run.attempts.map((attempt) => attempt.checkResultId)),
      ),
    ),
  );
  const byId = new Map(results.map((result) => [result.id, result]));
  const projected = results.filter((result) => !attemptIds.has(result.id));
  for (const flow of flowData)
    for (const version of flow.versions)
      for (const run of version.runs) {
        const latest = new Map(
          run.attempts.map((visit) => [visit.incomingEdgeId ?? 'entry', visit]),
        );
        for (const node of version.nodes) {
          const keys = version.edges
            .filter(
              (edge) =>
                edge.targetNodeKey === node.nodeKey && (edge.required || latest.has(edge.id)),
            )
            .map((edge) => edge.id);
          if (node.nodeKey === version.entryNodeKey) keys.push('entry');
          const visits = keys.map((key) => latest.get(key));
          const observed = visits
            .filter((visit) => visit !== undefined)
            .sort((a, b) => b.sequence - a.sequence);
          const failed = observed.find((visit) => visit.verdict === 'failed');
          const uncertain = observed.find((visit) => visit.verdict !== 'passed');
          const chosen = failed ?? uncertain ?? observed[0];
          if (!chosen) continue;
          const result = byId.get(chosen.checkResultId);
          if (!result) continue;
          const verdict = failed
            ? 'failed'
            : visits.every((visit) => visit?.verdict === 'passed')
              ? 'passed'
              : 'uncertain';
          projected.push({
            ...result,
            checkItemId: `${flow.id}:${node.nodeKey}`,
            checkItemTitle: node.title,
            verdict,
            status: verdict === 'passed' ? 'passed' : 'failed',
          });
        }
      }
  return projected;
}
