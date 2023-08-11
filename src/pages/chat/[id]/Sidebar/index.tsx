import { DraggablePanel, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';

import HeaderSpacing from '@/components/HeaderSpacing';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useSettings } from '@/store/settings';

import Inner from './Inner';

const useStyles = createStyles(({ cx, css, token, stylish }) => ({
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

const Config = () => {
  const { styles } = useStyles();
  const [showAgentSettings, toggleConfig] = useSettings((s) => [
    s.showAgentConfig,
    s.toggleAgentPanel,
  ]);

  return (
    <DraggablePanel
      className={styles.drawer}
      expand={showAgentSettings}
      minWidth={CHAT_SIDEBAR_WIDTH}
      onExpandChange={toggleConfig}
      placement={'right'}
    >
      <HeaderSpacing />
      <DraggablePanelContainer style={{ flex: 'none', minWidth: CHAT_SIDEBAR_WIDTH }}>
        <Inner />
      </DraggablePanelContainer>
    </DraggablePanel>
  );
};

export default Config;
