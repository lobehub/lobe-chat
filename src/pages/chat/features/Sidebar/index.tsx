import { DraggablePanel, DraggablePanelContainer, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';

import Mobile from './Mobile';
import SystemRole from './SystemRole';
import { Topic } from './Topic';

const useStyles = createStyles(({ cx, css, token, stylish }, mobile: boolean) => ({
  content: css`
    display: flex;
    flex-direction: column;
  `,
  drawer: cx(
    mobile
      ? css`
          background: ${token.colorBgLayout} !important;
        `
      : stylish.blurStrong,
    css`
      background: ${rgba(token.colorBgLayout, 0.4)};
    `,
  ),
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

interface SideBarProps {
  mobile?: boolean;
  systemRole?: boolean;
}
const SideBar = memo<SideBarProps>(({ mobile }) => {
  const { styles } = useStyles(mobile);
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const isInbox = useSessionStore(sessionSelectors.isInboxSession);

  const { t } = useTranslation('common');

  const topic = (
    <Flexbox height={'100%'} style={{ overflow: 'hidden' }}>
      <Flexbox padding={16}>
        <SearchBar
          placeholder={t('topic.searchPlaceholder')}
          spotlight={!mobile}
          type={mobile ? 'block' : 'ghost'}
        />
      </Flexbox>
      <Flexbox gap={16} paddingInline={16} style={{ overflowY: 'auto', position: 'relative' }}>
        <Topic />
      </Flexbox>
    </Flexbox>
  );

  if (mobile) return <Mobile>{topic}</Mobile>;

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSettings}
      minWidth={CHAT_SIDEBAR_WIDTH}
      mode={'fixed'}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <DraggablePanelContainer
        style={{ flex: 'none', height: '100%', minWidth: CHAT_SIDEBAR_WIDTH }}
      >
        <SafeSpacing />
        {!isInbox && <SystemRole mobile={mobile} />}

        {topic}
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
