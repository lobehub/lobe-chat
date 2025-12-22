'use client';

import { UIChatMessage } from '@lobechat/types';
import { Flexbox, Icon, ScrollShadow } from '@lobehub/ui';
import { Divider, Segmented } from 'antd';
import isEqual from 'fast-deep-equal';
import { BotIcon, Columns2, Layers } from 'lucide-react';
import { Fragment, memo, useState } from 'react';

import { CONVERSATION_MIN_WIDTH } from '@/const/layoutTokens';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { dataSelectors, useConversationStore } from '../../store';
import CouncilMember from './CouncilMember';

export type DisplayMode = 'horizontal' | 'tab';

interface AgentCouncilMessageProps {
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const AgentCouncilMessage = memo<AgentCouncilMessageProps>(({ id }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('horizontal');
  const [activeTab, setActiveTab] = useState(0);
  const wideScreen = useGlobalStore(systemStatusSelectors.wideScreen);
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
            <CouncilMember index={activeTab} item={activeMember} scrollShadow />
          </WideScreenContainer>
        );
      }

      default: {
        if (members.length < 2) {
          return (
            <WideScreenContainer gap={16}>
              {members.map((member, idx) => {
                if (!member) return null;
                return <CouncilMember index={idx} item={member} key={member.id} />;
              })}
            </WideScreenContainer>
          );
        }
        const MIN_WIDTH = CONVERSATION_MIN_WIDTH / 2;
        return (
          <ScrollShadow hideScrollBar offset={16} orientation={'horizontal'} size={4}>
            <Flexbox
              horizontal
              justify={wideScreen ? 'flex-start' : 'center'}
              paddingInline={16}
              style={{
                minWidth: MIN_WIDTH * members.length + 32 + 16 * (members.length - 1),
              }}
            >
              {members.map((member, idx) => {
                if (!member) return null;
                return (
                  <Fragment key={member.id}>
                    <Flexbox
                      gap={12}
                      key={member.id}
                      style={{
                        minWidth: MIN_WIDTH,
                        position: 'relative',
                      }}
                      width={`min(${MIN_WIDTH}px, 100%)`}
                    >
                      <CouncilMember index={idx} item={member} scrollShadow />
                    </Flexbox>
                    {idx < members.length - 1 && (
                      <Divider
                        dashed
                        orientation={'vertical'}
                        style={{ height: 'unset', marginInline: 16 }}
                      />
                    )}
                  </Fragment>
                );
              })}
            </Flexbox>
          </ScrollShadow>
        );
      }
    }
  };

  return (
    <>
      <WideScreenContainer>
        <Flexbox align={'center'} height={48} horizontal justify={'space-between'} paddingBlock={8}>
          {displayMode === 'tab' ? (
            <Segmented
              onChange={(value) => setActiveTab(Number(value))}
              options={members.map((_, idx) => {
                return {
                  icon: <Icon icon={BotIcon} size={14} />,
                  value: idx,
                };
              })}
              size={'small'}
              value={activeTab}
            />
          ) : (
            <div />
          )}
          <Segmented
            onChange={(value) => setDisplayMode(value as DisplayMode)}
            options={[
              { icon: <Icon icon={Columns2} />, value: 'horizontal' },
              { icon: <Icon icon={Layers} />, value: 'tab' },
            ]}
            size="small"
            value={displayMode}
          />
        </Flexbox>
      </WideScreenContainer>
      {renderContent()}
    </>
  );
}, isEqual);

export default AgentCouncilMessage;
