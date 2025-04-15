import { Block, Button, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { BRANDING_NAME } from '@/const/branding';
import { CHANGELOG_URL, MANUAL_UPGRADE_URL, OFFICIAL_SITE } from '@/const/url';
import { CURRENT_VERSION } from '@/const/version';
import { useNewVersion } from '@/features/User/UserPanel/useNewVersion';
import { useGlobalStore } from '@/store/global';

const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    border-radius: ${token.borderRadiusLG * 2}px;
  `,
}));

const Version = memo<{ mobile?: boolean }>(({ mobile }) => {
  const hasNewVersion = useNewVersion();
  const [latestVersion] = useGlobalStore((s) => [s.latestVersion]);
  const { t } = useTranslation('common');
  const { styles } = useStyles();

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
          <Block
            align={'center'}
            className={styles.logo}
            clickable
            height={64}
            justify={'center'}
            width={64}
          >
            <ProductLogo size={52} />
          </Block>
        </Link>
        <Flexbox align={'flex-start'} gap={6}>
          <div style={{ fontSize: 18, fontWeight: 'bolder' }}>{BRANDING_NAME}</div>
          <div>
            <Tag>v{CURRENT_VERSION}</Tag>
            {hasNewVersion && (
              <Tag color={'info'}>
                {t('upgradeVersion.newVersion', { version: `v${latestVersion}` })}
              </Tag>
            )}
          </div>
        </Flexbox>
      </Flexbox>
      <Flexbox flex={mobile ? 1 : undefined} gap={8} horizontal>
        <Link href={CHANGELOG_URL} style={{ flex: 1 }} target={'_blank'}>
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
