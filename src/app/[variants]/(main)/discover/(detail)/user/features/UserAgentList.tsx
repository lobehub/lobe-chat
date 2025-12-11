'use client';

import { Grid } from '@lobehub/ui';
import { Empty, Typography } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useUserDetailContext } from './DetailProvider';
import UserAgentCard from './UserAgentCard';

interface UserAgentListProps {
  rows?: number;
}

const UserAgentList = memo<UserAgentListProps>(({ rows = 3 }) => {
  const { t } = useTranslation('discover');
  const { agents } = useUserDetailContext();

  if (agents.length === 0)
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
        {agents.map((item, index) => (
          <UserAgentCard key={index} {...item} />
        ))}
      </Grid>
    </Flexbox>
  );
});

export default UserAgentList;
