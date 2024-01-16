import { Avatar, List, ListItemProps } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { createStyles, useResponsive } from 'antd-style';
import { memo, useMemo, useRef } from 'react';

const { Item } = List;

const useStyles = createStyles(({ css, token, responsive }) => {
  return {
    container: css`
      position: relative;

      margin-block: 2px;
      padding-right: 16px;
      padding-left: 8px;

      border-radius: ${token.borderRadius}px;
      ${responsive.mobile} {
        margin-block: 0;
        padding-left: 12px;
        border-radius: 0;
      }
    `,
  };
});

const ListItem = memo<ListItemProps & { avatar: string; avatarBackground?: string }>(
  ({ avatar, avatarBackground, active, className, ...props }) => {
    const ref = useRef(null);
    const isHovering = useHover(ref);
    const { mobile } = useResponsive();
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
        active={mobile ? false : active}
        avatar={avatarRender}
        className={cx(styles.container, className)}
        ref={ref}
        {...(props as any)}
      />
    );
  },
);

export default ListItem;
