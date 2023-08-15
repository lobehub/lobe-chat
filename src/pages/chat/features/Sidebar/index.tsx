import { DraggablePanel, DraggablePanelContainer, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/components/HeaderSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

import SystemRole from './SystemRole';
import { Topic } from './Topic';

const useStyles = createStyles(({ cx, css, token, stylish }) => ({
  content: css`
    display: flex;
    flex-direction: column;
  `,
  drawer: cx(
    stylish.blurStrong,
    css`
      background: ${rgba(token.colorBgLayout, 0.4)};
    `,
  ),
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

interface SideBarProps {
  systemRole?: boolean;
}
const SideBar = memo<SideBarProps>(({ systemRole = true }) => {
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const { t } = useTranslation('common');

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSettings}
      minWidth={CHAT_SIDEBAR_WIDTH}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <DraggablePanelContainer
        style={{ flex: 'none', height: '100%', minWidth: CHAT_SIDEBAR_WIDTH }}
      >
        <HeaderSpacing />
        {systemRole && <SystemRole />}
        <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
          <Flexbox padding={16}>
            <SearchBar placeholder={t('topic.searchPlaceholder')} spotlight type={'ghost'} />
          </Flexbox>
          <Flexbox gap={16} paddingInline={16} style={{ overflowY: 'auto', position: 'relative' }}>
            <Topic />
          </Flexbox>
        </Flexbox>
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
