'use client';

import { Empty, Grid, Tag, Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useUserDetailContext } from './DetailProvider';
import UserAgentCard from './UserAgentCard';

interface UserAgentListProps {
  rows?: number;
}

const UserAgentList = memo<UserAgentListProps>(({ rows = 4 }) => {
  const { t } = useTranslation('discover');
  const { agents, agentCount } = useUserDetailContext();

  if (agents.length === 0)
    return (
      <Center height={320}>
        <Empty description={t('user.noAgents')} />
      </Center>
    );

  return (
    <Flexbox gap={16}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Text fontSize={16} weight={500}>
          {t('user.publishedAgents')}
        </Text>
        {agentCount > 0 && <Tag>{agentCount}</Tag>}
      </Flexbox>
      <Grid rows={rows} width={'100%'}>
        {agents.map((item, index) => (
          <UserAgentCard key={index} {...item} />
        ))}
      </Grid>
    </Flexbox>
  );
});

export default UserAgentList;
