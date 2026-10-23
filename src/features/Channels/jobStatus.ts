import type { ChannelPublicJob } from '@lobechat/types';

export const channelJobStatus = (job: ChannelPublicJob) =>
  job.publicationRevoked && job.writerHeld
    ? 'status.stopping'
    : job.status === 'queued' && job.blockedCode
      ? (`blocked.${job.blockedCode}` as const)
      : (`status.${job.status}` as const);
