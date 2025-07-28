import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import { useTokenCount } from '@/hooks/useTokenCount';

const Tokens = memo<{ value: string }>(({ value }) => {
  const systemTokenCount = useTokenCount(value);
  if (!value || !systemTokenCount) return;

  return (
    <Tag
      style={{
        marginTop: 24,
        width: 'fit-content',
      }}
    >
      Token: {systemTokenCount}
    </Tag>
  );
});

export default Tokens;
