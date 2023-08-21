import {
  ActionIcon,
  DraggablePanel,
  DraggablePanelContainer,
  MobileNavBar,
  MobileNavBarTitle,
  SearchBar,
} from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { X } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';

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
const SideBar = memo<SideBarProps>(({ systemRole = true, mobile }) => {
  const { styles } = useStyles(mobile);
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
      draggable={!mobile}
      expand={showAgentSettings}
      expandable={!mobile}
      minWidth={mobile ? ('100vw' as any) : CHAT_SIDEBAR_WIDTH}
      mode={mobile ? 'float' : 'fixed'}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <DraggablePanelContainer
        style={{ flex: 'none', height: '100%', minWidth: CHAT_SIDEBAR_WIDTH }}
      >
        {mobile ? (
          <MobileNavBar
            center={<MobileNavBarTitle title={t('topic.title')} />}
            left={<ActionIcon icon={X} onClick={() => toggleConfig()} />}
          />
        ) : (
          <>
            <SafeSpacing />
            {systemRole && <SystemRole mobile={mobile} />}
          </>
        )}

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
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
