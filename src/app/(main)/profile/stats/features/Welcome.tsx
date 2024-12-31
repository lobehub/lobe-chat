import { FluentEmoji } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { Clock3Icon, ClockArrowUp } from 'lucide-react';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import TimeLabel from '@/app/(main)/profile/stats/features/TimeLabel';
import { BRANDING_NAME } from '@/const/branding';
import { useClientDataSWR } from '@/libs/swr';
import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/slices/auth/selectors';
import { formatIntergerNumber } from '@/utils/format';

const Welcome = memo(() => {
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const [nickname, username] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
  ]);
  const { data, isLoading } = useClientDataSWR('welcome', async () =>
    userService.getUserRegistrationDuration(),
  );

  return (
    <Flexbox gap={8}>
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        style={{
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        <FluentEmoji emoji={'👋'} size={28} type={'anim'} />
        <Trans
          components={{
            span:
              isLoading || !data ? (
                <Skeleton.Button active style={{ height: 24 }} />
              ) : (
                <span style={{ fontWeight: 'bold' }} />
              ),
          }}
          i18nKey="stats.welcome"
          ns={'auth'}
          values={{
            appName: BRANDING_NAME,
            days: formatIntergerNumber(data?.duration),
            username: nickname || username,
          }}
        />
      </Flexbox>
      <Flexbox
        gap={16}
        horizontal
        style={{
          color: theme.colorTextDescription,
        }}
        wrap={'wrap'}
      >
        <TimeLabel date={data?.createdAt} icon={Clock3Icon} title={t('stats.createdAt')} />
        <TimeLabel date={data?.updatedAt} icon={ClockArrowUp} title={t('stats.updatedAt')} />
      </Flexbox>
    </Flexbox>
  );
});

export default Welcome;
