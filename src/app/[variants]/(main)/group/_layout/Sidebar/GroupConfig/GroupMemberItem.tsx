'use client';

import { Avatar, Text } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR } from '@/const/meta';

import { useStyles } from './style';

interface GroupMemberItemProps {
  actions?: ReactNode;
  avatar?: string;
  background?: string;
  onClick?: () => void;
  showActionsOnHover?: boolean;
  title: string;
}

const GroupMemberItem = memo<GroupMemberItemProps>(
  ({ title, avatar, background, onClick, actions, showActionsOnHover = true }) => {
    const { styles } = useStyles();

    return (
      <Flexbox className={styles.memberItem} horizontal justify={'space-between'}>
        <Flexbox
          align={'center'}
          flex={1}
          gap={8}
          horizontal
          onClick={onClick}
          style={{ overflow: 'hidden' }}
        >
          <Avatar
            avatar={avatar || DEFAULT_AVATAR}
            background={background}
            size={20}
            style={{ flex: 'none' }}
          />
          <Text ellipsis style={{ fontSize: 14 }}>
            {title}
          </Text>
        </Flexbox>
        {actions !== undefined && (
          <Flexbox className={showActionsOnHover ? 'show-on-hover' : undefined} gap={4} horizontal>
            {actions}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default GroupMemberItem;
