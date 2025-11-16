'use client';

import { Tag } from 'antd';
import { type SubscriptionTier } from '@lobechat/types';
import { Crown, Sparkles, User } from 'lucide-react';
import { memo } from 'react';

interface TierBadgeProps {
  tier: SubscriptionTier;
}

const TIER_CONFIG = {
  basic: { color: 'blue', icon: User, label: 'Basic' },
  free: { color: 'default', icon: User, label: 'Free' },
  pro: { color: 'gold', icon: Crown, label: 'Pro' },
} as const;

export const TierBadge = memo<TierBadgeProps>(({ tier }) => {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <Tag color={config.color} icon={<Icon size={14} />}>
      {config.label}
    </Tag>
  );
});

TierBadge.displayName = 'TierBadge';
