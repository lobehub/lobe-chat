'use client';

import { Icon, Tabs, TabsProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BookOpenIcon, ListIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { SOCIAL_URL } from '@/const/branding';
import { PluginNavKey } from '@/types/discover';

import { useDetailContext } from '../DetailProvider';

const useStyles = createStyles(({ css, token }) => {
  return {
    link: css`
      color: ${token.colorTextDescription};

      &:hover {
        color: ${token.colorInfo};
      }
    `,
    nav: css`
      border-block-end: 1px solid ${token.colorBorder};
    `,
  };
});

const Nav = memo<{
  activeTab?: PluginNavKey;
  inModal?: boolean;
  mobile?: boolean;
  setActiveTab?: (tab: PluginNavKey) => void;
}>(({ mobile, setActiveTab, activeTab = PluginNavKey.Overview, inModal }) => {
  const { t } = useTranslation('discover');
  const { identifier } = useDetailContext();
  const { styles } = useStyles();

  const nav = (
    <Tabs
      activeKey={activeTab}
      compact={mobile}
      items={
        [
          {
            icon: <Icon icon={BookOpenIcon} size={16} />,
            key: PluginNavKey.Overview,
            label: t('plugins.details.overview.title'),
          },
          !inModal && {
            icon: <Icon icon={ListIcon} size={16} />,
            key: PluginNavKey.Related,
            label: t('plugins.details.related.title'),
          },
        ].filter(Boolean) as TabsProps['items']
      }
      onChange={(key) => setActiveTab?.(key as PluginNavKey)}
    />
  );

  return mobile ? (
    nav
  ) : (
    <Flexbox align={'center'} className={styles.nav} horizontal justify={'space-between'}>
      {nav}
      {!inModal && (
        <Flexbox gap={12} horizontal>
          <Link className={styles.link} href={SOCIAL_URL.discord} target={'_blank'}>
            {t('mcp.details.nav.needHelp')}
          </Link>
          {identifier && (
            <Link
              className={styles.link}
              href={urlJoin(
                'https://github.com/lobehub/lobe-chat-plugins/tree/main/src',
                `${identifier}.json`,
              )}
              target={'_blank'}
            >
              {t('mcp.details.nav.viewSourceCode')}
            </Link>
          )}
          <Link
            className={styles.link}
            href={'https://github.com/lobehub/lobe-chat-plugins/issues/new/choose'}
            target={'_blank'}
          >
            {t('mcp.details.nav.reportIssue')}
          </Link>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Nav;
