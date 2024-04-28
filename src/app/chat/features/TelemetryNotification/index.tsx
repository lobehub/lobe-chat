import { Avatar, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { LucideArrowUpRightFromSquare, TelescopeIcon } from 'lucide-react';
import Link from 'next/link';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PRIVACY_URL } from '@/const/url';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    position: absolute;
    z-index: 100;
    bottom: 16px;
    inset-inline-end: 20px;

    overflow: hidden;

    width: 422px;

    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorSplit};
    border-radius: 8px;
    box-shadow: ${token.boxShadowSecondary};
  `,
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  mobileContainer: css`
    bottom: 8px;
    inset-inline-start: 8px;
    width: calc(100% - 16px);
  `,
  title: css`
    font-size: 18px;
    font-weight: bold;
  `,
  wrapper: css`
    padding: 20px 20px 16px;
    background: linear-gradient(
        180deg,
        ${rgba(token.colorBgContainer, 0)},
        ${token.colorBgContainer} ${isDarkMode ? '80' : '140'}px
      ),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cg fill='${token.colorFillTertiary}' %3E %3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E");
  `,
}));

const TelemetryNotification = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { styles, theme, cx } = useStyles();

  const { t } = useTranslation('common');
  const shouldCheck = useServerConfigStore(serverConfigSelectors.enabledTelemetryChat);

  const [useCheckTrace, updatePreference] = useUserStore((s) => [
    s.useCheckTrace,
    s.updatePreference,
  ]);

  const { data: showModal, mutate } = useCheckTrace(shouldCheck);

  const updateTelemetry = (telemetry: boolean) => {
    updatePreference({ telemetry });
    mutate();
  };

  return (
    showModal && (
      <Flexbox className={cx(styles.container, mobile && styles.mobileContainer)}>
        <Flexbox className={styles.wrapper} gap={16} horizontal>
          <Flexbox>
            <Avatar
              avatar={<TelescopeIcon />}
              background={theme.geekblue1}
              style={{ color: theme.geekblue7 }}
            ></Avatar>
          </Flexbox>
          <Flexbox gap={16}>
            <Flexbox gap={12}>
              <Flexbox className={styles.title}>{t('telemetry.title')}</Flexbox>
              <div className={styles.desc}>
                {t('telemetry.desc')}
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
        </Flexbox>
      </Flexbox>
    )
  );
});

export default TelemetryNotification;
