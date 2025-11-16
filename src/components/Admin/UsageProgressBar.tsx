'use client';

import { Progress } from 'antd';
import { memo } from 'react';

interface UsageProgressBarProps {
  current: number;
  limit: number;
  showPercentage?: boolean;
}

export const UsageProgressBar = memo<UsageProgressBarProps>(
  ({ current, limit, showPercentage = true }) => {
    const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
    const isWarning = percentage >= 80;
    const isDanger = percentage >= 95;

    const status = isDanger ? 'exception' : isWarning ? 'normal' : 'active';

    return (
      <div style={{ width: '100%' }}>
        <Progress
          percent={percentage}
          status={status}
          format={
            showPercentage
              ? (percent) => `${current.toLocaleString()} / ${limit.toLocaleString()} (${Math.round(percent || 0)}%)`
              : undefined
          }
        />
      </div>
    );
  },
);

UsageProgressBar.displayName = 'UsageProgressBar';
