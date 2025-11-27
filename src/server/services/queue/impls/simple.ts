import debug from 'debug';

import { HealthCheckResult, QueueMessage, QueueStats } from '../types';
import { QueueServiceImpl } from './type';

const log = debug('queue:simple');

/**
 * Simplified queue service implementation for scenarios not using QStash
 */
export class SimpleQueueServiceImpl implements QueueServiceImpl {
  // eslint-disable-next-line no-undef
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  async scheduleMessage(message: QueueMessage): Promise<string> {
    const { sessionId, stepIndex, context, endpoint, payload, delay = 1000 } = message;

    const taskId = `${sessionId}_${stepIndex}_${Date.now()}`;

    const timeout = setTimeout(async () => {
      try {
        // Directly call execution endpoint
        const response = await fetch(endpoint, {
          body: JSON.stringify({
            context,
            payload,
            sessionId,
            stepIndex,
            timestamp: Date.now(),
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        log('Executed step %d for session %s to endpoint %s', stepIndex, sessionId, endpoint);
      } catch (error) {
        log('Failed to execute step %d for session %s: %O', stepIndex, sessionId, error);
      } finally {
        this.timeouts.delete(taskId);
      }
    }, delay);

    this.timeouts.set(taskId, timeout);

    log('Scheduled step %d for session %s to %s with %dms delay', stepIndex, sessionId, endpoint, delay);

    return taskId;
  }

  async scheduleBatchMessages(messages: QueueMessage[]): Promise<string[]> {
    const taskIds: string[] = [];

    try {
      for (const message of messages) {
        const taskId = await this.scheduleMessage(message);
        taskIds.push(taskId);
      }

      log('Scheduled %d batch messages', messages.length);
      return taskIds;
    } catch (error) {
      log('Failed to schedule batch messages: %O', error);
      throw error;
    }
  }

  async cancelScheduledTask(taskId: string): Promise<void> {
    const timeout = this.timeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
      log('Cancelled task %s', taskId);
    }
  }

  async getQueueStats(): Promise<QueueStats> {
    return {
      completedCount: 0,
      failedCount: 0,
      pendingCount: this.timeouts.size,
      processingCount: 0,
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      healthy: true,
      message: `Simple queue service healthy, ${this.timeouts.size} pending tasks`,
    };
  }
}
