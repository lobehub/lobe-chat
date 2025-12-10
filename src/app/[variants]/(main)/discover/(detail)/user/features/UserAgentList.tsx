'use client';

import { Grid } from '@lobehub/ui';
import { Empty, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { DiscoverAssistantItem } from '@/types/discover';

import UserAgentCard from './UserAgentCard';

export interface UserAgentListProps {
  data?: DiscoverAssistantItem[];
  isOwner?: boolean;
  onAgentClick?: (agent: DiscoverAssistantItem) => void;
  rows?: number;
}

const UserAgentList = memo<UserAgentListProps>(({ data = [], rows = 3, isOwner, onAgentClick }) => {
  const { t } = useTranslation('discover');

  if (data.length === 0)
    return (
      <Center height={320}>
        <Empty description={t('user.noAgents')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Flexbox gap={16}>
      <Typography.Title level={5} style={{ margin: 0 }}>
        {t('user.publishedAgents')}
      </Typography.Title>
      <Grid rows={rows} width={'100%'}>
        {data.map((item, index) => (
          <UserAgentCard
            isOwner={isOwner}
            key={index}
            onClick={onAgentClick ? () => onAgentClick(item) : undefined}
            {...item}
          />
        ))}
      </Grid>
    </Flexbox>
  );
});

export default UserAgentList;
