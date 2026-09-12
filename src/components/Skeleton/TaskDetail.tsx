'use client';

import { Flexbox } from '@lobehub/ui';

import TaskDetailBodySkeleton from '@/features/AgentTasks/AgentTaskDetail/TaskDetailSkeleton';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import type { RouteSkeletonProps } from '@/spa/router/routeMeta';

const TaskDetailSkeleton = ({ chrome = 'page' }: RouteSkeletonProps) => (
  <Flexbox flex={1} height={'100%'}>
    {chrome !== 'body' && <NavHeader />}
    <Flexbox flex={1} style={{ minHeight: 0, overflowY: 'auto' }}>
      <WideScreenContainer>
        <TaskDetailBodySkeleton />
      </WideScreenContainer>
    </Flexbox>
  </Flexbox>
);

export default TaskDetailSkeleton;
