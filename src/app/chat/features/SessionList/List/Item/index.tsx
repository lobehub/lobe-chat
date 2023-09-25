import { SiOpenai } from '@icons-pack/react-simple-icons';
import { Avatar, List, Tag } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { createStyles, useResponsive } from 'antd-style';
import { memo, useMemo, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { globalSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

import Actions from './Actions';

const { Item } = List;

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      position: relative;
    `,

    modalRoot: css`
      z-index: 2000;
    `,
  };
});

interface SessionItemProps {
  id: string;
}

const SessionItem = memo<SessionItemProps>(({ id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const { mobile } = useResponsive();
  const { styles } = useStyles();
  const [defaultModel] = useGlobalStore((s) => [globalSelectors.defaultAgentConfig(s).model]);

  const [
    active,
    loading,
    pin,
    title,
    description,
    systemRole,
    avatar,
    avatarBackground,
    updateAt,
    model,
  ] = useSessionStore((s) => {
    const session = sessionSelectors.getSessionById(id)(s);
    const meta = session.meta;
    const systemRole = session.config.systemRole;

    return [
      s.activeId === id,
      !!s.chatLoadingId && id === s.activeId,
      session.pinned,
      agentSelectors.getTitle(meta),
      agentSelectors.getDescription(meta),
      systemRole,
      agentSelectors.getAvatar(meta),
      meta.backgroundColor,
      session?.updateAt,
      session.config.model,
    ];
  });

  const showModel = model !== defaultModel;

  const actions = useMemo(() => <Actions id={id} setOpen={setOpen} />, [id]);

  const avatarRender = useMemo(
    () => (
      <Avatar
        animation={isHovering}
        avatar={avatar}
        background={avatarBackground}
        shape="circle"
        size={46}
      />
    ),
    [isHovering, avatar, avatarBackground],
  );

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
    <Item
      actions={actions}
      // needn't active state in mobile
      active={mobile ? false : active}
      addon={addon}
      avatar={avatarRender}
      className={styles.container}
      date={updateAt}
      description={description || systemRole}
      loading={loading}
      pin={pin}
      ref={ref}
      showAction={open || isHovering}
      title={title}
    />
  );
}, shallow);

export default SessionItem;
