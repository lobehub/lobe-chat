import { SpotlightCard } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';

const Loading = memo<{ num?: number }>(({ num = 16 }) => {
  return (
    <SpotlightCard
      items={Array.from({ length: num })
        .fill('')
        .map((_, index) => index)}
      renderItem={(index) => (
        <div style={{ padding: 16 }}>
          <Skeleton active={index < 4} />
        </div>
      )}
    />
  );
});

export default Loading;
