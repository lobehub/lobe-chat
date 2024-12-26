import { BarList } from '@lobehub/charts';
import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { MessageSquareIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useClientDataSWR } from '@/libs/swr';
import { topicService } from '@/services/topic';

export const TopicsRank = memo(() => {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useClientDataSWR('rank-topics', async () =>
    topicService.rankTopics(),
  );

  return (
    <BarList
      data={
        data?.map((item) => {
          const link = qs.stringifyUrl({
            query: {
              session: item.sessionId,
              topic: item.id,
            },
            url: '/chat',
          });
          return {
            icon: (
              <Icon
                color={theme.colorTextDescription}
                icon={MessageSquareIcon}
                size={{ fontSize: 16 }}
              />
            ),
            link,
            name: (
              <Link href={link} style={{ color: 'inherit' }}>
                {item.title}
              </Link>
            ),
            value: item.count,
          };
        }) || []
      }
      height={340}
      leftLabel={t('stats.topicsRank.left')}
      loading={isLoading}
      onValueChange={(item) => router.push(item.link)}
      rightLabel={t('stats.topicsRank.right')}
    />
  );
});

export default TopicsRank;
