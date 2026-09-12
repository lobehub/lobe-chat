import { createHash } from 'node:crypto';

import debug from 'debug';

import { OtelQstashClient } from '@/libs/qstash';

import { type HealthCheckResult, type QueueMessage, type QueueStats } from '../types';
import { type QueueServiceImpl } from './type';

const log = debug('lobe-server:service:queue:qstash');

/**
 * Keep the logical execution key intact in durable state and local queues, but
 * encode it at the provider boundary. QStash rejects characters such as `:`;
 * a SHA-256 hex digest is deterministic, alphanumeric, and exactly 64 chars.
 */
const toQStashDeduplicationId = (logicalId: string): string =>
  createHash('sha256').update(logicalId).digest('hex');

/**
 * QStash's `delay` option is second-granularity — the `Duration` string form
 * (`10s`, `1m`, `2h`, `1d`) has no millisecond unit, and a bare number is
 * treated as seconds (so `100` would mean 100s, not 100ms). Positive
 * sub-second delays are rounded up to 1s.
 */
const toQStashDelaySeconds = (delayMs: number): number | undefined => {
  if (delayMs <= 0) return undefined;

  return Math.max(1, Math.round(delayMs / 1000));
};

/**
 * QStash rejects any single message above 10 MiB (`quota maxMessageSize
 * exceeded`) with a 500, so an oversized body used to fail the publish, throw
 * out of `executeStep` and kill the whole operation at a step boundary. The
 * budget leaves headroom for the envelope QStash adds around the body.
 */
const QSTASH_MAX_BODY_BYTES = 10 * 1024 * 1024;
const QSTASH_BODY_BUDGET_BYTES = 9 * 1024 * 1024;

/** What a single string may keep once the body has to be shrunk to fit. */
const OVERSIZED_STRING_KEEP = 25_000;

const byteLength = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');

/**
 * Shrink a too-large message body by clamping its long strings, depth-first.
 * Oversized bodies are always one or a few runaway strings — a tool result or
 * an error message carrying raw command output — never many small fields, so
 * clamping strings recovers the body while keeping its shape intact for the
 * worker that receives it.
 */
const clampOversizedStrings = (value: unknown): unknown => {
  if (typeof value === 'string') {
    if (value.length <= OVERSIZED_STRING_KEEP) return value;
    const omitted = value.length - OVERSIZED_STRING_KEEP;

    return `${value.slice(0, OVERSIZED_STRING_KEEP)}\n\n[Truncated: ${omitted.toLocaleString()} characters omitted so the step could be scheduled. Original length: ${value.length.toLocaleString()} characters]`;
  }

  if (Array.isArray(value)) return value.map(clampOversizedStrings);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        clampOversizedStrings(entry),
      ]),
    );
  }

  return value;
};

/**
 * QStash queue service implementation
 */
export class QStashQueueServiceImpl implements QueueServiceImpl {
  private config: { publishUrl?: string; qstashToken: string };

  constructor(config: { publishUrl?: string; qstashToken: string }) {
    if (!config.qstashToken) {
      throw new Error('QStash token is required for queue service');
    }

    this.config = config;
  }

  async scheduleMessage(message: QueueMessage): Promise<string> {
    const {
      operationId,
      stepIndex,
      context,
      deduplicationId,
      endpoint,
      payload,
      delay = 50,
      priority = 'normal',
      retryDelay,
      retries = 3,
    } = message;

    try {
      log('Initialized QStash queue service');
      const qstashClient = new OtelQstashClient({ token: this.config.qstashToken });
      const qstashDelay = toQStashDelaySeconds(delay);
      const request = {
        body: {
          context,
          operationId,
          payload,
          priority,
          stepIndex,
          timestamp: Date.now(),
        },
        ...(qstashDelay === undefined ? {} : { delay: qstashDelay }),
        ...(deduplicationId ? { deduplicationId: toQStashDeduplicationId(deduplicationId) } : {}),
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Operation-Id': operationId,
          'X-Agent-Priority': priority,
          'X-Agent-Step-Index': stepIndex.toString(),
        },
        retryDelay,
        retries,
        url: endpoint,
      };
      const response = await qstashClient.publishJSON(this.fitBodyToQuota(request, operationId));

      log(
        `[${operationId}] Scheduled step %d to %s with %dms delay (messageId: %s)`,
        stepIndex,
        endpoint,
        delay,
        'messageId' in response ? response.messageId : 'batch-message',
      );

      return 'messageId' in response ? response.messageId : `scheduled-${Date.now()}`;
    } catch (error) {
      log('Failed to schedule step %d for operation %s: %O', stepIndex, operationId, error);
      throw error;
    }
  }

  /**
   * Keep a step schedulable when its body outgrew the QStash message quota:
   * clamp the long strings rather than let the publish 500 and take the whole
   * operation down. The step still runs — it just sees a truncated copy of
   * whatever ran away (see `clampOversizedStrings`).
   */
  private fitBodyToQuota<T extends { body: unknown }>(request: T, operationId: string): T {
    const size = byteLength(request.body);
    if (size <= QSTASH_BODY_BUDGET_BYTES) return request;

    const body = clampOversizedStrings(request.body);
    const clampedSize = byteLength(body);

    console.warn(
      JSON.stringify({
        bytes: size,
        clampedBytes: clampedSize,
        event: 'agent.queue.oversized_message_clamped',
        fitsAfterClamp: clampedSize <= QSTASH_BODY_BUDGET_BYTES,
        limitBytes: QSTASH_MAX_BODY_BYTES,
        operationId,
      }),
    );

    return { ...request, body };
  }

  async scheduleBatchMessages(messages: QueueMessage[]): Promise<string[]> {
    try {
      // Use Promise.all for concurrent execution
      const messageIds = await Promise.all(
        messages.map((message) => this.scheduleMessage(message)),
      );

      log('Scheduled %d batch messages', messages.length);
      return messageIds;
    } catch (error) {
      log('Failed to schedule batch messages: %O', error);
      throw error;
    }
  }

  async cancelScheduledTask(messageId: string): Promise<void> {
    try {
      // QStash currently doesn't support task cancellation, can record to Redis as cancellation marker
      // Check this marker during actual execution
      log('Requested cancellation for message %s', messageId);

      // TODO: Implement cancellation logic, cancellation list can be stored via Redis
      // await this.redis.sadd('cancelled_tasks', messageId);
    } catch (error) {
      log('Failed to cancel task %s: %O', messageId, error);
      throw error;
    }
  }

  async getQueueStats(): Promise<QueueStats> {
    return {
      completedCount: 0,
      failedCount: 0,
      pendingCount: 0,
      processingCount: 0,
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    // Simple health check without sending actual messages
    return {
      healthy: true,
      message: 'QStash queue service is ready',
    };
  }
}
