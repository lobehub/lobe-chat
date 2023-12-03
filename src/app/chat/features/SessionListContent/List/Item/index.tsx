import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Tag } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/chat';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

import ListItem from '../../ListItem';
import Actions from './Actions';

interface SessionItemProps {
  id: string;
}

const SessionItem = memo<SessionItemProps>(({ id }) => {
  const [open, setOpen] = useState(false);

  const [defaultModel] = useGlobalStore((s) => [settingsSelectors.defaultAgentConfig(s).model]);
  const [active] = useSessionStore((s) => [s.activeId === id]);
  const [loading] = useChatStore((s) => [!!s.chatLoadingId && id === s.activeId]);

  const [pin, title, description, systemRole, avatar, avatarBackground, updateAt, model] =
    useSessionStore((s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;
      const systemRole = session.config.systemRole;

      return [
        sessionHelpers.getSessionPinned(session),
        agentSelectors.getTitle(meta),
        agentSelectors.getDescription(meta),
        systemRole,
        agentSelectors.getAvatar(meta),
        meta.backgroundColor,
        session?.updatedAt,
        session.config.model,
      ];
    });

  const showModel = model !== defaultModel;

  const actions = useMemo(() => <Actions id={id} setOpen={setOpen} />, [id]);

  const addon = useMemo(
    () =>
      !showModel ? undefined : (
        <Flexbox gap={4} horizontal style={{ flexWrap: 'wrap' }}>
          {showModel && <Tag icon={<SiOpenai size={'1em'} />}>{model}</Tag>}
        </Flexbox>
      ),
    [showModel, model],
  );

  return (
    <ListItem
      actions={actions}
      active={active}
      addon={addon}
      avatar={avatar}
      avatarBackground={avatarBackground}
      date={updateAt}
      description={description || systemRole}
      loading={loading}
      pin={pin}
      showAction={open}
      title={title}
    />
  );
}, shallow);

export default SessionItem;
