import { Avatar, List, ListItemProps } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { Dropdown } from 'antd';
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
  ({ avatar, avatarBackground, active, showAction, actions, ...props }) => {
    const ref = useRef(null);
    const isHovering = useHover(ref);
    const { mobile } = useResponsive();
    const { styles } = useStyles();

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
        className={styles.container}
        ref={ref}
        showAction={actions && (isHovering || showAction || mobile)}
        {...(props as any)}
      >
        <Dropdown
          arrow={false}
          // menu={{
          //   items,
          //   onClick: ({ domEvent }) => {
          //     domEvent.stopPropagation();
          //   },
          // }}
          // onOpenChange={setOpen}
          // trigger={['contextMenu']}
          trigger={['click']}
        >
          <div style={{ 
            width: '100%', 
            height: '100%', 
            top: 0,
            left: 0,
            position: 'absolute',
          }}/>
        </Dropdown>
      </Item>
    );
  },
);

export default ListItem;
