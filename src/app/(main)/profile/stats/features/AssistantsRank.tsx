import { BarList } from '@lobehub/charts';
import { Avatar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import { useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';

export const AssistantsRank = memo(() => {
  const { t } = useTranslation(['auth', 'chat']);
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useClientDataSWR('rank-sessions', async () =>
    sessionService.rankSessions(),
  );

  return (
    <BarList
      data={
        data?.map((item) => {
          const link = qs.stringifyUrl({
            query: {
              session: item.id,
            },
            url: '/chat',
          });
          return {
            icon: (
              <Avatar
                alt={item.title || t('defaultAgent', { ns: 'chat' })}
                avatar={item.avatar || DEFAULT_AVATAR}
                background={item.backgroundColor || theme.colorFillSecondary}
                size={28}
                style={{
                  backdropFilter: 'blur(8px)',
                }}
              />
            ),
            link,
            name: (
              <Link href={link} style={{ color: 'inherit' }}>
                {item.title || t('defaultAgent', { ns: 'chat' })}
              </Link>
            ),
            value: item.count,
          };
        }) || []
      }
      height={340}
      leftLabel={t('stats.assistantsRank.left')}
      loading={isLoading}
      onValueChange={(item) => router.push(item.link)}
      rightLabel={t('stats.assistantsRank.right')}
    />
  );
});

export default AssistantsRank;
