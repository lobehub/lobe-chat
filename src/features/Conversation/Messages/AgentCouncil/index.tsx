'use client';

import { UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Columns2, Layers, StretchHorizontal } from 'lucide-react';
import { memo, useState } from 'react';

import WideScreenContainer from '@/features/WideScreenContainer';

import { dataSelectors, useConversationStore } from '../../store';
import CouncilMember from './CouncilMember';

export type DisplayMode = 'horizontal' | 'tab' | 'vertical';

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    overflow: visible;
    width: calc(100% + 32px);
    margin-inline: -16px;
    padding-inline: 16px;
  `,
  header: css`
    display: flex;
    justify-content: flex-end;
    margin-block-end: 8px;
  `,
  horizontalScroll: css`
    scroll-behavior: smooth;
    scrollbar-color: ${token.colorBorderSecondary} transparent;
    scrollbar-width: thin;
    scroll-snap-type: x mandatory;

    overflow: auto hidden;
    display: flex;
    gap: ${token.paddingMD}px;

    padding-block: 4px;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: ${token.colorBorderSecondary};

      &:hover {
        background: ${token.colorBorder};
      }
    }

    ${responsive.mobile} {
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  `,
  tabContent: css`
    width: 100%;
  `,
  tabSelector: css`
    margin-block-end: 12px;
  `,
  verticalStack: css`
    display: flex;
    flex-direction: column;
    gap: ${token.paddingMD}px;
  `,
}));

interface AgentCouncilMessageProps {
  id: string;
  index: number;
  isLatestItem?: boolean;
}

/**
 * AgentCouncilMessage - Renders multiple agent responses with switchable layouts
 *
 * Display modes:
 * - horizontal: Side by side with horizontal scroll (default)
 * - tab: Tabbed view with one agent per tab
 * - vertical: Stacked vertically for comparison
 */
const AgentCouncilMessage = memo<AgentCouncilMessageProps>(({ id }) => {
  const { styles } = useStyles();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('horizontal');
  const [activeTab, setActiveTab] = useState(0);

  const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;
  const members = (item as UIChatMessage)?.members as UIChatMessage[] | undefined;

  if (!members || members.length === 0) {
    return null;
  }

  const renderContent = () => {
    switch (displayMode) {
      case 'tab': {
        const activeMember = members[activeTab];
        if (!activeMember) return null;

        return (
          <WideScreenContainer>
            <Flexbox className={styles.tabContent}>
              <div>
                <Segmented
                  className={styles.tabSelector}
                  onChange={(value) => setActiveTab(Number(value))}
                  options={members.map((member, idx) => ({
                    label: `Agent ${idx + 1}`,
                    value: idx,
                  }))}
                  value={activeTab}
                />
              </div>
              <CouncilMember index={activeTab} message={activeMember} mode="tab" />
            </Flexbox>
          </WideScreenContainer>
        );
      }

      case 'vertical': {
        return (
          <WideScreenContainer>
            <div className={styles.verticalStack}>
              {members.map((member, idx) => {
                if (!member) return null;
                return (
                  <CouncilMember index={idx} key={member.id} message={member} mode="vertical" />
                );
              })}
            </div>
          </WideScreenContainer>
        );
      }

      default: {
        return (
          <div className={styles.horizontalScroll}>
            {members.map((member, idx) => {
              if (!member) return null;
              return (
                <CouncilMember index={idx} key={member.id} message={member} mode="horizontal" />
              );
            })}
          </div>
        );
      }
    }
  };

  return (
    <Flexbox className={styles.container}>
      <WideScreenContainer>
        <div className={styles.header}>
          <Segmented
            onChange={(value) => setDisplayMode(value as DisplayMode)}
            options={[
              { icon: <StretchHorizontal size={14} />, value: 'horizontal' },
              { icon: <Layers size={14} />, value: 'tab' },
              { icon: <Columns2 size={14} />, value: 'vertical' },
            ]}
            size="small"
            value={displayMode}
          />
        </div>
      </WideScreenContainer>
      {renderContent()}
    </Flexbox>
  );
}, isEqual);

export default AgentCouncilMessage;
