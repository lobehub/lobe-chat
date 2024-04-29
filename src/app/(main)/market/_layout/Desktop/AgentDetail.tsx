import { DraggablePanel, DraggablePanelBody, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useCallback, useState } from 'react';

import SafeSpacing from '@/components/SafeSpacing';
import { MARKET_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { agentMarketSelectors, useMarketStore } from '@/store/market';

import AgentDetailContent from '../../features/AgentDetailContent';

const useStyles = createStyles(({ css, token, stylish }) => ({
  content: css`
    display: flex;
    flex-direction: column;
    height: 100% !important;
  `,
  drawer: css`
    background: ${token.colorBgLayout};
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
  noScrollbar: stylish.noScrollbar,
}));

const SideBar = memo(() => {
  const { styles } = useStyles();
  const [tempId, setTempId] = useState<string>('');
  const [showAgentSidebar, deactivateAgent, activateAgent] = useMarketStore((s) => [
    agentMarketSelectors.showSideBar(s),
    s.deactivateAgent,
    s.activateAgent,
  ]);

  const handleExpandChange = useCallback(
    (show: boolean) => {
      if (!show) {
        setTempId(useMarketStore.getState().currentIdentifier);
        deactivateAgent();
      } else if (tempId) {
        activateAgent(tempId);
      }
    },
    [deactivateAgent, activateAgent, tempId],
  );

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSidebar}
      minWidth={MARKET_SIDEBAR_WIDTH}
      mode={'fixed'}
      onExpandChange={handleExpandChange}
      placement={'right'}
      showHandlerWideArea={false}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100%',
          minWidth: MARKET_SIDEBAR_WIDTH,
        }}
      >
        <SafeSpacing />
        <DraggablePanelBody
          className={styles.noScrollbar}
          style={{ padding: 0, position: 'relative' }}
        >
          <AgentDetailContent />
        </DraggablePanelBody>
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default SideBar;
