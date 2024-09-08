import { Button, Tag } from 'antd';
import { createStyles } from 'antd-style';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import { MANUAL_UPGRADE_URL, OFFICIAL_SITE, RELEASES_URL } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { useNewVersion } from '@/features/User/UserPanel/useNewVersion';
import { useGlobalStore } from '@/store/global';

const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    overflow: hidden;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG * 2}px;
    box-shadow: 0 0 0 1px ${token.colorFillSecondary} inset;
  `,
}));

const Version = memo<{ mobile?: boolean }>(({ mobile }) => {
  const hasNewVersion = useNewVersion();
  const [latestVersion] = useGlobalStore((s) => [s.latestVersion]);
  const { t } = useTranslation('common');
  const { styles, theme } = useStyles();

  return (
    <Flexbox
      align={mobile ? 'stretch' : 'center'}
      gap={16}
      horizontal={!mobile}
      justify={'space-between'}
      width={'100%'}
    >
      <Flexbox align={'center'} flex={'none'} gap={16} horizontal>
        <Link href={OFFICIAL_SITE} target={'_blank'}>
          <Center className={styles.logo} height={64} width={64}>
            <Image alt={BRANDING_NAME} height={52} src={'/icons/icon-192x192.png'} width={52} />
          </Center>
        </Link>
        <Flexbox>
          <div style={{ fontSize: 18, fontWeight: 'bolder' }}>${BRANDING_NAME}</div>
          <div>
            <Tag color={theme.colorFillSecondary} style={{ color: theme.colorTextSecondary }}>
              v{CURRENT_VERSION}
            </Tag>
            {hasNewVersion && (
              <Tag
                bordered={false}
                style={{
                  background: theme.colorInfoBgHover,
                  color: theme.colorInfo,
                }}
              >
                {t('upgradeVersion.newVersion', { version: `v${latestVersion}` })}
              </Tag>
            )}
          </div>
        </Flexbox>
      </Flexbox>
      <Flexbox flex={mobile ? 1 : undefined} gap={8} horizontal>
        <Link href={RELEASES_URL} style={{ flex: 1 }} target={'_blank'}>
          <Button block={mobile}>{t('changelog')}</Button>
        </Link>
        {hasNewVersion && (
          <Link href={MANUAL_UPGRADE_URL} style={{ flex: 1 }} target={'_blank'}>
            <Button block={mobile} type={'primary'}>
              {t('upgradeVersion.action')}
            </Button>
          </Link>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default Version;
