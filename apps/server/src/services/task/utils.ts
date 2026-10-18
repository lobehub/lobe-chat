import type { TaskItem } from '@lobechat/types';
import { TRPCError } from '@trpc/server';

import type { AiAgentService } from '../aiAgent';
import type { TaskServiceDeps } from './deps';

export const interruptTaskOperation = async (service: AiAgentService, operationId: string) => {
  const result = await service.interruptTask({ operationId });
  if (!result.success || result.deviceCancellationConfirmed === false) {
    throw new TRPCError({
      code: 'CONFLICT',
      message:
        'Task interruption was not confirmed. The execution remains active; retry stopping it before starting another attempt.',
    });
  }
};

export async function resolveTaskOrThrow(
  deps: Pick<TaskServiceDeps, 'taskModel'>,
  idOrIdentifier: string,
): Promise<TaskItem> {
  const task = await deps.taskModel.resolve(idOrIdentifier);
  if (!task) throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
  return task;
}
