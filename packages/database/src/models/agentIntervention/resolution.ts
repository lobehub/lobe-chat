import type { AgentInterventionSource } from '@lobechat/types';
import { and, asc, eq, gt, isNull, lte, sql } from 'drizzle-orm';

import {
  type AgentInterventionItem,
  type AgentInterventionResolutionItem,
  agentInterventionResolutions,
  agentInterventions,
  agentOperations,
} from '../../schemas';
import type { Transaction } from '../../type';
import {
  AGENT_INTERVENTION_IDENTITY_CONFLICT,
  AGENT_INTERVENTION_SOURCE_TRANSITION_MISMATCH,
  UUID_PATTERN,
} from './constants';
import { type AgentInterventionContext, resolutionOwnership } from './context';
import { rollbackArgumentEffect, rollbackRememberEffect } from './effects';
import type { AgentInterventionBatchMutationResult } from './types';
import { terminalStatusForAction } from './utils';

export const markResolutionPublished = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  publishedAt = new Date(),
): Promise<AgentInterventionBatchMutationResult> =>
  transitionResolution(ctx, resolutionRequestId, async (tx, resolution, rows) => {
    if (resolution.status === 'published' || resolution.status === 'completed') {
      return { interventions: rows, outcome: 'idempotent', resolution };
    }
    if (resolution.status !== 'resolving') {
      return { interventions: rows, outcome: 'conflict', resolution };
    }

    const [updatedResolution] = await tx
      .update(agentInterventionResolutions)
      .set({
        publishedAt,
        status: 'published',
        updatedAt: publishedAt,
        version: sql`${agentInterventionResolutions.version} + 1`,
      })
      .where(
        and(
          eq(agentInterventionResolutions.id, resolution.id),
          eq(agentInterventionResolutions.status, 'resolving'),
        ),
      )
      .returning();
    const updatedRows = await tx
      .update(agentInterventions)
      .set({
        publishedAt,
        status: 'published',
        updatedAt: publishedAt,
        version: sql`${agentInterventions.version} + 1`,
      })
      .where(
        and(
          eq(agentInterventions.resolutionId, resolution.id),
          eq(agentInterventions.status, 'resolving'),
        ),
      )
      .returning();
    return { interventions: updatedRows, outcome: 'applied', resolution: updatedResolution };
  });

/** Publish failed before consumption; conditionally reopens only this claim. */
export const rollbackResolution = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
): Promise<AgentInterventionBatchMutationResult> =>
  transitionResolution(ctx, resolutionRequestId, async (tx, resolution, rows) => {
    if (resolution.status === 'rolled_back') {
      return { interventions: rows, outcome: 'idempotent', resolution };
    }
    if (resolution.status !== 'resolving') {
      return { interventions: rows, outcome: 'conflict', resolution };
    }
    if (
      resolution.action.type === 'submit_custom' &&
      resolution.customExecutionState !== null &&
      resolution.customExecutionState !== 'pending'
    ) {
      return { interventions: rows, outcome: 'conflict', resolution };
    }

    const now = new Date();
    const argumentRollback = await rollbackArgumentEffect(ctx, tx, resolution, rows);
    const rememberEffectStatus = await rollbackRememberEffect(ctx, tx, resolution);
    const [updatedResolution] = await tx
      .update(agentInterventionResolutions)
      .set({
        argumentEffectStatus: argumentRollback.status,
        rememberEffectStatus,
        rolledBackAt: now,
        status: 'rolled_back',
        updatedAt: now,
        version: sql`${agentInterventionResolutions.version} + 1`,
      })
      .where(eq(agentInterventionResolutions.id, resolution.id))
      .returning();

    const updatedRows = await tx
      .update(agentInterventions)
      .set({
        requestRevisionHash: argumentRollback.requestRevisionHash,
        resolutionId: null,
        resolvingAt: null,
        status: 'pending',
        updatedAt: now,
        version: sql`${agentInterventions.version} + 1`,
      })
      .where(
        and(
          eq(agentInterventions.resolutionId, resolution.id),
          eq(agentInterventions.status, 'resolving'),
          gt(agentInterventions.deadline, now),
        ),
      )
      .returning();
    const expiredRows = await tx
      .update(agentInterventions)
      .set({
        requestRevisionHash: argumentRollback.requestRevisionHash,
        resolutionId: null,
        resolvedAt: now,
        resolvingAt: null,
        status: 'timed_out',
        updatedAt: now,
        version: sql`${agentInterventions.version} + 1`,
      })
      .where(
        and(
          eq(agentInterventions.resolutionId, resolution.id),
          eq(agentInterventions.status, 'resolving'),
          lte(agentInterventions.deadline, now),
        ),
      )
      .returning();
    return {
      interventions: [...updatedRows, ...expiredRows].sort(
        (left, right) => left.itemIndex - right.itemIndex,
      ),
      outcome: 'applied',
      resolution: updatedResolution,
    };
  });

/** Runtime rows become terminal once the continuation has durably started. */
export const completeRuntimeResolution = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  continuationStartedAt = new Date(),
): Promise<AgentInterventionBatchMutationResult> =>
  completeResolution(ctx, resolutionRequestId, 'runtime', continuationStartedAt);

/** Heterogeneous rows become terminal only after the matching producer ACK. */
export const acknowledgeProducerResolution = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  producerAckAt = new Date(),
): Promise<AgentInterventionBatchMutationResult> =>
  completeResolution(ctx, resolutionRequestId, 'heterogeneous', producerAckAt);

/** Late heterogeneous ACK is audited without overwriting timeout/session outcome. */
export const recordProducerAck = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  producerAckAt = new Date(),
): Promise<AgentInterventionBatchMutationResult> =>
  transitionResolution(ctx, resolutionRequestId, async (tx, resolution, rows) => {
    if (resolution.source !== 'heterogeneous') {
      throw new Error(AGENT_INTERVENTION_SOURCE_TRANSITION_MISMATCH);
    }
    if (resolution.producerAckAt) {
      return { interventions: rows, outcome: 'idempotent', resolution };
    }
    if (!['timed_out', 'session_ended'].includes(resolution.status)) {
      return { interventions: rows, outcome: 'conflict', resolution };
    }
    const [updatedResolution] = await tx
      .update(agentInterventionResolutions)
      .set({
        producerAckAt,
        updatedAt: producerAckAt,
        version: sql`${agentInterventionResolutions.version} + 1`,
      })
      .where(eq(agentInterventionResolutions.id, resolution.id))
      .returning();
    const updatedRows = await tx
      .update(agentInterventions)
      .set({
        producerAckAt,
        updatedAt: producerAckAt,
        version: sql`${agentInterventions.version} + 1`,
      })
      .where(eq(agentInterventions.resolutionId, resolution.id))
      .returning();
    return { interventions: updatedRows, outcome: 'applied', resolution: updatedResolution };
  });

export const findResolutionByRequestId = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
): Promise<AgentInterventionResolutionItem | undefined> => {
  if (!UUID_PATTERN.test(resolutionRequestId)) return undefined;
  const [row] = await ctx.db
    .select()
    .from(agentInterventionResolutions)
    .where(
      and(
        eq(agentInterventionResolutions.resolutionRequestId, resolutionRequestId),
        resolutionOwnership(ctx),
      ),
    )
    .limit(1);
  return row;
};

export const retireResolvedRuntimeOperation = async (
  ctx: AgentInterventionContext,
  tx: Transaction,
  resolution: AgentInterventionResolutionItem,
  at: Date,
): Promise<void> => {
  if (resolution.action.type === 'stop' || resolution.action.type === 'cancel_interaction') {
    return;
  }
  const completedOperation = await tx
    .update(agentOperations)
    .set({ completedAt: at, completionReason: 'done', status: 'done' })
    .where(
      and(
        eq(agentOperations.id, resolution.operationId),
        eq(agentOperations.status, 'waiting_for_human'),
        eq(agentOperations.userId, ctx.userId),
        ctx.workspaceId
          ? eq(agentOperations.workspaceId, ctx.workspaceId)
          : isNull(agentOperations.workspaceId),
      ),
    )
    .returning({ id: agentOperations.id });
  if (completedOperation.length > 0) return;

  const [operation] = await tx
    .select({ status: agentOperations.status })
    .from(agentOperations)
    .where(
      and(
        eq(agentOperations.id, resolution.operationId),
        eq(agentOperations.userId, ctx.userId),
        ctx.workspaceId
          ? eq(agentOperations.workspaceId, ctx.workspaceId)
          : isNull(agentOperations.workspaceId),
      ),
    )
    .limit(1);
  if (operation?.status !== 'done') {
    throw new Error(AGENT_INTERVENTION_IDENTITY_CONFLICT);
  }
};

export const completeResolution = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  source: AgentInterventionSource,
  at: Date,
): Promise<AgentInterventionBatchMutationResult> =>
  transitionResolution(
    ctx,
    resolutionRequestId,
    async (tx, resolution, rows) => {
      if (resolution.source !== source) {
        throw new Error(AGENT_INTERVENTION_SOURCE_TRANSITION_MISMATCH);
      }
      const terminalResolutionStatus = source === 'runtime' ? 'completed' : 'acknowledged';
      if (resolution.status === terminalResolutionStatus) {
        if (source === 'runtime') {
          await retireResolvedRuntimeOperation(ctx, tx, resolution, at);
        }
        return { interventions: rows, outcome: 'idempotent', resolution };
      }
      if (resolution.status !== 'published') {
        return { interventions: rows, outcome: 'conflict', resolution };
      }
      const [updatedResolution] = await tx
        .update(agentInterventionResolutions)
        .set({
          continuationStartedAt: source === 'runtime' ? at : undefined,
          producerAckAt: source === 'heterogeneous' ? at : undefined,
          status: terminalResolutionStatus,
          terminalAt: at,
          updatedAt: at,
          version: sql`${agentInterventionResolutions.version} + 1`,
        })
        .where(eq(agentInterventionResolutions.id, resolution.id))
        .returning();
      const updatedRows = await tx
        .update(agentInterventions)
        .set({
          producerAckAt: source === 'heterogeneous' ? at : undefined,
          resolvedAt: at,
          status: terminalStatusForAction(resolution.action),
          updatedAt: at,
          version: sql`${agentInterventions.version} + 1`,
        })
        .where(
          and(
            eq(agentInterventions.resolutionId, resolution.id),
            eq(agentInterventions.status, 'published'),
          ),
        )
        .returning();
      if (source === 'runtime') {
        await retireResolvedRuntimeOperation(ctx, tx, resolution, at);
      }
      return { interventions: updatedRows, outcome: 'applied', resolution: updatedResolution };
    },
    { lockOperation: source === 'runtime' },
  );

export const transitionResolution = async (
  ctx: AgentInterventionContext,
  resolutionRequestId: string,
  transition: (
    tx: Transaction,
    resolution: AgentInterventionResolutionItem,
    rows: AgentInterventionItem[],
  ) => Promise<AgentInterventionBatchMutationResult>,
  options?: { lockOperation?: boolean },
): Promise<AgentInterventionBatchMutationResult> =>
  ctx.db.transaction(async (tx) => {
    const [candidate] = await tx
      .select({
        id: agentInterventionResolutions.id,
        operationId: agentInterventionResolutions.operationId,
      })
      .from(agentInterventionResolutions)
      .where(
        and(
          eq(agentInterventionResolutions.resolutionRequestId, resolutionRequestId),
          resolutionOwnership(ctx),
        ),
      )
      .limit(1);
    if (!candidate) return { outcome: 'not_found' };

    if (options?.lockOperation) {
      const [operation] = await tx
        .select({ id: agentOperations.id })
        .from(agentOperations)
        .where(
          and(
            eq(agentOperations.id, candidate.operationId),
            eq(agentOperations.userId, ctx.userId),
            ctx.workspaceId
              ? eq(agentOperations.workspaceId, ctx.workspaceId)
              : isNull(agentOperations.workspaceId),
          ),
        )
        .limit(1)
        .for('update');
      if (!operation) return { outcome: 'not_found' };
    }

    // Batch terminal transitions lock intervention rows before their linked
    // resolutions. Preserve that order here to avoid timeout/ACK deadlocks.
    const rows = await tx
      .select()
      .from(agentInterventions)
      .where(eq(agentInterventions.resolutionId, candidate.id))
      .orderBy(asc(agentInterventions.itemIndex))
      .for('update');
    const [resolution] = await tx
      .select()
      .from(agentInterventionResolutions)
      .where(and(eq(agentInterventionResolutions.id, candidate.id), resolutionOwnership(ctx)))
      .limit(1)
      .for('update');
    if (!resolution) return { outcome: 'not_found' };
    return transition(tx, resolution, rows);
  });
