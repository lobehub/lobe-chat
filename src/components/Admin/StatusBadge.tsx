'use client';

import { Tag } from 'antd';
import { type UserStatus } from '@lobechat/types';
import { memo } from 'react';

interface StatusBadgeProps {
  status: UserStatus;
}

const STATUS_CONFIG = {
  active: { color: 'success', label: 'Aktiven' },
  banned: { color: 'error', label: 'Blokiran' },
  pending: { color: 'warning', label: 'Čaka na odobritev' },
  suspended: { color: 'orange', label: 'Suspendiran' },
} as const;

export const StatusBadge = memo<StatusBadgeProps>(({ status }) => {
  const config = STATUS_CONFIG[status];

  return <Tag color={config.color}>{config.label}</Tag>;
});

StatusBadge.displayName = 'StatusBadge';
