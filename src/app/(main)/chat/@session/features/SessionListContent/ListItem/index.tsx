import { Avatar, List, ListItemProps } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { createStyles } from 'antd-style';
import { memo, useMemo, useRef } from 'react';

import { useServerConfigStore } from '@/store/serverConfig';

const { Item } = List;

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      position: relative;
      margin-block: 2px;
      padding-inline: 8px 16px;
      border-radius: ${token.borderRadius}px;
    `,
    mobile: css`
      margin-block: 0;
      padding-inline-start: 12px;
      border-radius: 0;
    `,
    title: css`
      line-height: 1.2;
    `,
  };
});

const ListItem = memo<ListItemProps & { avatar: string; avatarBackground?: string }>(
  ({ avatar, avatarBackground, active, showAction, actions, title, ...props }) => {
    const ref = useRef(null);
    const isHovering = useHover(ref);
    const mobile = useServerConfigStore((s) => s.isMobile);
    const { cx, styles } = useStyles();

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

    return (
      <Item
        actions={actions}
        active={mobile ? false : active}
        avatar={avatarRender}
        className={cx(styles.container, mobile && styles.mobile)}
        ref={ref}
        showAction={actions && (isHovering || showAction || mobile)}
        title={<span className={styles.title}>{title}</span>}
        {...(props as any)}
      />
    );
  },
);

export default ListItem;
