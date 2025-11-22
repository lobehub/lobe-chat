import { QStashQueueServiceImpl } from './qstash';
import { SimpleQueueServiceImpl } from './simple';
import { QueueServiceImpl } from './type';

/**
 * Create queue service module
 * Automatically select QStash or simple queue implementation based on environment variables
 */
export const createQueueServiceModule = (): QueueServiceImpl => {
  // Check if QStash is configured
  const qstashToken = process.env.QSTASH_TOKEN;

  if (qstashToken) {
    return new QStashQueueServiceImpl({ qstashToken });
  }

  return new SimpleQueueServiceImpl();
};

export type { QueueServiceImpl } from './type';
