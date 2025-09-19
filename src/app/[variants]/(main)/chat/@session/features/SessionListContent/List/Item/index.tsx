import { ModelTag } from '@lobehub/icons';
import React, { memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { isDesktop } from '@/const/version';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

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

  const [pin, title, description, avatar, avatarBackground, updateAt, model, group] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;

      return [
        sessionHelpers.getSessionPinned(session),
        sessionMetaSelectors.getTitle(meta),
        sessionMetaSelectors.getDescription(meta),
        sessionMetaSelectors.getAvatar(meta),
        meta.backgroundColor,
        session?.updatedAt,
        session.model,
        session?.group,
      ];
    });

  const showModel = model !== defaultModel;

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

  return (
    <>
      <ListItem
        actions={actions}
        active={active}
        addon={addon}
        avatar={avatar}
        avatarBackground={avatarBackground}
        date={updateAt?.valueOf()}
        description={description}
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
