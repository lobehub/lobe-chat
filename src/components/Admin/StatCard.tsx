'use client';

import { Card, Statistic } from 'antd';
import { LucideIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  suffix?: string;
  prefix?: string;
  highlight?: boolean;
  loading?: boolean;
}

export const StatCard = memo<StatCardProps>(
  ({ highlight = false, icon: Icon, loading, prefix, suffix, title, value }) => {
    return (
      <Card
        bordered={highlight}
        loading={loading}
        style={{
          borderColor: highlight ? '#1890ff' : undefined,
          borderWidth: highlight ? 2 : 1,
        }}
      >
        <Flexbox align="center" gap={16} horizontal>
          {Icon && (
            <div
              style={{
                alignItems: 'center',
                backgroundColor: highlight ? '#e6f7ff' : '#f0f0f0',
                borderRadius: 8,
                display: 'flex',
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}
            >
              <Icon color={highlight ? '#1890ff' : '#595959'} size={24} />
            </div>
          )}
          <Statistic prefix={prefix} suffix={suffix} title={title} value={value} />
        </Flexbox>
      </Card>
    );
  },
);

StatCard.displayName = 'StatCard';
