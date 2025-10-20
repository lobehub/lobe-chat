import { Grid } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo } from 'react';

import { useUserMemoryStore } from '@/store/userMemory';

import MemoryCard from './MemoryCard';

const ContextsList = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { data: contexts, isLoading } = useUserMemoryStore((s) => s.useFetchContexts());

  if (isLoading) return <div>Loading contexts...</div>;

  if (!contexts || contexts.length === 0) {
    return <Empty description="No contexts found" />;
  }

  return (
    <Grid gap={16} rows={mobile ? 1 : 3}>
        {contexts.map((context) => {
          const labels = [
            ...(Array.isArray(context.labels) ? context.labels : []),
            ...(Array.isArray(context.extractedLabels) ? context.extractedLabels : []),
          ] as string[];

          return (
            <MemoryCard
              key={context.id}
              content={context.description || context.currentStatus}
              footer={
                <>
                  {context.scoreImpact !== null && <div>Impact: {context.scoreImpact}</div>}
                  {context.scoreUrgency !== null && <div>Urgency: {context.scoreUrgency}</div>}
                </>
              }
              labels={labels}
              title={context.title || 'Untitled Context'}
              type={context.type || 'Context'}
            />
          );
        })}
    </Grid>
  );
});

export default ContextsList;
