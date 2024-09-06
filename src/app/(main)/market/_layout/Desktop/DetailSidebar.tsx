'use client';

import { DraggablePanel, DraggablePanelBody, DraggablePanelContainer } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { PropsWithChildren, memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import SafeSpacing from '@/components/SafeSpacing';
import { MARKET_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { agentMarketSelectors, useMarketStore } from '@/store/market';

const useStyles = createStyles(({ css, token, stylish }) => ({
  content: css`
    display: flex;
    flex-direction: column;
    height: 100% !important;
  `,
  drawer: css`
    background: ${token.colorBgContainer};
  `,
  header: css`
    border-block-end: 1px solid ${token.colorBorder};
  `,
  noScrollbar: stylish.noScrollbar,
}));

const DetailSidebar = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  const { md = true } = useResponsive();
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

  const minWidth = md ? MARKET_SIDEBAR_WIDTH : 350;

  return (
    <DraggablePanel
      className={styles.drawer}
      classNames={{
        content: styles.content,
      }}
      expand={showAgentSidebar}
      maxWidth={'80vw' as any}
      minWidth={minWidth}
      mode={md ? 'fixed' : 'float'}
      onExpandChange={handleExpandChange}
      placement={'right'}
      showHandlerWideArea={false}
    >
      <DraggablePanelContainer
        style={{
          flex: 'none',
          height: '100%',
          minWidth: minWidth,
        }}
      >
        {md && <SafeSpacing />}
        <DraggablePanelBody
          className={styles.noScrollbar}
          style={{ padding: 0, position: 'relative' }}
        >
          <Flexbox>{children}</Flexbox>
        </DraggablePanelBody>
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

export default DetailSidebar;
