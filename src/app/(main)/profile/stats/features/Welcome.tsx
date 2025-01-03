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

const formatEnglishNumber = (number: number) => {
  if (number === 1) return '1st';
  if (number === 2) return '2nd';
  if (number === 3) return '3rd';
  return `${formatIntergerNumber(number)}th`;
};

const Welcome = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t, i18n } = useTranslation('auth');
  const theme = useTheme();
  const [nickname, username] = useUserStore((s) => [
    userProfileSelectors.nickName(s),
    userProfileSelectors.username(s),
  ]);

  const { data, isLoading } = useClientDataSWR('welcome', async () =>
    userService.getUserRegistrationDuration(),
  );

  return (
    <Flexbox gap={8} padding={mobile ? 16 : 0}>
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        style={{
          fontSize: mobile ? 16 : 20,
          fontWeight: 500,
        }}
      >
        <div>
          <Trans
            components={{
              span:
                isLoading || !data ? (
                  <Skeleton.Button active style={{ height: 24, minWidth: 40, width: 40 }} />
                ) : (
                  <span style={{ fontWeight: 'bold' }} />
                ),
            }}
            i18nKey="stats.welcome"
            ns={'auth'}
            values={{
              appName: BRANDING_NAME,
              days:
                i18n.language === 'en-US'
                  ? formatEnglishNumber(Number(data?.duration || 1))
                  : formatIntergerNumber(Number(data?.duration || 1)),
              username: nickname || username,
            }}
          />
        </div>
        {!mobile && <FluentEmoji emoji={'🫶'} size={32} type={'anim'} />}
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
