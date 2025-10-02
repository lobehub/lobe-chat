import debug from 'debug';

import { QStashQueueServiceImpl } from './qstash';
import { SimpleQueueServiceImpl } from './simple';
import { QueueServiceImpl } from './type';

const log = debug('lobe-server:service:queue:factory');

/**
 * Create queue service module
 * Automatically select QStash or simple queue implementation based on environment variables
 */
export const createQueueServiceModule = (): QueueServiceImpl => {
  // Check if QStash is configured
  const qstashToken = process.env.QSTASH_TOKEN;

  if (qstashToken) {
    log('Using QStash implementation');
    return new QStashQueueServiceImpl({ qstashToken });
  }

  log('Using Simple queue implementation');
  return new SimpleQueueServiceImpl();
};

export type { QueueServiceImpl } from './type';
