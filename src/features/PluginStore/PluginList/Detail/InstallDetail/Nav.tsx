'use client';

import { Icon, Tabs, TabsProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BookOpenIcon, HammerIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';
import { PluginNavKey } from '@/types/discover';

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

interface NavProps {
  activeTab?: PluginNavKey;
  mobile?: boolean;
  setActiveTab?: (tab: PluginNavKey) => void;
}

const Nav = memo<NavProps>(({ mobile, setActiveTab, activeTab = PluginNavKey.Tools }) => {
  const { t } = useTranslation('discover');
  const { styles } = useStyles();
  const [identifier] = useToolStore((s) => [s.activePluginIdentifier]);
  const plugin = useToolStore(pluginSelectors.getInstalledPluginById(identifier));

  const hasSettings =
    plugin?.manifest?.settings && Object.keys(plugin?.manifest?.settings.properties).length > 0;

  const nav = (
    <Tabs
      activeKey={activeTab}
      compact={mobile}
      items={
        [
          {
            icon: <Icon icon={HammerIcon} size={16} />,
            key: PluginNavKey.Tools,
            label: t('plugins.details.tools.title'),
          },
          hasSettings && {
            icon: <Icon icon={BookOpenIcon} size={16} />,
            key: PluginNavKey.Settings,
            label: t('plugins.details.settings.title'),
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
    </Flexbox>
  );
});

export default Nav;
