'use client';

import { Avatar, Button, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideArrowUpRightFromSquare, TelescopeIcon } from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Notification from '@/components/Notification';
import { BRANDING_NAME } from '@/const/branding';
import { PRIVACY_URL } from '@/const/url';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { useGlobalStore } from "@/store/global";
import { systemStatusSelectors } from "@/store/global/selectors";
import { useSearchParams } from "next/navigation";

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: 18px;
    font-weight: bold;
  `,
}));

const TelemetryNotification = memo<{ mobile?: boolean }>(({ mobile, theme: rTheme }) => {
  const { styles, theme } = useStyles();

  const searchParams = useSearchParams()
  const { t } = useTranslation('common');
  const shouldCheck = useServerConfigStore(serverConfigSelectors.enabledTelemetryChat);
  const isPreferenceInit = useUserStore(preferenceSelectors.isPreferenceInit);
  const themeMode = useGlobalStore(systemStatusSelectors.themeMode);
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);

  const [useCheckTrace, updatePreference] = useUserStore((s) => [
    s.useCheckTrace,
    s.updatePreference,
  ]);

  const { data: showModal, mutate } = useCheckTrace(shouldCheck && isPreferenceInit);
  React.useEffect(
    () => {
      const thm = searchParams.get('thm');
      if (themeMode !== 'light' && thm === 'l') {
        switchThemeMode('light');
      } else if (themeMode === 'light' && thm === 'd') {
        switchThemeMode( 'dark');
      }
    },
    [switchThemeMode]
  )

  const updateTelemetry = (telemetry: boolean) => {
    updatePreference({ telemetry });
    mutate();
  };

  return (
    <Notification mobile={mobile} show={showModal} showCloseIcon={false}>
      <Flexbox>
        <Avatar
          avatar={<TelescopeIcon />}
          background={theme.geekblue1}
          style={{ color: theme.geekblue7 }}
        />
      </Flexbox>
      <Flexbox gap={16}>
        <Flexbox gap={12}>
          <Flexbox className={styles.title}>
            {t('telemetry.title', { appName: BRANDING_NAME })}
          </Flexbox>
          <div className={styles.desc}>
            {t('telemetry.desc', { appName: BRANDING_NAME })}
            <span>
              <Link href={PRIVACY_URL} target={'_blank'}>
                {t('telemetry.learnMore')}
                <Icon icon={LucideArrowUpRightFromSquare} style={{ marginInlineStart: 4 }} />
              </Link>
            </span>
          </div>
        </Flexbox>
        <Flexbox gap={8} horizontal>
          <Button
            onClick={() => {
              updateTelemetry(true);
            }}
            type={'primary'}
          >
            {t('telemetry.allow')}
          </Button>
          <Button
            onClick={() => {
              updateTelemetry(false);
            }}
            type={'text'}
          >
            {t('telemetry.deny')}
          </Button>
        </Flexbox>
      </Flexbox>
    </Notification>
  );
});

export default TelemetryNotification;
