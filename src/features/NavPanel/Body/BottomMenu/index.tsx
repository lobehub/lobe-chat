import { createStyles } from 'antd-style';
import { FolderClosed, Settings } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import NavItem from '@/features/NavPanel/NavItem';
import { useNavPanel } from '@/features/NavPanel/hooks/useNavPanel';
import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
}));

interface Item {
  icon: any;
  key: SidebarTabKey;
  title: string;
  url: string;
}

const BottomMenu = memo(() => {
  const { cx, styles } = useStyles();
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  const tab = useActiveTabKey();
  const { closePanel, expand } = useNavPanel();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const items = useMemo(
    () =>
      [
        {
          icon: Settings,
          key: SidebarTabKey.Setting,
          title: t('tab.setting'),
          url: '/settings',
        },
        enableKnowledgeBase && {
          icon: FolderClosed,
          key: SidebarTabKey.Files,
          title: t('tab.files'),
          url: '/knowledge',
        },
      ].filter(Boolean) as Item[],
    [t],
  );

  return (
    <Flexbox className={cx(styles.base, !expand && styles.hide)} gap={1} paddingBlock={4}>
      {items.map((item) => (
        <Link
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            navigate(item.url);
            closePanel();
          }}
          to={item.url}
        >
          <NavItem active={tab === item.key} icon={item.icon} title={item.title} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default BottomMenu;
