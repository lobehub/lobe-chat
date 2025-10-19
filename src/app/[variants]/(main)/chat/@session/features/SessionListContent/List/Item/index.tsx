import { ModelTag } from '@lobehub/icons';
import React, { memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { DEFAULT_AVATAR } from '@/const/meta';
import { isDesktop } from '@/const/version';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeGroupSession } from '@/types/session';

import ListItem from '../../ListItem';
import CreateGroupModal from '../../Modals/CreateGroupModal';
import Actions from './Actions';

interface SessionItemProps {
  id: string;
}

const SessionItem = memo<SessionItemProps>(({ id }) => {
  const [open, setOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [defaultModel] = useAgentStore((s) => [agentSelectors.inboxAgentModel(s)]);

  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);

  const [active] = useSessionStore((s) => [s.activeId === id]);
  const [loading] = useChatStore((s) => [chatSelectors.isAIGenerating(s) && id === s.activeId]);

  const [pin, title, avatar, avatarBackground, updateAt, members, model, group, sessionType] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;

      return [
        sessionHelpers.getSessionPinned(session),
        sessionMetaSelectors.getTitle(meta),
        sessionMetaSelectors.getAvatar(meta),
        meta.backgroundColor,
        session?.updatedAt,
        (session as LobeGroupSession).members,
        session.type === 'agent' ? (session as any).model : undefined,
        session?.group,
        session.type,
      ];
    });

  const showModel = sessionType === 'agent' && model && model !== defaultModel;

  const handleDoubleClick = () => {
    if (isDesktop) {
      openSessionInNewWindow(id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data to identify the session being dragged
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // If drag ends without being dropped in a valid target, open in new window
    if (isDesktop && e.dataTransfer.dropEffect === 'none') {
      openSessionInNewWindow(id);
    }
  };

  const actions = useMemo(
    () => (
      <Actions
        group={group}
        id={id}
        openCreateGroupModal={() => setCreateGroupModalOpen(true)}
        parentType={sessionType}
        setOpen={setOpen}
      />
    ),
    [group, id],
  );

  const addon = useMemo(
    () =>
      !showModel ? undefined : (
        <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
          <ModelTag model={model} />
        </Flexbox>
      ),
    [showModel, model],
  );

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.displayUserName(s) || userProfileSelectors.nickName(s) || 'You',
  }));

  const sessionAvatar: string | { avatar: string; background?: string }[] =
    sessionType === 'group'
      ? [
          {
            avatar: currentUser.avatar || DEFAULT_AVATAR,
            background: undefined,
          },
          ...(members?.map((member) => ({
            avatar: member.avatar || DEFAULT_AVATAR,
            background: member.backgroundColor || undefined,
          })) || []),
        ]
      : avatar;

  return (
    <>
      <ListItem
        actions={actions}
        active={active}
        addon={addon}
        avatar={sessionAvatar as any} // Fix: Bypass complex intersection type ReactNode & avatar type
        avatarBackground={avatarBackground}
        date={updateAt?.valueOf()}
        draggable={isDesktop}
        key={id}
        loading={loading}
        onDoubleClick={handleDoubleClick}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        pin={pin}
        showAction={open}
        styles={{
          container: {
            gap: 12,
          },
          content: {
            gap: 6,
            maskImage: `linear-gradient(90deg, #000 90%, transparent)`,
          },
        }}
        title={title}
        type={sessionType}
      />
      <CreateGroupModal
        id={id}
        onCancel={() => setCreateGroupModalOpen(false)}
        open={createGroupModalOpen}
      />
    </>
  );
}, shallow);

export default SessionItem;
