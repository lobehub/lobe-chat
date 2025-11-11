import { TRPCClientError } from '@trpc/client';
import { z } from 'zod';

import { LambdaRouter } from '@/server/routers/lambda';
import { BatchDownloadEventSchema } from '@/types/files';

export type BatchDownloadEventType = z.infer<typeof BatchDownloadEventSchema>;

export type TrpcSubscriptionCallback = {
  onComplete?: () => void;
  onData?: (data: BatchDownloadEventType) => void;
  onError?: (err: TRPCClientError<LambdaRouter>) => void;
};
