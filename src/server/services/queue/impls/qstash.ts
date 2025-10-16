import { Client } from '@upstash/qstash';
import debug from 'debug';

import { HealthCheckResult, QueueMessage, QueueStats } from '../types';
import { QueueServiceImpl } from './type';

const log = debug('lobe-server:service:queue:qstash');

/**
 * QStash queue service implementation
 */
export class QStashQueueServiceImpl implements QueueServiceImpl {
  private qstashClient: Client;

  constructor(config: { publishUrl?: string; qstashToken: string }) {
    if (!config.qstashToken) {
      throw new Error('QStash token is required for queue service');
    }

    this.qstashClient = new Client({ token: config.qstashToken });
    log('Initialized QStash queue service');
  }

  async scheduleMessage(message: QueueMessage): Promise<string> {
    const {
      sessionId,
      stepIndex,
      context,
      endpoint,
      payload,
      delay = 50,
      priority = 'normal',
      retries = 3,
    } = message;

    try {
      const response = await this.qstashClient.publishJSON({
        body: {
          context,
          payload,
          priority,
          sessionId,
          stepIndex,
          timestamp: Date.now(),
        },
        delay: Math.ceil(delay / 1000), // 将毫秒转换为秒
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Priority': priority,
          'X-Agent-Session-Id': sessionId,
          'X-Agent-Step-Index': stepIndex.toString(),
        },
        retries,
        url: endpoint,
      });

      log(
        `[${sessionId}] Scheduled step %d to %s with %dms delay (messageId: %s)`,
        stepIndex,
        endpoint,
        delay,
        'messageId' in response ? response.messageId : 'batch-message',
      );

      return 'messageId' in response ? response.messageId : `scheduled-${Date.now()}`;
    } catch (error) {
      log('Failed to schedule step %d for session %s: %O', stepIndex, sessionId, error);
      throw error;
    }
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

      // TODO: Implement cancellation logic, can store cancellation list via Redis
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
