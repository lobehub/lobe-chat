'use client';

import { ActionIcon, Avatar, SortableList, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, MessageSquare, UserMinus, UserPlus } from 'lucide-react';
import { lazy, memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import SidebarHeader from '@/components/SidebarHeader';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeGroupSession } from '@/types/session';

import AgentSettings from '../../../features/AgentSettings';
import Header from '../Header';
import TopicListContent from '../TopicListContent';

const GroupChatThread = lazy(() => import('./thread'));

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    padding: 0;
    min-height: 200px;
    height: fit-content;
    overflow-y: auto;
    padding-bottom: ${token.padding}px;
  `,
  emptyState: css`
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSizeSM}px;
    padding: ${token.paddingLG}px;
    text-align: center;
  `,
  memberItem: css`
    cursor: pointer;
    margin-block: 1px;
    margin-inline: 8px;
    padding: 8px;
    border-radius: ${token.borderRadius}px;
    width: calc(100% - 16px);
    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  placeholder: css`
    border: 1px dashed ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    color: ${token.colorTextSecondary};
    margin: ${token.marginSM}px 0;
    padding: ${token.paddingLG}px;
    text-align: center;
  `,
  sectionTitle: css`
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSizeSM}px;
    font-weight: ${token.fontWeightStrong};
    letter-spacing: 0.5px;
    margin: ${token.marginLG}px 0 ${token.marginSM}px 0;
    text-transform: uppercase;
  `,
  topicList: css`
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
}));

const GroupChatSidebar = memo(() => {
  const { styles } = useStyles();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const { t } = useTranslation('chat');

  const activeGroupId = useSessionStore((s) => s.activeId);
  const currentSession = useSessionStore(sessionSelectors.currentSession) as LobeGroupSession;

  const addAgentsToGroup = useChatGroupStore((s) => s.addAgentsToGroup);
  const removeAgentFromGroup = useChatGroupStore((s) => s.removeAgentFromGroup);
  const persistReorder = useChatGroupStore((s) => s.reorderGroupMembers);
  const activeThreadAgentId = useChatGroupStore((s) => s.activeThreadAgentId);
  const toggleThread = useChatGroupStore((s) => s.toggleThread);

  const isSupervisorLoading = useChatStore(chatSelectors.isSupervisorLoading(activeGroupId || ''));

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.nickName(s),
  }));

  const handleAddMembers = async (selectedAgents: string[]) => {
    if (!activeGroupId) {
      console.error('No active group to add members to');
      return;
    }
    await addAgentsToGroup(activeGroupId, selectedAgents);
    setAddModalOpen(false);
  };

  // optimistic local state for member ordering
  const initialMembers = useMemo(() => currentSession?.members ?? [], [currentSession?.members]);
  const [members, setMembers] = useState<any[]>(initialMembers);

  // state for tracking which members are being removed
  const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);
  // state for tracking which member is being hovered
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!activeGroupId) return;

    // Start loading state
    setRemovingMemberIds((prev) => [...prev, memberId]);

    try {
      await removeAgentFromGroup(activeGroupId, memberId);
    } finally {
      // Clear loading state
      setRemovingMemberIds((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleMemberClick = (agentId: string) => {
    setSelectedAgentId(agentId);
    setAgentSettingsOpen(true);
  };

  const handleAgentSettingsClose = () => {
    setAgentSettingsOpen(false);
    setSelectedAgentId(undefined);
  };

  const showThread = activeThreadAgentId && activeThreadAgentId.length > 0;

  return (
    <Flexbox height={'100%'}>
      <AnimatePresence mode="wait">
        {showThread ? (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            initial={{ opacity: 0, x: 20 }}
            key="thread"
            style={{ height: '100%', width: '100%' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <GroupChatThread />
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            initial={{ opacity: 0, x: -20 }}
            key="sidebar"
            style={{ height: '100%', width: '100%' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Flexbox height={'100%'}>
              <SidebarHeader
                actions={
                  <ActionIcon
                    icon={UserPlus}
                    key="addMember"
                    onClick={() => setAddModalOpen(true)}
                    size={'small'}
                    title="Add Member"
                  />
                }
                style={{ cursor: 'pointer' }}
                title={
                  <Flexbox align={'center'} gap={8} horizontal>
                    Members {(currentSession?.members?.length || 0) + 1}
                  </Flexbox>
                }
              />

              <Flexbox className={styles.content} flex={0.6} gap={0}>
                {/* Orchestrator - Show supervisor loading state */}
                <div className={styles.memberItem} style={{ marginBottom: 8 }}>
                  <Flexbox align={'center'} gap={8} horizontal>
                    <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
                      <SortableList.DragHandle />
                    </div>
                    <Avatar avatar={"🎙️"} size={24} />
                    <Flexbox flex={1}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        Orchestrator
                      </div>
                    </Flexbox>
                    {!isSupervisorLoading && (
                      <Icon
                        icon={LoaderCircle}
                        size={14}
                        spin
                      />
                    )}
                  </Flexbox>
                </div>

                {/* Current User - Always shown first */}
                <div className={styles.memberItem} style={{ marginBottom: 8 }}>
                  <Flexbox align={'center'} gap={8} horizontal>
                    <div style={{ opacity: 0.3, pointerEvents: 'none' }}>
                      <SortableList.DragHandle />
                    </div>
                    <Avatar avatar={currentUser.avatar} size={24} />
                    <Flexbox flex={1}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        {currentUser.name}
                      </div>
                    </Flexbox>
                  </Flexbox>
                </div>

                {members && members.length > 0 ? (
                  <SortableList
                    items={members}
                    onChange={async (items: any[]) => {
                      setMembers(items);
                      if (!activeGroupId) return;
                      // persist new order
                      const orderedIds = items.map((m) => m.id);
                      // fire and forget; store action will refresh groups and sessions
                      persistReorder(activeGroupId, orderedIds).catch(() => {
                        console.error('Failed to persist reorder');
                      });
                    }}
                    renderItem={(item: any) => (
                      <SortableList.Item className={styles.memberItem} id={item.id}>
                        <Flexbox
                          align={'center'}
                          gap={8}
                          horizontal
                          justify={'space-between'}
                          onMouseEnter={() => setHoveredMemberId(item.id)}
                          onMouseLeave={() => setHoveredMemberId(null)}
                        >
                          <Flexbox
                            align={'center'}
                            flex={1}
                            gap={8}
                            horizontal
                            onClick={() => handleMemberClick(item.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <SortableList.DragHandle />
                            <Avatar
                              avatar={item.avatar || DEFAULT_AVATAR}
                              background={item.backgroundColor!}
                              size={24}
                            />
                            <Flexbox flex={1}>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                }}
                              >
                                {item.title || t('defaultSession', { ns: 'common' })}
                              </div>
                            </Flexbox>
                          </Flexbox>
                          {hoveredMemberId === item.id && (
                            <Flexbox gap={4} horizontal>
                              <ActionIcon
                                icon={MessageSquare}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleThread(item.id);
                                }}
                                size={'small'}
                                title="Open Thread"
                              />
                              <ActionIcon
                                danger
                                icon={UserMinus}
                                loading={removingMemberIds.includes(item.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(item.id);
                                }}
                                size={'small'}
                                title="Remove Member"
                              />
                            </Flexbox>
                          )}
                        </Flexbox>
                      </SortableList.Item>
                    )}
                  />
                ) : null}
              </Flexbox>

              <Flexbox className={styles.topicList} flex={1}>
                <Header />
                <TopicListContent />
              </Flexbox>
            </Flexbox>
          </motion.div>
        )}
      </AnimatePresence>

      <MemberSelectionModal
        existingMembers={currentSession?.members?.map((member: any) => member.id) || []}
        groupId={activeGroupId}
        mode="add"
        onCancel={() => setAddModalOpen(false)}
        onConfirm={handleAddMembers}
        open={addModalOpen}
      />

      <AgentSettings
        agentId={selectedAgentId}
        onClose={handleAgentSettingsClose}
        open={agentSettingsOpen}
      />
    </Flexbox>
  );
});

export default GroupChatSidebar;
